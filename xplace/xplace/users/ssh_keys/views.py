from django.contrib import messages
from django.contrib.auth.mixins import LoginRequiredMixin
from django.urls import reverse
from django.views.generic import ListView, UpdateView, CreateView

from ..models import SshKey
from .forms import SshKeyForm


class OwnerQuerySetMixin:
    def get_queryset(self):
        return SshKey.objects.filter(
            user=self.request.user).order_by('-created_at')


class SshKeyListView(OwnerQuerySetMixin, LoginRequiredMixin, ListView):
    template_name = 'users/ssh_keys/list.html'
    paginate_by = 10


class SshKeyUpdateView(OwnerQuerySetMixin, LoginRequiredMixin, UpdateView):
    template_name = 'users/ssh_keys/update.html'
    form_class = SshKeyForm

    def get_form_kwargs(self):
        kw = super().get_form_kwargs()
        kw['request'] = self.request
        return kw

    def get_success_url(self):
        return reverse('account:ssh_keys:update', kwargs=dict(pk=self.object.pk))

    def form_valid(self, form):
        messages.success(self.request,
                         'SSH keys successfully updated',
                         extra_tags='Done')
        response = super().form_valid(form)

        return response


class SshKeyAddView(LoginRequiredMixin, CreateView):
    template_name = 'users/ssh_keys/add.html'
    form_class = SshKeyForm

    def get_success_url(self):
        return reverse('account:ssh_keys:update', kwargs=dict(pk=self.object.pk))

    def get_form_kwargs(self):
        kw = super().get_form_kwargs()
        kw['request'] = self.request
        return kw

    def form_valid(self, form):
        messages.success(self.request,
                         'SSH keys successfully created.',
                         extra_tags='Done')

        form.instance.user = self.request.user

        response = super().form_valid(form)

        return response
