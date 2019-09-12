from django.urls import path, include

from . import views

urlpatterns = [
    path('login/', views.LoginView.as_view(), name='login'),
    path('signup/', views.SignUpView.as_view(), name='signup'),
    path('signup/confirm/', views.SignUpConfirmView.as_view(),
         name='signup_confirm'),
    path('reset/', views.ResetPasswordView.as_view(),
         name='reset_password'),
    path('reset-password/confirm/', views.ResetPasswordConfirmView.as_view(),
         name='reset_password_confirm'),
    path('logout/', views.LogoutView.as_view(), name='logout'),
    path('profile/', views.ProfileView.as_view(), name='profile'),
    path('security/', views.SecurityView.as_view(), name='security'),
    path('resources/', views.ResourcesView.as_view(), name='resources'),
    path('ssh-keys/', include('xplace.users.ssh_keys.urls',
                              namespace='ssh_keys')),
]

app_name = 'account'
