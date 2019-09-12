from django.contrib import messages
from django.contrib.auth.mixins import (
    LoginRequiredMixin, PermissionRequiredMixin
)
from django.urls import reverse
from django.views import generic

from xplace.compute.models import RamSize
from xplace.compute.ram_sizes import forms


def is_superuser(user):
    return user.is_superuser


class ListView(LoginRequiredMixin, PermissionRequiredMixin,
               generic.ListView):
    permission_required = ['compute.view_ramsize']
    template_name = 'ram_sizes/list.html'
    paginate_by = 10
    queryset = RamSize.objects.all()


class AddView(LoginRequiredMixin, PermissionRequiredMixin, generic.CreateView):
    permission_required = ['compute.add_ramsize']
    template_name = 'ram_sizes/add.html'
    form_class = forms.AddForm
    queryset = RamSize.objects.all()

    def get_success_url(self):
        return reverse('compute:ram_sizes:detail', kwargs=dict(pk=self.object.pk))

    def get_form_kwargs(self):
        kw = super().get_form_kwargs()
        kw['request'] = self.request
        return kw

    def form_valid(self, form):
        messages.success(self.request,
                         'RAM size successfully created.',
                         extra_tags='Done')
        response = super().form_valid(form)

        return response


class DetailView(LoginRequiredMixin, PermissionRequiredMixin, generic.DetailView):
    permission_required = ['compute.view_ramsize']
    template_name = 'ram_sizes/detail.html'
    queryset = RamSize.objects.all()


class SettingsView(LoginRequiredMixin, PermissionRequiredMixin, generic.UpdateView):
    permission_required = ['compute.change_ramsize']
    template_name = 'ram_sizes/detail_settings.html'
    form_class = forms.UpdateForm
    queryset = RamSize.objects.all()

    def get_form_kwargs(self):
        kw = super().get_form_kwargs()
        kw['request'] = self.request
        return kw

    def get_success_url(self):
        return reverse('compute:ram_sizes:settings',
                       kwargs=dict(pk=self.object.pk))

    def form_valid(self, form):
        messages.success(self.request,
                         'RamSize successfully updated, ',
                         extra_tags='Done')
        response = super().form_valid(form)

        return response


class DeleteView(LoginRequiredMixin, PermissionRequiredMixin, generic.DeleteView):
    permission_required = ['compute.delete_ramsize']
    template_name = 'ram_sizes/detail_delete.html'
    queryset = RamSize.objects.all()

    def get_success_url(self):
        return reverse('compute:ram_sizes:list')

    def delete(self, request, *args, **kwargs):
        response = super().delete(request, *args, **kwargs)
        messages.success(self.request,
                         'RamSize successfully deleted.',
                         extra_tags='Done')
        return response
