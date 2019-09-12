import uuid

from django.db import transaction

from rest_framework import serializers
from rest_framework.exceptions import ValidationError
from rest_framework.settings import api_settings

from validators import domain

from xplace.base import serializers as base_serializers
from xplace.base import permissions
from xplace.base.exceptions import StateException
from xplace.network import models, tasks


class ReverseProxySerializer(serializers.ModelSerializer):
    class Meta:
        model = models.ReverseProxy
        fields = '__all__'


class DomainSerializer(base_serializers.PermissionSerializerMixin,
                       serializers.ModelSerializer):

    user_email = serializers.SerializerMethodField()
    reverse_proxy_hostname = serializers.SerializerMethodField()

    reverse_proxy_public_ipv4 = serializers.SerializerMethodField()

    def get_reverse_proxy_public_ipv4(self, obj):
        return obj.reverse_proxy.public_ipv4

    def get_reverse_proxy_hostname(self, obj):
        return obj.reverse_proxy.hostname

    def get_user_email(self, obj):
        return obj.user.email

    permissions = {
        'reverse_proxy': permissions.IsSuperUser(),
        'user': permissions.IsSuperUser(),
        'user_email': permissions.IsSuperUser(),
        'reverse_proxy_hostname': permissions.IsSuperUser(),
    }

    def validate_name(self, name):
        if not domain(name.encode('idna').decode('ascii')):
            raise serializers.ValidationError('Invalid domain name')
        return name.strip().lower()

    def create(self, validated_data):
        reverse_proxy = validated_data.get('reverse_proxy')

        if reverse_proxy is None:
            reverse_proxy = models.ReverseProxy.objects.first()
            if reverse_proxy is None:
                raise serializers.ValidationError('No suitable reverse proxy')

            validated_data['reverse_proxy'] = reverse_proxy

        user = validated_data.get('user')
        if user is None:
            user = self.context['request'].user
            validated_data['user'] = user

        validated_data['event_id'] = event_id = str(uuid.uuid4().hex)

        instance = super().create(validated_data)

        transaction.on_commit(
            lambda: tasks.create_backends.apply_async(
                args=(str(instance.id),),
                task_id=event_id
            )
        )

        return instance

    class Meta:
        model = models.Domain
        fields = '__all__'

        extra_kwargs = {
            'created_at': {'read_only': True},
            'modified_at': {'read_only': True},
            'state': {'read_only': True},
            'user': {'required': False},
            'reverse_proxy': {'required': False}
        }

# TODO: maybe leave one serializer?


class DomainUpdateSerializer(DomainSerializer):
    class Meta(DomainSerializer.Meta):
        extra_kwargs = {
            **DomainSerializer.Meta.extra_kwargs,
            'reverse_proxy': {'read_only': True},
        }

    def update(self, instance, validated_data):
        event_id = str(uuid.uuid4().hex)

        try:
            instance.change_state(
                models.DomainState.UPDATING, event_id=event_id)
        except StateException as exc:
            raise ValidationError({
                api_settings.NON_FIELD_ERRORS_KEY: [exc.message]
            })

        transaction.on_commit(
            lambda: tasks.update_backends.apply_async(
                args=(str(instance.id),),
                task_id=event_id
            )
        )

        return super().update(instance, validated_data)
