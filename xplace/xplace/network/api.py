import uuid

from django.db import transaction

from rest_framework import viewsets
from rest_framework.exceptions import ValidationError
from rest_framework.response import Response
from rest_framework.settings import api_settings

from xplace.base import permissions
from xplace.base.exceptions import StateException
from xplace.base.mixins import AtomicViewSetMixin
from xplace.base.users import filter_queryset_owner
from xplace.network import models, tasks, serializers


class ReverseProxyViewSet(AtomicViewSetMixin, viewsets.ModelViewSet):
    permission_classes = (permissions.IsSuperUser,)
    serializer_class = serializers.ReverseProxySerializer
    queryset = models.ReverseProxy.objects.all()


class DomainViewSet(AtomicViewSetMixin, viewsets.ModelViewSet):

    @transaction.atomic()
    def perform_destroy(self, instance):
        event_id = str(uuid.uuid4().hex)

        try:
            instance.change_state(
                models.DomainState.DELETING, event_id=event_id)
        except StateException as exc:
            raise ValidationError({
                api_settings.NON_FIELD_ERRORS_KEY: [exc.message]
            })

        transaction.on_commit(
            lambda: tasks.delete_backends.apply_async(
                args=(str(instance.id),),
                task_id=event_id
            )
        )

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        serializer = self.get_serializer(instance)
        self.perform_destroy(instance)
        return Response(serializer.data)

    def get_serializer_class(self):
        if self.action in ('update', 'partial_update'):
            return serializers.DomainUpdateSerializer

        return serializers.DomainSerializer

    def get_queryset(self):
        user = self.request.user

        queryset = models.Domain.objects.all()

        return filter_queryset_owner(
            queryset, user).optimized().order_by('-created_at')
