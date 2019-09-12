from django.contrib import messages
from django.contrib.auth.mixins import LoginRequiredMixin, \
    PermissionRequiredMixin
from django.urls import reverse
from django.views import generic

from xplace.compute.models import Host
from xplace.compute.hosts import forms


class ListView(LoginRequiredMixin, PermissionRequiredMixin, generic.ListView):
    permission_required = ['compute.view_host']
    template_name = 'hosts/list.html'
    paginate_by = 10
    queryset = Host.objects.all()


class AddView(LoginRequiredMixin, PermissionRequiredMixin, generic.CreateView):
    permission_required = ['compute.add_host']
    template_name = 'hosts/add.html'
    form_class = forms.AddForm
    queryset = Host.objects.all()

    def get_success_url(self):
        return reverse('compute:hosts:detail', kwargs=dict(pk=self.object.pk))

    def get_form_kwargs(self):
        kw = super().get_form_kwargs()
        kw['request'] = self.request
        return kw

    def form_valid(self, form):
        messages.success(self.request,
                         'Host successfully created.',
                         extra_tags='Done')
        response = super().form_valid(form)

        return response


class DetailView(LoginRequiredMixin, PermissionRequiredMixin, generic.DetailView):
    permission_required = ['compute.view_host']
    template_name = 'hosts/detail.html'
    queryset = Host.objects.all()


class SettingsView(LoginRequiredMixin, PermissionRequiredMixin,
                   generic.UpdateView):
    permission_required = ['compute.change_host']
    template_name = 'hosts/detail_settings.html'
    form_class = forms.UpdateForm
    queryset = Host.objects.all()

    def get_form_kwargs(self):
        kw = super().get_form_kwargs()
        kw['request'] = self.request
        return kw

    def get_success_url(self):
        return reverse('compute:hosts:settings',
                       kwargs=dict(pk=self.object.pk))

    def form_valid(self, form):
        messages.success(self.request,
                         'Host successfully updated, ',
                         extra_tags='Done')
        response = super().form_valid(form)

        return response


class DeleteView(LoginRequiredMixin, PermissionRequiredMixin,
                 generic.DeleteView):
    permission_required = ['compute.delete_host']
    template_name = 'hosts/detail_delete.html'
    queryset = Host.objects.all()

    def get_success_url(self):
        return reverse('compute:hosts:list')

    def delete(self, request, *args, **kwargs):
        response = super().delete(request, *args, **kwargs)
        messages.success(self.request,
                         'Host successfully deleted.',
                         extra_tags='Done')
        return response
