import uuid

from django.contrib import messages
from django.contrib.auth.mixins import LoginRequiredMixin
from django.core.paginator import Paginator, PageNotAnInteger, EmptyPage
from django.http import JsonResponse
from django.shortcuts import get_object_or_404
from django.template.loader import render_to_string
from django.urls import reverse
from django.views.generic import CreateView, ListView, DetailView, UpdateView
from django.db import transaction
from xplace.base.views import JSONResponseMixin, FilterListViewMixin

from .forms import (
    ContainerAddForm, ContainerUpdateForm, ContainerDeleteForm,
    ContainerPowerForm,
    ContainerResetPasswordForm, ContainerBackupRestoreForm, FilterForm)
from ..models import Container, ContainerState, Backup
from .tasks import create_container, update_container, delete_container, \
    change_container_state, reset_container_password, restore_from_backup


class OwnerQuerySetMixin:
    def get_queryset(self):
        return Container.objects.filter_request(
            request=self.request).order_by('-created_at')


class ContainerListView(FilterListViewMixin, OwnerQuerySetMixin,
                        LoginRequiredMixin, ListView):
    template_name = 'containers/list.html'
    paginate_by = 10
    ordering = '-created_at'
    filter_form_class = FilterForm


class ContainerAddView(LoginRequiredMixin, CreateView):
    template_name = 'containers/add.html'
    form_class = ContainerAddForm

    def get_success_url(self):
        return reverse('compute:containers:detail', kwargs=dict(pk=self.object.pk))

    def get_form_kwargs(self):
        kw = super().get_form_kwargs()
        kw['request'] = self.request
        return kw

    def form_valid(self, form):
        messages.success(self.request,
                         'Container is being created.',
                         extra_tags='Done')

        event_id = str(uuid.uuid4().hex)

        form.instance.event_id = event_id

        response = super().form_valid(form)

        transaction.on_commit(
            lambda: create_container.apply_async(
                args=(str(self.object.id),),
                kwargs={'ssh_keys': form.cleaned_data.get('ssh_keys', ())},
                event_id=event_id
            )
        )

        return response


class ContainerPartialDetailView(JSONResponseMixin, OwnerQuerySetMixin,
                                 LoginRequiredMixin, DetailView):

    def get(self, request, *args, **kwargs):
        self.object = self.get_object()

        templates = {
            'state': 'containers/partial/state.html',
            'information': 'containers/partial/information.html'
        }

        context = self.get_context_data(**kwargs)

        data = {
            'templates': {},
            'event_id': self.object.event_id,
        }

        for key, template_name, in templates.items():
            data['templates'][key] = render_to_string(
                template_name=template_name,
                context=context,
                request=self.request,
                using=self.template_engine
            )

        return JsonResponse(data)


class ContainerDetailView(OwnerQuerySetMixin, LoginRequiredMixin, DetailView):
    template_name = 'containers/detail.html'

    def get_context_data(self, *, object_list=None, **kwargs):
        ctx = super().get_context_data(object_list=None, **kwargs)
        ctx['props'] = {
            'container_id': str(self.object.id)
        }
        return ctx


class ContainerSettingsView(OwnerQuerySetMixin, LoginRequiredMixin, UpdateView):
    template_name = 'containers/detail_settings.html'
    form_class = ContainerUpdateForm

    def get_form_kwargs(self):
        kw = super().get_form_kwargs()
        kw['request'] = self.request
        return kw

    def get_success_url(self):
        return reverse('compute:containers:settings', kwargs=dict(pk=self.object.pk))

    def form_valid(self, form):
        messages.success(self.request,
                         'Container successfully updated, '
                         'but it might take a while '
                         'to propagate container resources.',
                         extra_tags='Done')
        response = super().form_valid(form)

        transaction.on_commit(
            lambda: update_container.send(str(self.object.id))
        )

        return response


class ContainerDeleteView(OwnerQuerySetMixin, LoginRequiredMixin, UpdateView):
    template_name = 'containers/detail_delete.html'
    form_class = ContainerDeleteForm

    def get_success_url(self):
        return reverse('compute:containers:list')

    def form_valid(self, form):
        messages.success(self.request,
                         'Container successfully deleted.',
                         extra_tags='Done')
        response = super().form_valid(form)

        # TODO: ui DELETING STATE

        transaction.on_commit(
            lambda: delete_container.send(str(self.object.id))
        )

        return response


class ContainerPowerView(OwnerQuerySetMixin, LoginRequiredMixin, UpdateView):
    template_name = 'containers/detail_power.html'
    form_class = ContainerPowerForm

    def get_success_url(self):
        return reverse('compute:containers:power', kwargs=dict(pk=self.object.pk))

    def form_valid(self, form):
        messages.success(self.request,
                         'Container state is being changed.',
                         extra_tags='Done')

        event_id = str(uuid.uuid4().hex)

        form.instance.event_id = event_id

        response = super().form_valid(form)

        transaction.on_commit(
            lambda: change_container_state.apply_async(
                args=(str(self.object.id), form.cleaned_data['power_action']),
                event_id=event_id
            )
        )

        return response


class ContainerResetPasswordView(OwnerQuerySetMixin,
                                 LoginRequiredMixin, UpdateView):
    template_name = 'containers/detail_reset_password.html'
    form_class = ContainerResetPasswordForm

    def get_success_url(self):
        return reverse('compute:containers:reset_password',
                       kwargs=dict(pk=self.object.pk))

    def form_valid(self, form):
        messages.success(self.request,
                         'We have emailed you new container password',
                         extra_tags='Done')
        response = super().form_valid(form)

        transaction.on_commit(
            lambda: reset_container_password.send(str(self.object.id))
        )

        return response


class ContainerEventsView(OwnerQuerySetMixin, LoginRequiredMixin, DetailView):
    template_name = 'containers/detail_events.html'
    paginate_by = 10

    def get_context_data(self, **kwargs):
        ctx = super().get_context_data(**kwargs)
        page = self.request.GET.get('page', 1)

        paginator = Paginator(self.object.events.all(), self.paginate_by)
        try:
            events = paginator.page(page)
        except PageNotAnInteger:
            events = paginator.page(1)
        except EmptyPage:
            events = paginator.page(paginator.num_pages)

        ctx.update({
            'paginator': paginator,
            'events': events,
            'page_obj': events,
            'is_paginated': events.has_other_pages()
        })

        return ctx


class ContainerBackupsView(OwnerQuerySetMixin, LoginRequiredMixin, DetailView):
    template_name = 'containers/detail_backups.html'
    paginate_by = 10

    def get_context_data(self, **kwargs):
        ctx = super().get_context_data(**kwargs)
        page = self.request.GET.get('page', 1)

        paginator = Paginator(self.object.backups.all(), self.paginate_by)
        try:
            backups = paginator.page(page)
        except PageNotAnInteger:
            backups = paginator.page(1)
        except EmptyPage:
            backups = paginator.page(paginator.num_pages)

        ctx.update({
            'paginator': paginator,
            'backups': backups,
            'page_obj': backups,
            'is_paginated': backups.has_other_pages()
        })

        return ctx


class ContainerBackupsRestoreView(OwnerQuerySetMixin,
                                  LoginRequiredMixin, UpdateView):
    template_name = 'containers/detail_backups_restore.html'
    form_class = ContainerBackupRestoreForm

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)

        backup = get_object_or_404(Backup, id=self.kwargs.get('backup_id'))

        context['backup'] = backup

        return context

    def get_success_url(self):
        return reverse('compute:containers:backups',
                       kwargs=dict(pk=self.object.pk))

    def get_initial(self):
        initial = super().get_initial()
        initial['backup_id'] = self.kwargs.get('backup_id')
        return initial

    def form_valid(self, form):
        messages.success(self.request,
                         'Container is being restored from backup',
                         extra_tags='Done')

        event_id = str(uuid.uuid4().hex)

        form.instance.event_id = event_id
        form.instance.state = ContainerState.RESTORING

        response = super().form_valid(form)

        transaction.on_commit(
            lambda: restore_from_backup.apply_async(
                args=(str(self.object.id), str(form.cleaned_data['backup_id'])),
                event_id=event_id
            )
        )

        return response
