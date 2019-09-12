import string
import uuid

from django.conf import settings
from django.db import transaction

from rest_framework import serializers
from rest_framework.settings import api_settings

from xplace.base.exceptions import StateException
from xplace.base.utils import generate_random_token
from xplace.base.validators import validate_ascii
from xplace.base import permissions, serializers as base_serializers
from xplace.compute import models, tasks, const
from xplace.compute.cpus import num_cpus
from xplace.users import models as user_models


class HostSerializer(serializers.ModelSerializer):
    class Meta:
        model = models.Host
        fields = '__all__'


class RamSizeSerializer(serializers.ModelSerializer):
    class Meta:
        model = models.RamSize
        fields = '__all__'


class DiskSizeSerializer(serializers.ModelSerializer):
    class Meta:
        model = models.DiskSize
        fields = '__all__'


class ImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = models.Image
        fields = '__all__'


class ContainerEventSerializer(serializers.ModelSerializer):
    class Meta:
        model = models.ContainerEvent
        fields = '__all__'


def get_user_ssh_keys(user):
    return user.ssh_keys.all()


def get_ram_size_choices():
    return [(ram.size, '{} MB'.format(ram.size))
            for ram in models.RamSize.objects.all()]


def get_disk_size_choices():
    return [(disk_size.size, '{} GB'.format(disk_size.size))
            for disk_size in models.DiskSize.objects.all()]


def check_resources(user, ram=None, disk_size=None, available_ram=None,
                    available_disk_size=None):

    # lock a user to check their resources
    user_models.User.objects.select_for_update().filter(
        id=user.id)

    if not user.is_superuser:
        errors = {}

        if ram is not None:
            if available_ram is None:
                available_ram = user.available_ram
            left_ram = available_ram - user.used_ram - ram
            if left_ram < 0:
                errors['ram'] = '{} MB lacks'.format(abs(left_ram))

        if disk_size is not None:
            if available_disk_size is None:
                available_disk_size = user.available_disk_size
            left_disk_size = available_disk_size - user.used_disk_size - disk_size
            if left_disk_size < 0:
                errors['disk_size'] = '{} GB lacks'.format(
                    abs(left_disk_size))

        if errors:
            raise serializers.ValidationError(
                errors
            )


class ContainerSerializer(base_serializers.PermissionSerializerMixin,
                          serializers.ModelSerializer):
    permissions = {
        'user': permissions.IsSuperUser(),
        'cpus': permissions.IsSuperUser(),
        'host': permissions.IsSuperUser(),
        'user_email': permissions.IsSuperUser(),
        'host_hostname': permissions.IsSuperUser(),
    }

    event_id = serializers.CharField(read_only=True)

    image_name = serializers.SerializerMethodField()
    user_email = serializers.SerializerMethodField()
    host_hostname = serializers.SerializerMethodField()
    host_public_ipv4 = serializers.SerializerMethodField()

    # read only fields (overridden in create/update serializers)
    user = serializers.PrimaryKeyRelatedField(read_only=True)
    cpus = serializers.CharField(read_only=True)
    ram = serializers.IntegerField(read_only=True)
    disk_size = serializers.IntegerField(read_only=True)
    name = serializers.CharField(read_only=True)
    host = serializers.PrimaryKeyRelatedField(read_only=True)
    image = serializers.PrimaryKeyRelatedField(read_only=True)

    num_cpus = serializers.SerializerMethodField()

    def get_num_cpus(self, obj):
        return obj.num_cpus

    def get_image_name(self, obj):
        return obj.image.name

    def get_host_hostname(self, obj):
        return obj.host.hostname

    def get_host_public_ipv4(self, obj):
        return obj.host.public_ipv4

    def get_user_email(self, obj):
        return obj.user.email

    def validate_name(self, name):
        validate_ascii(name)
        return name.lower().strip()

    def validate_disk_size(self, disk_size):
        exists = models.DiskSize.objects.filter(size=disk_size).exists()
        if not exists:
            raise serializers.ValidationError('Invalid disk size')
        return disk_size

    def validate_ram(self, ram):
        exists = models.RamSize.objects.filter(size=ram).exists()
        if not exists:
            raise serializers.ValidationError('Invalid ram size')
        return ram

    def validate_cpus(self, cpus):
        try:
            num_cpus(cpus)
        except ValueError:
            raise serializers.ValidationError('Invalid cpus value')

        return cpus

    class Meta:
        model = models.Container
        fields = ['id', 'image', 'ram', 'disk_size', 'num_cpus', 'name',
                  'hostname', 'state', 'private_ipv4',
                  'public_ipv4', 'ssh_port',
                  'image_name', 'host', 'user', 'cpus', 'event_id',
                  'user_email', 'host_hostname', 'host_public_ipv4', 'num_cpus']
        extra_kwargs = {
            'created_at': {'read_only': True},
            'modified_at': {'read_only': True},
            'hostname': {'read_only': True},
            'state': {'read_only': True},
            'private_ipv4': {'read_only': True},
            'public_ipv4': {'read_only': True},
        }


class ContainerCreateSerializer(ContainerSerializer):
    user = serializers.PrimaryKeyRelatedField(
        queryset=user_models.User.objects.all(), required=False)
    cpus = serializers.CharField(max_length=16, required=False)
    ram = serializers.IntegerField(required=True)
    disk_size = serializers.IntegerField(required=True)
    name = serializers.CharField(required=True)
    host = serializers.PrimaryKeyRelatedField(
        queryset=models.Host.objects.all(), required=True)
    image = serializers.PrimaryKeyRelatedField(
        queryset=models.Image.objects.all(), required=True)

    class Meta(ContainerSerializer.Meta):
        fields = ContainerSerializer.Meta.fields + ['ssh_keys']

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.fields['ssh_keys'].choices = [
            (str(key.id), key.name) for key in
            get_user_ssh_keys(self.context['request'].user)
        ]

    ssh_keys = serializers.MultipleChoiceField(
        required=False, choices=(), write_only=True)

    def create(self, validated_data):
        check_resources(
            self.context['request'].user,
            ram=validated_data['ram'],
            disk_size=validated_data['disk_size'])

        host = validated_data.get('host')
        if host is None:
            host = models.Host.objects.first()
            if host is None:
                raise serializers.ValidationError('No suitable host found')

            validated_data['host'] = host

        validated_data['hostname'] = '{}-{}'.format(
            validated_data.get('name'),
            generate_random_token(
                5, choices=string.digits + string.ascii_lowercase)
        )

        cpus = validated_data.get('cpus')
        if not cpus:
            validated_data['cpus'] = host.default_cpus

        user = validated_data.get('user')
        if user is None:
            user = self.context['request'].user
            validated_data['user'] = user

        validated_data['event_id'] = event_id = str(uuid.uuid4().hex)

        ssh_keys = list(validated_data.pop('ssh_keys', []))

        instance = super().create(validated_data)

        transaction.on_commit(
            lambda: tasks.create_container.apply_async(
                args=(str(instance.id),),
                kwargs={
                    'ssh_keys': ssh_keys
                },
                task_id=event_id
            )
        )

        return instance

    def update(self, instance, validated_data):
        raise NotImplementedError()


class ContainerUpdateSerializer(ContainerSerializer):
    user = serializers.PrimaryKeyRelatedField(
        queryset=user_models.User.objects.all(), required=False)
    cpus = serializers.CharField(max_length=16, required=False)
    ram = serializers.IntegerField(required=True)
    name = serializers.CharField(required=True)

    class Meta(ContainerSerializer.Meta):
        fields = ContainerSerializer.Meta.fields + ['action', 'restore']

    action = serializers.ChoiceField(choices=(
        ('backup', 'backup'),
    ), required=False, write_only=True)

    restore = serializers.UUIDField(
        write_only=True, required=False)

    def validate_restore(self, backup_id):
        if backup_id:
            try:
                return models.Backup.objects.get(
                    container=self.instance, id=backup_id)
            except models.Backup.DoesNotExist:
                raise serializers.ValidationError('backup not found')

    def create(self, validated_data):
        raise NotImplementedError()

    def update(self, instance, validated_data):
        # 1. put update superuser
        # 2. patch update superuser
        # 3. put update user
        # 4. patch update user

        action = validated_data.get('action')
        restore = validated_data.get('restore')

        if restore is not None:
            event_id = str(uuid.uuid4().hex)

            try:
                instance.change_state(
                    models.ContainerState.RESTORING, event_id=event_id)
            except StateException as ex:
                raise serializers.ValidationError({
                    api_settings.NON_FIELD_ERRORS_KEY: [ex.message]
                })

            try:
                restore.change_state(models.BackupState.RESTORING)
            except StateException as ex:
                raise serializers.ValidationError({
                    'restore': [ex.message]
                })

            transaction.on_commit(
                lambda: tasks.restore_from_backup.apply_async(
                    args=(str(restore.id),),
                    task_id=event_id
                )
            )

            return instance

        # TODO: maybe move to another api action if parameters added
        # can not make a standalone create api view
        # (container response is required)
        elif action == 'backup':
            if instance.backups.all().count() >= settings.MAX_BACKUPS:
                raise serializers.ValidationError({
                    api_settings.NON_FIELD_ERRORS_KEY: [
                        '{} max backups per container is allowed, '
                        'please, delete one of your backups'.format(
                            settings.MAX_BACKUPS)]
                })

            event_id = str(uuid.uuid4().hex)

            try:
                instance.change_state(
                    models.ContainerState.BACKING_UP, event_id=event_id)
            except StateException as ex:
                raise serializers.ValidationError({
                    api_settings.NON_FIELD_ERRORS_KEY: [ex.message]
                })

            backup = models.Backup.objects.create(
                container=instance,
            )

            transaction.on_commit(
                lambda: tasks.create_container_backup.apply_async(
                    args=(str(backup.id),),
                    task_id=event_id
                )
            )

            return instance

        # PATCH requests

        user = validated_data.get('user')
        if 'user' in validated_data and user is None:
            user = self.context['request'].user
            validated_data['user'] = user

        ram = validated_data.get('ram')
        if ram is not None:
            check_resources(self.context['request'].user,
                            ram=ram,
                            available_ram=
                            instance.user.available_ram+instance.ram)

            event_id = str(uuid.uuid4().hex)
            prev_state = instance.state

            try:
                instance.change_state(
                    models.ContainerState.UPDATING, event_id=event_id)
            except StateException as exc:
                raise serializers.ValidationError({
                    api_settings.NON_FIELD_ERRORS_KEY: [exc.message]
                })

            transaction.on_commit(lambda:
                                  tasks.update_container.apply_async(
                                      args=(str(instance.id),),
                                      kwargs={
                                          'return_to_state': prev_state
                                      },
                                      task_id=event_id
                                  ))

            return super().update(instance, validated_data)

        return instance


class ContainerStateSerializer(ContainerSerializer):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)

        for k, v in self.fields.items():
            if k != 'action':
                v.read_only = True

    action = serializers.ChoiceField(
        choices=const.PowerAction.CHOICES, write_only=True)

    class Meta(ContainerSerializer.Meta):
        model = models.Container
        fields = ContainerSerializer.Meta.fields + ['action']

    def update(self, instance, validated_data):
        action = validated_data.pop('action')

        target = const.PowerAction.MID_STATE[action]

        try:
            instance.change_state(target)
        except StateException as ex:
            raise serializers.ValidationError({
                api_settings.NON_FIELD_ERRORS_KEY: [ex.message]
            })

        event_id = str(uuid.uuid4().hex)

        validated_data['event_id'] = event_id

        transaction.on_commit(
            lambda: tasks.change_container_state.apply_async(
                args=(str(instance.id), action),
                task_id=event_id
            )
        )

        return super().update(instance, validated_data)


class ContainerStorageSerializer(ContainerSerializer):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)

        for k, v in self.fields.items():
            if k != 'disk_size':
                v.read_only = True

    disk_size = serializers.IntegerField(required=True, allow_null=False)

    def update(self, instance, validated_data):
        disk_size = validated_data['disk_size']
        if disk_size <= instance.disk_size:
            raise serializers.ValidationError({
                'disk_size': "Disk size must be greater than current disk size"
            })

        check_resources(
            self.context['request'].user,
            disk_size=disk_size,
            available_disk_size=
            instance.user.available_disk_size + instance.disk_size
        )

        try:
            instance.change_state(models.ContainerState.RESIZING)
        except StateException as ex:
            raise serializers.ValidationError({
                api_settings.NON_FIELD_ERRORS_KEY: [ex.message]
            })

        event_id = str(uuid.uuid4().hex)

        validated_data['event_id'] = event_id

        transaction.on_commit(
            lambda: tasks.resize_container_storage.apply_async(
                args=(str(instance.id),),
                task_id=event_id
            )
        )

        return super().update(instance, validated_data)


class ContainerPasswordResetSerializer(ContainerSerializer):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)

        for k, v in self.fields.items():
            v.read_only = True

    def update(self, instance, validated_data):
        transaction.on_commit(
            lambda: tasks.reset_container_password.delay(str(instance.id))
        )

        return super().update(instance, validated_data)


class BackupSerializer(serializers.ModelSerializer):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)

        for k, v in self.fields.items():
            v.read_only = True

    class Meta:
        model = models.Backup
        fields = '__all__'
        extra_kwargs = {
            'state': {'read_only': True},
        }
