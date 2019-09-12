import sshpubkeys

from django.core import exceptions as django_exceptions
from django.contrib.auth.password_validation import validate_password
from django.db import transaction

from rest_framework import serializers

from xplace.users import models, tasks
from xplace.users import verification


class UserSerializer(serializers.ModelSerializer):
    email = serializers.EmailField(read_only=True)

    class Meta:
        model = models.User
        extra_kwargs = {
            'last_login': {'read_only': True},
            'date_joined': {'read_only': True},
            'id': {'read_only': True},
        }
        fields = [
            'id', 'email', 'first_name', 'last_name',
            'last_login', 'date_joined',
            'available_ram', 'used_ram', 'available_disk_size',
            'used_disk_size', 'is_email_verified', 'is_active',
            'is_superuser', 'language', 'is_staff'
        ]

    def create(self, validated_data):
        validated_data['is_email_verified'] = False

        user = super().create(validated_data)

        if not user.is_email_verified:
            print('here')
            link = verification.get_reset_password_link(
                self.context['request'], user)

            transaction.on_commit(
                lambda: tasks.send_invite_confirmation.delay(
                    user.email, link)
            )

        return user


class UserCreateSerializer(UserSerializer):
    email = serializers.EmailField(required=True)


class UserUpdateSerializer(UserSerializer):
    pass


class UserPasswordSerializer(serializers.ModelSerializer):
    class Meta:
        model = models.User
        fields = ['password', 'password_repeat']

    password = serializers.CharField(
        required=True, allow_blank=False, allow_null=False, write_only=True
    )
    password_repeat = serializers.CharField(
        required=True, allow_blank=False, allow_null=False, write_only=True
    )

    def validate_password(self, password):
        try:
            validate_password(password)
        except django_exceptions.ValidationError as exc:
            raise serializers.ValidationError(exc.messages)
        return password

    def validate(self, attrs):
        password = attrs.get('password')
        password_repeat = attrs.get('password_repeat')

        if password and password != password_repeat:
            raise serializers.ValidationError(
                {'password_repeat': ['Password must match']}
            )

        return attrs

    def update(self, instance, validated_data):
        password = validated_data.pop('password', None)
        validated_data.pop('password_repeat', None)

        instance.set_password(password)
        instance.save()

        return instance


class SshKeySerializer(serializers.ModelSerializer):
    class Meta:
        model = models.SshKey
        extra_kwargs = {
            'hash_md5': {'read_only': True}
        }
        fields = ['name', 'public_key', 'id', 'hash_md5', 'created_at',
                  'modified_at']

    def validate(self, attrs):
        public_key = attrs['public_key']

        key = sshpubkeys.SSHKey(public_key)

        try:
            key.parse()
        except sshpubkeys.InvalidKeyException:
            raise serializers.ValidationError({
                'public_key': ['Invalid SSH public key']
            })
        else:
            attrs['hash_md5'] = key.hash_md5().replace('MD5:', '')

        attrs['user'] = self.context['request'].user

        return attrs


class OrganizationSerializer(serializers.ModelSerializer):
    owner_email = serializers.SerializerMethodField()

    def get_owner_email(self, obj):
        return obj.owner.email

    class Meta:
        model = models.Organization
        fields = '__all__'


class OrganizationUserSerializer(serializers.ModelSerializer):
    user_email = serializers.SerializerMethodField()

    def get_user_email(self, obj):
        return obj.user.email

    class Meta:
        model = models.OrganizationUser
        fields = '__all__'
