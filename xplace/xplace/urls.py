"""xplace URL Configuration

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/2.0/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path, include, re_path

from drf_yasg.views import get_schema_view
from drf_yasg import openapi

from rest_framework import permissions
from rest_framework.routers import DefaultRouter

from xplace.layout.views import IndexView
from xplace.users.account import api as account_api
from xplace.users import api as users_api
from xplace.compute import api as compute_api
from xplace.network import api as network_api
from xplace.support import api as support_api
from xplace.events import api as events_api

schema_view = get_schema_view(
   openapi.Info(
      title="Xplace public API",
      default_version='v1',
      description="Rest API to manage LXC containers",
      terms_of_service="https://xplace.pro/terms",
      contact=openapi.Contact(email="sofin.moffin@gmail.com"),
      license=openapi.License(name="BSD License"),
   ),
   validators=['flex', 'ssv'],
   public=True,
   permission_classes=(permissions.IsAuthenticated,),
)


router = DefaultRouter()
router.register('api/v1.0/users', users_api.UserViewSet, 'users')
router.register('api/v1.0/organizations', users_api.OrganizationViewSet,
                'organizations')
router.register('api/v1.0/organization-memberships',
                users_api.OrganizationUserViewSet,
                'organization_memberships')
router.register('api/v1.0/ssh-keys', users_api.SshKeyViewSet, 'ssh_keys')
router.register(
    'api/v1.0/hosts', compute_api.HostViewSet, 'hosts')
router.register(
    'api/v1.0/containers', compute_api.ContainerViewSet, 'containers')
router.register(
    'api/v1.0/ram-sizes', compute_api.RamSizeViewSet, 'ram_sizes')
router.register(
    'api/v1.0/disk-sizes', compute_api.DiskSizeSizeViewSet, 'disk_sizes')
router.register(
    'api/v1.0/images', compute_api.ImageViewSet, 'images')
router.register(
    'api/v1.0/backups', compute_api.BackupViewSet, 'backups')
router.register(
    'api/v1.0/reverse-proxies', network_api.ReverseProxyViewSet,
    'reverse_proxies')
router.register('api/v1.0/domains', network_api.DomainViewSet, 'domains')
router.register('api/v1.0/tickets', support_api.TicketViewSet, 'tickets')
router.register('api/v1.0/ticket-comments', support_api.TicketCommentViewSet,
                'ticket_comments')

urlpatterns = [
    path('api/v1.0/registration/',
         account_api.RegistrationAPIView.as_view(),
         name='registration'),
    path('api/v1.0/email-verification/',
         account_api.EmailVerificationAPIView.as_view(),
         name='email_verification'),
    path('api/v1.0/reset-password-token/',
         account_api.ResetPasswordTokenAPIView.as_view(),
         name='create_reset_password_token'),
    path('api/v1.0/password-reset/',
         account_api.PasswordResetCreateAPIView.as_view(),
         name='password_reset'),
    path('api/v1.0/auth-token/',
         account_api.AuthTokenCreateAPIView.as_view(),
         name='create_auth_token'),
    path('api/v1.0/auth-token/<str:token>/',
         account_api.AuthTokenDeleteAPIView.as_view(),
         name='delete_auth_token'),
    path('api/v1.0/profile/',
         account_api.ProfileRetrieveUpdateAPIView.as_view(),
         name='update_profile'),
    path('api/v1.0/profile/password/',
         account_api.ProfilePasswordUpdateAPIView.as_view(),
         name='update_profile_password'),
    path('api/v1.0/container-events/',
         compute_api.ContainerEventListAPIView.as_view(),
         name='container_events'),

    path('api/v1.0/events/<str:id>/',
         events_api.EventRetrieveAPIView.as_view(),
         name='retrieve_event'),

    path('showmethemoney/', admin.site.urls),
    path('', IndexView.as_view(), name='index'),
    path(
        'compute/',
        include('xplace.compute.urls', namespace='compute')
    ),
    path(
        'network/',
        include('xplace.network.urls', namespace='network')
    ),
    path('account/', include('xplace.users.account.urls', namespace='account')),
    path('users/', include('xplace.users.urls', namespace='users')),
    path('support/', include('xplace.support.urls', namespace='support')),
    re_path(
        r'^swagger(?P<format>\.json|\.yaml)$',
        schema_view.without_ui(cache_timeout=0),
        name='schema-json'
    ),
    path(
        'swagger/',
        schema_view.with_ui('swagger', cache_timeout=0),
        name='schema-swagger-ui'
    ),
]

urlpatterns += router.urls
