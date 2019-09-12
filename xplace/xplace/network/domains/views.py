from django.contrib import messages
from django.contrib.auth.mixins import LoginRequiredMixin, PermissionRequiredMixin
from django.urls import reverse
from django.views.generic import CreateView, ListView, DetailView, UpdateView
from django.db import transaction
from xplace.base.views import FilterListViewMixin

from xplace.network.domains.tasks import (
    create_backends, update_backends, delete_backends
)
from .forms import DomainAddForm, DomainDeleteForm, DomainUpdateForm, \
    FilterForm
from ..models import Domain


class OwnerQuerySetMixin:
    def get_queryset(self):
        return Domain.objects.filter_request(
            request=self.request).order_by('-created_at')


class DomainListView(LoginRequiredMixin,
                     FilterListViewMixin, OwnerQuerySetMixin, ListView):
    template_name = 'domains/list.html'
    paginate_by = 10

    filter_form_class = FilterForm


class DomainAddView(LoginRequiredMixin, CreateView):
    template_name = 'domains/add.html'
    form_class = DomainAddForm

    def get_success_url(self):
        return reverse('network:domains:detail', kwargs=dict(pk=self.object.pk))

    def get_form_kwargs(self):
        kw = super().get_form_kwargs()
        kw['request'] = self.request
        return kw

    def form_valid(self, form):
        messages.success(self.request,
                         'Domain successfully created.',
                         extra_tags='Done')
        response = super().form_valid(form)

        transaction.on_commit(
            lambda: create_backends.delay(str(self.object.id))
        )

        return response


class DomainDetailView(OwnerQuerySetMixin, LoginRequiredMixin, DetailView):
    template_name = 'domains/detail.html'


class DomainSettingsView(OwnerQuerySetMixin, LoginRequiredMixin, UpdateView):
    template_name = 'domains/detail_settings.html'
    form_class = DomainUpdateForm

    def get_form_kwargs(self):
        kw = super().get_form_kwargs()
        kw['request'] = self.request
        return kw

    def get_success_url(self):
        return reverse('network:domains:settings', kwargs=dict(pk=self.object.pk))

    def form_valid(self, form):
        messages.success(self.request,
                         'Domain successfully updated, '
                         'but it might take a while '
                         'to propagate to reverse proxy.',
                         extra_tags='Done')
        response = super().form_valid(form)

        transaction.on_commit(
            lambda: update_backends.delay(str(self.object.id))
        )

        return response


class DomainDeleteView(OwnerQuerySetMixin, LoginRequiredMixin, UpdateView):
    template_name = 'domains/detail_delete.html'
    form_class = DomainDeleteForm

    def get_success_url(self):
        return reverse('network:domains:list')

    def form_valid(self, form):
        messages.success(self.request,
                         'Domain successfully deleted.',
                         extra_tags='Done')
        response = super().form_valid(form)

        transaction.on_commit(
            lambda: delete_backends.delay(str(self.object.id))
        )

        return response
