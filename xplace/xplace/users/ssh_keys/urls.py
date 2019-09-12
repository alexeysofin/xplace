from django.urls import path

from .views import (
    SshKeyListView, SshKeyUpdateView, SshKeyAddView
)

urlpatterns = [
    path('', SshKeyListView.as_view(), name='list'),
    path('add/', SshKeyAddView.as_view(), name='add'),
    path('<uuid:pk>/', SshKeyUpdateView.as_view(), name='update'),
]

app_name = 'ssh_keys'
