from rest_framework.exceptions import ValidationError
from rest_framework import serializers

from xplace.base.utils import generate_random_token
from xplace.base.validators import validate_ascii
from ..models import Container, Host


# TODO: https://github.com/InterSIS/django-rest-serializer-field-permissions/blob/master/rest_framework_serializer_field_permissions/serializers.py

class FieldPermissionSerializerMixin(object):
    """
    Mixin to your serializer class as follows:
        class PersonSerializer(FieldPermissionSerializerMixin, serializers.ModelSerializer):
            family_names = fields.CharField(permission_classes=(IsAuthenticated(), ))
            given_names = fields.CharField(permission_classes=(IsAuthenticated(), ))
    """

    @property
    def fields(self):
        """
        Supercedes drf's serializers.ModelSerializer's fields property
        :return: a set of permission-scrubbed fields
        """
        ret = super(FieldPermissionSerializerMixin, self).fields
        request = self._context["request"]

        for field_name, field in ret.items():
            if hasattr(field, 'check_permission') and (not field.check_permission(request)):
                ret.pop(field_name)

        return ret


class SuperUserValidator:
    def __init__(self):
        self.request = None
        self.field_name = None

    def __call__(self, value):
        if value:
            is_superuser = self.request is not None and \
                           self.request.user is not None and self.request.user.is_superuser

            if not is_superuser:
                raise ValidationError({
                    self.field_name: 'Insufficient permissions to set this field'
                }, code='permission_required')

    def set_context(self, serializer):
        self.request = serializer.context.get('request')
        self.field_name = serializer.source_attrs[-1]


class CreateOnlyValidator:
    def __init__(self):
        self.instance = None
        self.field_name = None

    def __call__(self, value):
        prev_value = getattr(self.instance, self.field_name, None)

        if prev_value != value:
            raise ValidationError({
                self.field_name: 'Can not update this field'
            }, code='permission_required')

    def set_context(self, serializer_field):
        self.instance = getattr(serializer_field.parent, 'instance', None)
        self.field_name = serializer_field.source_attrs[-1]


class HostSerializer(serializers.ModelSerializer):
    class Meta:
        model = Host
        fields = [
            'id', 'created_at', 'modified_at',
            'hostname', 'ram', 'disk_size',
            'num_cpus', 'public_ipv4', 'lvm_vgname',
            'default_cpus', 'ssh_port_add'
        ]


class ContainerSerializer(serializers.ModelSerializer):
    image_name = serializers.SerializerMethodField()

    def get_image_name(self, obj):
        return obj.image.name

    class Meta:
        model = Container
        fields = ['id', 'image', 'ram', 'disk_size', 'num_cpus', 'name',
                  'hostname', 'state', 'username', 'private_ipv4',
                  'public_ipv4', 'host', 'user', 'cpus', 'ssh_port',
                  'image_name']
        extra_kwargs = {
            'created_at': {'read_only': True},
            'modified_at': {'read_only': True},
            'state': {'read_only': True},
            'private_ipv4': {'read_only': True},
            'public_ipv4': {'read_only': True},
            'username': {'read_only': True},
            'image': {
                'validators': [CreateOnlyValidator()],
            },
            'disk_size': {
                'validators': [CreateOnlyValidator()],
            },
            'hostname': {
                'read_only': True,
            },
            'host': {
                'validators': [SuperUserValidator()],
                'required': False,
                'allow_null': True,
            },
            'user': {
                'validators': [SuperUserValidator()],
                'required': False,
                'allow_null': True,
            },
            'cpus': {
                'validators': [SuperUserValidator()],
                'required': False,
                'allow_null': True,
            },
        }

    def validate_name(self, value):
        validate_ascii(value)
        return value.lower().strip()

    def create(self, validated_data):
        user = validated_data.get('user')
        if user is None:
            validated_data['user'] = self.context['request'].user

        host = validated_data.get('host')
        if host is None:
            host = Host.objects.first()
        if host is None:
            raise ValidationError({'host': 'No suitable host found'})
        validated_data['host'] = host

        cpus = validated_data.get('cpus')
        if cpus is None:
            validated_data['cpus'] = host.default_cpus

        token = generate_random_token(character_length=5)
        validated_data['hostname'] = '{}-{}'.format(validated_data['name'], token)

        return super().create(validated_data)
