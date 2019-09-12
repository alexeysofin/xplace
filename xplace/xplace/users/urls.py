from django.urls import path

from . import views

urlpatterns = [
    path('', views.ListView.as_view(), name='list'),
    path('add/', views.AddView.as_view(), name='add'),
    path('<uuid:pk>/', views.DetailView.as_view(), name='detail'),
    path('<uuid:pk>/settings/',
         views.SettingsView.as_view(), name='settings'),
    path('<uuid:pk>/security/',
         views.UserSecurityView.as_view(), name='security'),
    path('<uuid:pk>/resources/',
         views.ResourcesView.as_view(), name='resources'),
    path('<uuid:pk>/delete/',
         views.DeleteView.as_view(), name='delete'),
]

app_name = 'users'
