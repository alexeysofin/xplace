from rest_framework import viewsets
from rest_framework.decorators import action

from xplace.base.mixins import AtomicViewSetMixin
from xplace.users import serializers
from xplace.users import models
from xplace.base import permissions


class UserViewSet(AtomicViewSetMixin, viewsets.ModelViewSet):
    permission_classes = (permissions.IsSuperUser, )
    serializer_class = serializers.UserSerializer
    queryset = models.User.objects.all()

    def get_serializer_class(self):
        if self.action == 'update':
            return serializers.UserUpdateSerializer
        elif self.action == 'password':
            return serializers.UserPasswordSerializer
        return super().get_serializer_class()

    @action(detail=True, methods=['put'], name='Change user password')
    def password(self, request, pk=None):
        return self.update(request, pk=pk)


class SshKeyViewSet(AtomicViewSetMixin, viewsets.ModelViewSet):
    serializer_class = serializers.SshKeySerializer

    def get_queryset(self):
        return models.SshKey.objects.filter(
            user=self.request.user).order_by('-created_at')


class OrganizationViewSet(AtomicViewSetMixin, viewsets.ModelViewSet):
    permission_classes = (permissions.IsSuperUser,)
    serializer_class = serializers.OrganizationSerializer

    def get_queryset(self):
        return models.Organization.objects.all().optimized().order_by(
            '-created_at')


class OrganizationUserViewSet(AtomicViewSetMixin, viewsets.ModelViewSet):
    permission_classes = (permissions.IsSuperUser,)
    serializer_class = serializers.OrganizationUserSerializer
    filterset_fields = ('organization',)

    def get_queryset(self):
        return models.OrganizationUser.objects.all().optimized().order_by(
            '-created_at')
