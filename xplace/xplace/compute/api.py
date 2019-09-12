import uuid

from django.db import transaction
from rest_framework.decorators import action
from rest_framework import viewsets, mixins
from rest_framework import generics
from rest_framework.exceptions import ValidationError
from rest_framework.renderers import TemplateHTMLRenderer
from rest_framework.response import Response
from rest_framework.settings import api_settings
from rest_framework.viewsets import GenericViewSet

from xplace.base import permissions
from xplace.base.exceptions import StateException
from xplace.base.mixins import AtomicViewSetMixin
from xplace.base.users import filter_queryset_owner
from xplace.compute import serializers, models, tasks, filters


class HostViewSet(AtomicViewSetMixin, viewsets.ModelViewSet):
    permission_classes = (permissions.IsSuperUser,)
    serializer_class = serializers.HostSerializer
    queryset = models.Host.objects.all()


class RamSizeViewSet(AtomicViewSetMixin, viewsets.ModelViewSet):
    permission_classes = (permissions.IsSuperUserOrReadyOnly,)
    serializer_class = serializers.RamSizeSerializer
    queryset = models.RamSize.objects.all()


class DiskSizeSizeViewSet(AtomicViewSetMixin, viewsets.ModelViewSet):
    permission_classes = (permissions.IsSuperUserOrReadyOnly,)
    serializer_class = serializers.DiskSizeSerializer
    queryset = models.DiskSize.objects.all()


class ImageViewSet(AtomicViewSetMixin, viewsets.ModelViewSet):
    permission_classes = (permissions.IsSuperUserOrReadyOnly,)
    serializer_class = serializers.ImageSerializer
    queryset = models.Image.objects.all()


class ContainerEventListAPIView(generics.ListAPIView):
    serializer_class = serializers.ContainerEventSerializer
    filterset_fields = ('container', )

    def get_queryset(self):
        user = self.request.user

        queryset = models.ContainerEvent.objects.all()

        return filter_queryset_owner(
            queryset, user,
            user_kw_name='container__user'
        ).order_by('-created_at')


class BackupViewSet(AtomicViewSetMixin,
                    mixins.RetrieveModelMixin,
                    mixins.DestroyModelMixin,
                    mixins.ListModelMixin,
                    GenericViewSet):

    filterset_fields = ('container', )

    serializer_class = serializers.BackupSerializer

    def get_queryset(self):
        user = self.request.user

        queryset = models.Backup.objects.all()

        return filter_queryset_owner(
            queryset, user,
            user_kw_name='container__user'
        ).order_by('-created_at')

    @transaction.atomic()
    def perform_destroy(self, instance):
        try:
            instance.change_state(models.BackupState.DELETING)
        except StateException as exc:
            raise ValidationError({
                api_settings.NON_FIELD_ERRORS_KEY: [exc.message]
            })

        transaction.on_commit(
            lambda: tasks.delete_backup.apply_async(
                args=(str(instance.id),)
            )
        )


class ContainerViewSet(AtomicViewSetMixin,
                       viewsets.ModelViewSet):
    filterset_class = filters.ContainerFilterSet

    @transaction.atomic()
    def perform_destroy(self, instance):
        event_id = str(uuid.uuid4().hex)

        try:
            instance.change_state(
                models.ContainerState.DELETING, event_id=event_id)
        except StateException as exc:
            raise ValidationError({
                api_settings.NON_FIELD_ERRORS_KEY: [exc.message]
            })

        transaction.on_commit(
            lambda: tasks.delete_container.apply_async(
                args=(str(instance.id),),
                task_id=event_id
            )
        )

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        serializer = self.get_serializer(instance)
        self.perform_destroy(instance)
        return Response(serializer.data)

    def get_serializer(self, *args, **kwargs):
        serializer = super().get_serializer(*args, **kwargs)

        return serializer

    def get_serializer_class(self):
        if self.action == 'create':
            return serializers.ContainerCreateSerializer
        elif self.action in ('update', 'partial_update'):
            return serializers.ContainerUpdateSerializer
        elif self.action == 'state':
            return serializers.ContainerStateSerializer
        elif self.action == 'password':
            return serializers.ContainerPasswordResetSerializer
        elif self.action == 'storage':
            return serializers.ContainerStorageSerializer

        return serializers.ContainerSerializer

    def get_queryset(self):
        user = self.request.user

        queryset = models.Container.objects.all()

        return filter_queryset_owner(
            queryset, user).optimized().order_by('-created_at')

    @action(detail=True, methods=['put'], name='Change container state')
    def state(self, request, pk=None):
        return self.update(request, pk=pk)

    @action(detail=True, methods=['put'], name='Resize container storage')
    def storage(self, request, pk=None):
        return self.update(request, pk=pk)

    @action(detail=True, methods=['put'], name='Reset container password')
    def password(self, request, pk=None):
        return self.update(request, pk=pk)
