from django.urls import path

from .views import (
    ListView, AddView, DetailView, SettingsView, DeleteView,
    CommentAddView, CommentUpdateView, CommentDeleteView
)


urlpatterns = [
    path('', ListView.as_view(), name='list'),
    path('add/', AddView.as_view(), name='add'),
    path('<uuid:pk>/', DetailView.as_view(), name='detail'),
    path('<uuid:pk>/settings/',
         SettingsView.as_view(), name='settings'),
    path('<uuid:pk>/delete/',
         DeleteView.as_view(), name='delete'),
    path('comment/add/',
         CommentAddView.as_view(), name='comment'),
    path('comment/<uuid:pk>/',
         CommentUpdateView.as_view(), name='comment_update'),
    path('comment/<uuid:pk>/delete/',
         CommentDeleteView.as_view(), name='comment_delete'),
]

app_name = 'tickets'
