from django.urls import path

from .views import (
    DomainAddView, DomainListView, DomainDetailView, DomainDeleteView,
    DomainSettingsView
)

urlpatterns = [
    path('', DomainListView.as_view(), name='list'),
    path('add/', DomainAddView.as_view(), name='add'),
    path('<uuid:pk>/', DomainDetailView.as_view(), name='detail'),
    path('<uuid:pk>/delete/', DomainDeleteView.as_view(), name='delete'),
    path('<uuid:pk>/settings/', DomainSettingsView.as_view(), name='settings'),
]

app_name = 'domains'
