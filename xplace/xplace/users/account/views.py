from django.contrib import messages
from django.contrib.auth import login, logout
from django.contrib.auth.hashers import make_password
from django.contrib.auth.mixins import LoginRequiredMixin
from django.contrib.auth.views import (
    LoginView as LoginViewBase
)
from django.db import transaction
from django.http import Http404, HttpResponseRedirect
from django.urls import reverse, reverse_lazy
from django.utils.decorators import method_decorator
from django.views import View, generic
from django.views.decorators.cache import never_cache
from django.views.decorators.debug import sensitive_post_parameters
from django.views.generic import RedirectView
from django.views.generic.edit import FormView
from xplace.base.utils import normalize_email

from .forms import (
    SignUpForm, LoginForm, ResetPasswordForm,
    ResetPasswordConfirmForm,
    ProfileForm, ChangePasswordForm
)
from ..models import RegistrationToken, User, ResetPasswordToken, \
    get_resources_context
from .tasks import (
    send_registration_link, send_welcome, send_reset_password_link,
    send_reset_password_notification
)

from xplace.users import models
from xplace.users.account import forms


class SignUpCreateView(generic.CreateView):
    model = models.User
    form_class = forms.SignUpForm


class SignUpView(FormView):
    template_name = 'users/signup.html'
    form_class = SignUpForm

    @method_decorator(sensitive_post_parameters('password', 'password_repeat'))
    @method_decorator(never_cache)
    def dispatch(self, request, *args, **kwargs):
        return super().dispatch(request, *args, **kwargs)

    def get_context_data(self, **kwargs):
        ctx = super().get_context_data(**kwargs)
        ctx['link_sent'] = self.request.GET.get('link_sent')
        return ctx

    def get_success_url(self):
        return '{}?link_sent=1'.format(reverse('account:signup'))

    def form_valid(self, form):
        email = form.cleaned_data['email']

        token_obj = RegistrationToken.objects.create_token(
            email,
            language=form.cleaned_data['language'],
            password=make_password(form.cleaned_data['password'])
        )

        link = self.request.build_absolute_uri(
            '{}?token={}'.format(reverse('account:signup_confirm'),
                                 token_obj.token)
        )

        transaction.on_commit(
            lambda: send_registration_link.send(email, link)
        )

        return super().form_valid(form)


class SignUpConfirmView(RedirectView):
    def get(self, request, *args, **kwargs):
        token = self.request.GET.get('token')
        if not token:
            raise Http404

        token_obj = RegistrationToken.objects.find_token(token)

        if token_obj is None:
            raise Http404

        user = User.objects.create_user(
            token_obj.email,
            language=token_obj.language
        )

        user.password = token_obj.password

        user.save(update_fields=['password'])

        token_obj.delete()

        transaction.on_commit(
            lambda: send_welcome.send(user.email)
        )

        login(self.request, user)

        return super().get(request, *args, **kwargs)

    def get_redirect_url(self, *args, **kwargs):
        return reverse('index')


class ResetPasswordView(FormView):
    template_name = 'users/reset_password.html'
    form_class = ResetPasswordForm

    def get_context_data(self, **kwargs):
        ctx = super().get_context_data(**kwargs)
        ctx['link_sent'] = self.request.GET.get('link_sent')
        return ctx

    def get_success_url(self):
        return '{}?link_sent=1'.format(reverse('account:reset_password'))

    def form_valid(self, form):
        email = normalize_email(form.cleaned_data['email'])

        try:
            user = User.objects.get(email=email)
        except User.DoesNotExist:
            pass
        else:
            token_obj = ResetPasswordToken.objects.create_token(
                user
            )

            link = self.request.build_absolute_uri(
                '{}?token={}'.format(reverse('account:reset_password_confirm'),
                                     token_obj.token)
            )

            transaction.on_commit(
                lambda: send_reset_password_link.send(email, link)
            )

        return super().form_valid(form)


class ResetPasswordConfirmView(FormView):
    template_name = 'users/reset_password_confirm.html'
    form_class = ResetPasswordConfirmForm

    @method_decorator(sensitive_post_parameters('password', 'password_repeat'))
    @method_decorator(never_cache)
    def dispatch(self, request, *args, **kwargs):
        return super().dispatch(request, *args, **kwargs)

    def get_initial(self):
        initial = super().get_initial()
        token = self.request.GET.get('token')
        if not token:
            raise Http404
        initial['token'] = token
        return initial

    def get_success_url(self):
        return reverse('index')

    def form_valid(self, form):
        token_obj = form.cleaned_data['token_obj']

        user = token_obj.user

        user.set_password(form.cleaned_data['password'])
        user.save()

        token_obj.delete()

        transaction.on_commit(
            lambda: send_reset_password_notification.send(user.email)
        )

        login(self.request, user)

        return super().form_valid(form)


class LoginView(LoginViewBase):
    redirect_authenticated_user = True
    form_class = LoginForm
    template_name = 'users/login.html'


class LogoutView(View):
    @method_decorator(never_cache)
    def dispatch(self, request, *args, **kwargs):
        return super().dispatch(request, *args, **kwargs)

    def get(self, request, *args, **kwargs):
        logout(self.request)
        messages.info(
            self.request, 'You have been logged out. See you soon!',
            extra_tags='Bye!')
        return HttpResponseRedirect(reverse('account:login'))


class ProfileView(LoginRequiredMixin, generic.UpdateView):
    template_name = 'users/profile.html'
    form_class = ProfileForm

    success_url = reverse_lazy('account:profile')

    def get_object(self, queryset=None):
        return self.request.user

    def form_valid(self, form):
        messages.success(self.request,
                         'Profile successfully updated.',
                         extra_tags='Done')
        return super().form_valid(form)


class SecurityView(LoginRequiredMixin, generic.UpdateView):
    template_name = 'users/profile_security.html'
    form_class = ChangePasswordForm

    success_url = reverse_lazy('account:security')

    def get_form_kwargs(self):
        kw = super().get_form_kwargs()
        kw['request'] = self.request
        return kw

    def get_object(self, queryset=None):
        return self.request.user

    def form_valid(self, form):
        messages.success(self.request,
                         'Password successfully changed.',
                         extra_tags='Done')
        return super().form_valid(form)


class ResourcesView(LoginRequiredMixin, generic.DetailView):
    template_name = 'users/profile_resources.html'

    def get_context_data(self, **kwargs):
        ctx = super().get_context_data()

        ctx.update(get_resources_context(self.object))

        return ctx

    def get_object(self, queryset=None):
        return self.request.user
