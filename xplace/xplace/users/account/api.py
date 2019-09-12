from rest_framework import permissions
from rest_framework import generics

from xplace.users import models
from xplace.users.account import serializers


class RegistrationAPIView(generics.CreateAPIView):
    permission_classes = (permissions.AllowAny,)
    serializer_class = serializers.RegistrationSerializer


class EmailVerificationAPIView(generics.CreateAPIView):
    permission_classes = (permissions.AllowAny,)
    serializer_class = serializers.EmailVerificationSerializer


class ResetPasswordTokenAPIView(generics.CreateAPIView):
    permission_classes = (permissions.AllowAny,)
    serializer_class = serializers.ResetPasswordTokenCreateSerializer


class PasswordResetCreateAPIView(generics.CreateAPIView):
    permission_classes = (permissions.AllowAny,)
    serializer_class = serializers.PasswordResetSerializer


class AuthTokenCreateAPIView(generics.CreateAPIView):
    permission_classes = (permissions.AllowAny,)
    serializer_class = serializers.AuthTokenCreateSerializer

    def create(self, request, *args, **kwargs):
        response = super().create(request, *args, **kwargs)
        token = response.data.get('token')
        response.set_cookie('authorization', token)
        return response

    # TODO: token prolongation


class AuthTokenDeleteAPIView(generics.DestroyAPIView):
    lookup_field = 'token'
    lookup_url_kwarg = lookup_field

    # TODO: add delete_others parameter to swagger

    def get_queryset(self):
        return models.AuthToken.objects.filter(user=self.request.user)

    def perform_destroy(self, instance):
        if self.request.GET.get('delete_others', False):
            # TODO: losing history here (create login events)
            models.AuthToken.objects.filter(user=self.request.user).exclude(
                id=instance.id).delete()
        else:
            super().perform_destroy(instance)


class ProfileRetrieveUpdateAPIView(generics.RetrieveUpdateAPIView):
    serializer_class = serializers.ProfileSerializer

    def get_object(self):
        return self.request.user


class ProfilePasswordUpdateAPIView(generics.UpdateAPIView):
    serializer_class = serializers.ProfilePasswordSerializer

    def get_object(self):
        return self.request.user
