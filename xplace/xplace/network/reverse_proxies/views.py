from django.contrib import messages
from django.contrib.auth.mixins import LoginRequiredMixin, PermissionRequiredMixin
from django.urls import reverse
from django.views import generic

from xplace.network.models import ReverseProxy
from xplace.network.reverse_proxies import forms


class ListView(LoginRequiredMixin, PermissionRequiredMixin,
               generic.ListView):
    permission_required = ['network.view_reverseproxy']
    template_name = 'reverse_proxies/list.html'
    paginate_by = 10
    queryset = ReverseProxy.objects.all()


class AddView(LoginRequiredMixin, PermissionRequiredMixin,
              generic.CreateView):
    permission_required = ['network.add_reverseproxy']
    template_name = 'reverse_proxies/add.html'
    form_class = forms.AddForm
    queryset = ReverseProxy.objects.all()

    def get_success_url(self):
        return reverse('network:reverse_proxies:detail',
                       kwargs=dict(pk=self.object.pk))

    def get_form_kwargs(self):
        kw = super().get_form_kwargs()
        kw['request'] = self.request
        return kw

    def form_valid(self, form):
        messages.success(self.request,
                         'Reverse proxy successfully created.',
                         extra_tags='Done')
        response = super().form_valid(form)

        return response


class DetailView(LoginRequiredMixin, PermissionRequiredMixin,
                 generic.DetailView):
    permission_required = ['network.view_reverseproxy']
    template_name = 'reverse_proxies/detail.html'
    queryset = ReverseProxy.objects.all()


class SettingsView(LoginRequiredMixin, PermissionRequiredMixin,
                   generic.UpdateView):
    permission_required = ['network.change_reverseproxy']
    template_name = 'reverse_proxies/detail_settings.html'
    form_class = forms.UpdateForm
    queryset = ReverseProxy.objects.all()

    def get_form_kwargs(self):
        kw = super().get_form_kwargs()
        kw['request'] = self.request
        return kw

    def get_success_url(self):
        return reverse('network:reverse_proxies:settings',
                       kwargs=dict(pk=self.object.pk))

    def form_valid(self, form):
        messages.success(self.request,
                         'ReverseProxy successfully updated, ',
                         extra_tags='Done')
        response = super().form_valid(form)

        return response


class DeleteView(LoginRequiredMixin, PermissionRequiredMixin,
                 generic.DeleteView):
    permission_required = ['network.delete_reverseproxy']
    template_name = 'reverse_proxies/detail_delete.html'
    queryset = ReverseProxy.objects.all()

    def get_success_url(self):
        return reverse('network:reverse_proxies:list')

    def delete(self, request, *args, **kwargs):
        response = super().delete(request, *args, **kwargs)
        messages.success(self.request,
                         'ReverseProxy successfully deleted.',
                         extra_tags='Done')
        return response
