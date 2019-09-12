from django.urls import path

from .views import ListView, AddView, DetailView, SettingsView, DeleteView


urlpatterns = [
    path('', ListView.as_view(), name='list'),
    path('add/', AddView.as_view(), name='add'),
    path('<uuid:pk>/', DetailView.as_view(), name='detail'),
    path('<uuid:pk>/settings/',
         SettingsView.as_view(), name='settings'),
    path('<uuid:pk>/delete/',
         DeleteView.as_view(), name='delete'),
]

app_name = 'hosts'
