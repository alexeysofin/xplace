from django.conf import settings
from django.contrib.auth import authenticate, user_logged_in
from django.contrib.auth.password_validation import validate_password
from django.core import exceptions as django_exceptions
from django.core import signing
from django.db import transaction

from rest_framework import serializers

from xplace.base.utils import normalize_email
from xplace.users import models, verification
from xplace.users.account import tasks


class RegistrationSerializer(serializers.ModelSerializer):
    password_repeat = serializers.CharField(
        required=True, allow_blank=False, allow_null=False, write_only=True
    )

    class Meta:
        model = models.User
        extra_kwargs = {
            'password': {'write_only': True},
            'email': {'validators': [], 'write_only': True},
            'language': {'write_only': True},
        }
        fields = ['email', 'language', 'password', 'password_repeat']

    def validate_password(self, password):
        try:
            validate_password(password)
        except django_exceptions.ValidationError as exc:
            raise serializers.ValidationError(exc.messages)
        return password

    def validate(self, attrs):
        password = attrs['password']
        password_repeat = attrs['password_repeat']

        if password != password_repeat:
            raise serializers.ValidationError(
                {'password_repeat': ['Password must match']}
            )

        return attrs

    def create(self, validated_data):
        validated_data.pop('password_repeat')
        password = validated_data.pop('password')
        email = validated_data.pop('email')

        try:
            with transaction.atomic():
                user = models.User.objects.create_user(
                    email, password, is_email_verified=False,
                    **validated_data)

        except models.IntegrityError:
            user = models.User.objects.select_for_update().get(
                email=email)

            if user.is_email_verified:
                raise serializers.ValidationError(
                    {'email': ['A user with that email already exists.']})

            for k, v in validated_data.items():
                setattr(user, k, v)
                user.save(update_fields=list(validated_data.keys()))

        link = self.context['request'].build_absolute_uri(
            '{}?token={}'.format(
                settings.SIGNUP_CONFIRMATION_PATH,
                verification.get_email_verification_token(user))
        )

        transaction.on_commit(
            lambda: tasks.send_registration_link.delay(user.email, link)
        )

        return user


class ResetPasswordTokenCreateSerializer(serializers.Serializer):
    email = serializers.EmailField(
        required=True, allow_blank=False, allow_null=False, write_only=True)

    def update(self, instance, validated_data):
        return instance

    def create(self, validated_data):
        email = normalize_email(validated_data['email'])

        try:
            user = models.User.objects.get(email=email)
        except models.User.DoesNotExist:
            raise serializers.ValidationError(
                {'email': ['User with this email does not exist']})
        else:
            link = verification.get_reset_password_link(
                self.context['request'], user)

            transaction.on_commit(
                lambda: tasks.send_reset_password_link.delay(
                    user.email, link)
            )

        return user


class ProfilePasswordSerializer(serializers.ModelSerializer):
    class Meta:
        model = models.User
        fields = ['current_password', 'password', 'password_repeat']

    current_password = serializers.CharField(
        required=True, allow_blank=False, allow_null=False, write_only=True
    )

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
        current_password = attrs.get('current_password')

        password = attrs.get('password')
        password_repeat = attrs.get('password_repeat')

        if password and password != password_repeat:
            raise serializers.ValidationError(
                {'password_repeat': ['Password must match']}
            )

        if current_password and password and password_repeat:
            pass_ok = self.instance.check_password(current_password)

            if not pass_ok:
                raise serializers.ValidationError(
                    {'current_password': ['Invalid credentials']}
                )

        return attrs

    def update(self, instance, validated_data):
        password = validated_data.pop('password', None)
        validated_data.pop('password_repeat', None)

        if password:
            instance.set_password(password)
            instance.save()

        return instance


class ProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = models.User
        extra_kwargs = {
            'id': {'read_only': True},
            'email': {'read_only': True},
            'last_login': {'read_only': True},
            'date_joined': {'read_only': True},
            'available_ram': {'read_only': True},
            'available_disk_size': {'read_only': True},
            'is_superuser': {'read_only': True},
        }
        fields = [
            'id', 'email', 'first_name', 'last_name',
            'last_login', 'date_joined', 'language',
            'available_ram', 'used_ram', 'available_disk_size',
            'used_disk_size', 'is_superuser']


class AuthTokenCreateSerializer(serializers.ModelSerializer):
    default_error_messages = {
        'wrong_credentials': 'Wrong credentials'
    }
    email = serializers.EmailField(
        required=True, allow_blank=False, allow_null=False, write_only=True)
    password = serializers.CharField(
        required=True, allow_null=False, allow_blank=False, write_only=True)

    user = ProfileSerializer(read_only=True)

    class Meta:
        model = models.AuthToken
        fields = ['email', 'password', 'token', 'expires', 'user']
        extra_kwargs = {
            'token': {'read_only': True},
            'expires': {'read_only': True}
        }
        validators = []

    def validate(self, attrs):
        email = attrs['email'].strip().lower()

        user = authenticate(
            self.context['request'], email=email, password=attrs['password'])

        if user is None or not user.is_active or not user.is_email_verified:
            self.fail('wrong_credentials')

        attrs['user'] = user

        return attrs

    def create(self, validated_data):
        user = validated_data['user']
        user_logged_in.send(sender=user.__class__,
                            request=self.context['request'], user=user)

        # TODO: create event

        return super().create({'user': user})


class PasswordResetSerializer(serializers.ModelSerializer):
    class Meta:
        model = models.AuthToken
        fields = ['token', 'password', 'password_repeat', 'user']
    token = serializers.CharField(
        max_length=1024, required=True)

    password = serializers.CharField(
        required=True, allow_blank=False, allow_null=False, write_only=True
    )
    password_repeat = serializers.CharField(
        required=True, allow_blank=False, allow_null=False, write_only=True
    )

    user = ProfileSerializer(read_only=True)

    def validate_password(self, password):
        try:
            validate_password(password)
        except django_exceptions.ValidationError as exc:
            raise serializers.ValidationError(exc.messages)
        return password

    def validate(self, attrs):
        password = attrs['password']
        password_repeat = attrs['password_repeat']

        if password != password_repeat:
            raise serializers.ValidationError(
                {'password_repeat': ['Password must match']}
            )

        try:
            user, _ = verification.check_reset_password_token(attrs['token'])
            attrs['user'] = user
        except signing.BadSignature:
            raise serializers.ValidationError(
                {'token': ['Invalid verification token']})

        return attrs

    def update(self, instance, validated_data):
        return instance

    def create(self, validated_data):
        user = validated_data['user']

        user.set_password(validated_data['password'])
        user.is_email_verified = True
        user.save(update_fields=['password', 'is_email_verified'])

        # TODO: create event

        transaction.on_commit(
            lambda: tasks.send_reset_password_notification.delay(user.email)
        )

        user_logged_in.send(sender=user.__class__,
                            request=self.context['request'], user=user)

        return super().create({'user': user})


class EmailVerificationSerializer(serializers.ModelSerializer):
    token = serializers.CharField(max_length=1024, required=True)
    user = ProfileSerializer(read_only=True)

    class Meta:
        model = models.AuthToken
        fields = ['token', 'user']

    def validate(self, attrs):
        err = {'token': ['Invalid verification token']}

        try:
            user_id = verification.check_verification_token(
                attrs['token'])['user_id']

            user = models.User.objects.get(
                id=user_id)

            if user.is_email_verified:
                raise serializers.ValidationError(err)

            attrs['user'] = user

        except (signing.BadSignature, models.User.DoesNotExist):
            raise serializers.ValidationError(err)

        return attrs

    def create(self, validated_data):
        user = validated_data['user']

        user.is_email_verified = True
        user.save(update_fields=['is_email_verified'])

        transaction.on_commit(
            lambda: tasks.send_welcome.delay(user.email)
        )

        user_logged_in.send(sender=user.__class__,
                            request=self.context['request'], user=user)

        return super().create({'user': user})
