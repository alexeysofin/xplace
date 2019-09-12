from django.contrib import messages
from django.contrib.auth.mixins import LoginRequiredMixin, PermissionRequiredMixin
from django.db import transaction
from django.urls import reverse
from django.views import generic

from xplace.base.views import FilterListViewMixin
from xplace.users import tasks
from .forms import (
    UserAddForm, UserUpdateForm, UserPasswordForm, FilterForm)
from .models import User, get_resources_context, ResetPasswordToken


class ListView(FilterListViewMixin, LoginRequiredMixin,
               PermissionRequiredMixin, generic.ListView):
    permission_required = ['users.view_user']
    template_name = 'users/list.html'
    paginate_by = 10
    queryset = User.objects.all()
    filter_form_class = FilterForm


class AddView(LoginRequiredMixin,
              PermissionRequiredMixin, generic.CreateView):
    permission_required = ['users.add_user']
    template_name = 'users/add.html'
    form_class = UserAddForm
    queryset = User.objects.all()

    def get_success_url(self):
        return reverse('users:detail', kwargs=dict(pk=self.object.pk))

    def get_form_kwargs(self):
        kw = super().get_form_kwargs()
        kw['request'] = self.request
        return kw

    def form_valid(self, form):
        messages.success(self.request,
                         'User successfully created. '
                         'Email with invite has been sent.',
                         extra_tags='Done')

        response = super().form_valid(form)

        token_obj = ResetPasswordToken.objects.create_token(
            form.instance
        )

        link = self.request.build_absolute_uri(
            '{}?token={}'.format(reverse('account:reset_password_confirm'),
                                 token_obj.token)
        )

        transaction.on_commit(
            lambda: tasks.send_invite_confirmation.delay(
                form.instance.email, link)
        )

        return response


class DetailView(LoginRequiredMixin, PermissionRequiredMixin,
                 generic.DetailView):
    permission_required = ['users.view_user']
    template_name = 'users/detail.html'
    queryset = User.objects.all()


class SettingsView(LoginRequiredMixin, PermissionRequiredMixin,
                   generic.UpdateView):
    permission_required = ['users.change_user']
    template_name = 'users/detail_settings.html'
    form_class = UserUpdateForm
    queryset = User.objects.all()

    def get_form_kwargs(self):
        kw = super().get_form_kwargs()
        kw['request'] = self.request
        return kw

    def get_success_url(self):
        return reverse('users:settings',
                       kwargs=dict(pk=self.object.pk))

    def form_valid(self, form):
        messages.success(self.request,
                         'User successfully updated, ',
                         extra_tags='Done')
        response = super().form_valid(form)

        return response


class UserSecurityView(LoginRequiredMixin, PermissionRequiredMixin,
                       generic.UpdateView):
    permission_required = ['users.change_user']
    template_name = 'users/detail_security.html'
    form_class = UserPasswordForm
    queryset = User.objects.all()

    def get_form_kwargs(self):
        kw = super().get_form_kwargs()
        kw['request'] = self.request
        return kw

    def get_success_url(self):
        return reverse('users:security',
                       kwargs=dict(pk=self.object.pk))

    def form_valid(self, form):
        messages.success(self.request,
                         'Password successfully changed, ',
                         extra_tags='Done')
        response = super().form_valid(form)

        return response


class DeleteView(LoginRequiredMixin, PermissionRequiredMixin,
                 generic.DeleteView):
    permission_required = ['users.delete_user']
    template_name = 'users/detail_delete.html'
    queryset = User.objects.all()

    def get_success_url(self):
        return reverse('users:list')

    def delete(self, request, *args, **kwargs):
        response = super().delete(request, *args, **kwargs)
        messages.success(self.request,
                         'User successfully deleted.',
                         extra_tags='Done')
        return response


class ResourcesView(LoginRequiredMixin, PermissionRequiredMixin,
                    generic.DetailView):
    permission_required = ['users.view_user']
    template_name = 'users/detail_resources.html'
    queryset = User.objects.all()

    def get_context_data(self, **kwargs):
        ctx = super().get_context_data()
        ctx.update(get_resources_context(self.object))
        return ctx
