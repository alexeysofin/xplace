from django.urls import path

from .views import (
    ContainerListView, ContainerAddView, ContainerDetailView,
    ContainerSettingsView, ContainerDeleteView, ContainerPowerView,
    ContainerResetPasswordView, ContainerEventsView,
    ContainerPartialDetailView,
    ContainerBackupsView, ContainerBackupsRestoreView)

urlpatterns = [
    path('', ContainerListView.as_view(), name='list'),
    path('add/', ContainerAddView.as_view(), name='add'),
    path('<uuid:pk>/', ContainerDetailView.as_view(), name='detail'),
    path('<uuid:pk>/partial/',
         ContainerPartialDetailView.as_view(), name='partial'),
    path('<uuid:pk>/settings/',
         ContainerSettingsView.as_view(), name='settings'),
    path('<uuid:pk>/delete/',
         ContainerDeleteView.as_view(), name='delete'),
    path('<uuid:pk>/power/',
         ContainerPowerView.as_view(), name='power'),
    path('<uuid:pk>/reset-password/',
         ContainerResetPasswordView.as_view(), name='reset_password'),
    path('<uuid:pk>/events/', ContainerEventsView.as_view(), name='events'),
    path('<uuid:pk>/backups/', ContainerBackupsView.as_view(), name='backups'),
    path('<uuid:pk>/backups/<uuid:backup_id>',
         ContainerBackupsRestoreView.as_view(), name='restore'),

]

app_name = 'containers'
