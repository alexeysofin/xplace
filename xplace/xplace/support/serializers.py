from django.utils import timezone
from rest_framework import serializers

from xplace.base import serializers as base_serializers, permissions
from xplace.support import models
from xplace.users import models as user_models


class TicketSerializer(base_serializers.PermissionSerializerMixin,
                       serializers.ModelSerializer):

    status = serializers.ChoiceField(
        choices=models.TicketStatus.choices, read_only=True)
    user_email = serializers.SerializerMethodField()
    user = serializers.PrimaryKeyRelatedField(read_only=True)

    def get_user_email(self, obj):
        return obj.user.email

    assignee_email = serializers.SerializerMethodField()

    def get_assignee_email(self, obj):
        if obj.assignee is not None:
            return obj.assignee.email

    container_hostname = serializers.SerializerMethodField()

    def get_container_hostname(self, obj):
        if obj.container is not None:
            return obj.container.hostname

    domain_name = serializers.SerializerMethodField()

    def get_domain_name(self, obj):
        if obj.domain is not None:
            return obj.domain.name

    permissions = {
        'user': permissions.IsSuperUser(),
        'user_email': permissions.IsSuperUser(),
    }

    class Meta:
        model = models.Ticket
        fields = '__all__'
        extra_kwargs = {
            'created_at': {'read_only': True},
            'modified_at': {'read_only': True},
            'closed_at': {'read_only': True},
            'code': {'read_only': True},
        }


class TicketCreateSerializer(TicketSerializer):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        user = self.context['request'].user

        if not user.is_superuser:
            self.fields['due_date'].read_only = True
            # TODO: allowed non-superuser users to close issues.
            self.fields['status'].read_only = True

            self.fields['domain'].queryset = \
                self.fields['domain'].queryset.filter(user=user)
            self.fields['container'].queryset = \
                self.fields['container'].queryset.filter(user=user)

    user = serializers.PrimaryKeyRelatedField(
        queryset=user_models.User.objects.all(), required=False)

    class Meta(TicketSerializer.Meta):
        extra_kwargs = {
            **TicketSerializer.Meta.extra_kwargs,
            'status': {'read_only': True}
        }

    def create(self, validated_data):
        user = validated_data.get('user')
        if user is None:
            user = self.context['request'].user
            validated_data['user'] = user

        return super().create(validated_data)


class TicketUpdateSerializer(TicketCreateSerializer):
    status = serializers.ChoiceField(
        choices=models.TicketStatus.choices)

    user = serializers.PrimaryKeyRelatedField(
        queryset=user_models.User.objects.all(), required=False)

    def update(self, instance, validated_data):
        # user
        user = validated_data.get('user')
        if 'user' in validated_data and user is None:
            user = self.context['request'].user
            validated_data['user'] = user

        status = validated_data.get('status')
        # in partial update may status may not be present
        if 'status' in validated_data:
            if status == models.TicketStatus.CLOSED:
                instance.closed_at = timezone.now()
            else:
                instance.closed_at = None

        return super().update(instance, validated_data)


# TODO: maybe leave one serializer
# TODO: (queryset is not evaluated in read only requests)

class TicketCommentSerializer(base_serializers.PermissionSerializerMixin,
                              serializers.ModelSerializer):
    user_email = serializers.SerializerMethodField()

    is_author = serializers.SerializerMethodField()

    def get_user_email(self, obj):
        return obj.user.email

    def get_is_author(self, obj):
        return obj.user_id == self.context['request'].user.id

    class Meta:
        model = models.TicketComment
        fields = '__all__'

        extra_kwargs = {
            'created_at': {'read_only': True},
            'modified_at': {'read_only': True},
            'user': {'read_only': True},
        }


class TicketCommentCreateUpdateSerializer(TicketCommentSerializer):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)

        user = self.context['request'].user

        if not user.is_superuser:
            self.fields['ticket'].queryset = \
                self.fields['ticket'].queryset.filter(user=user)

    def create(self, validated_data):
        # user
        validated_data['user'] = self.context['request'].user
        return super().create(validated_data)
