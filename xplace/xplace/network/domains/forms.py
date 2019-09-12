from django import forms
from django.db import models

from validators import domain

from xplace.base.forms import BaseFilterForm, ExtendedFormMixin
from xplace.base import permissions
from xplace.users.models import User

from ..models import Domain, ReverseProxy


class DomainAddForm(ExtendedFormMixin, forms.ModelForm):
    permissions = {
        'user': permissions.is_superuser,
        'reverse_proxy': permissions.is_superuser
    }

    reverse_proxy = forms.ModelChoiceField(
        required=False,
        queryset=ReverseProxy.objects.all(),
        widget=forms.Select(
            attrs={
                'class': 'dropdown ui selection',
                'placeholder': 'Reverse proxy'
            }
        )
    )

    user = forms.ModelChoiceField(
        required=False,
        queryset=User.objects.all(),
        widget=forms.Select(
            attrs={
                'class': 'dropdown ui selection',
                'placeholder': 'User'
            }
        )
    )

    class Meta:
        model = Domain
        fields = ['name',
                  'include_sub_domains',
                  'destination_ip',
                  'destination_http_port',
                  'destination_https_port',
                  'user',
                  'reverse_proxy']
        widgets = {
            'name': forms.TextInput(attrs={
                'placeholder': 'Name',
            }),
            'include_sub_domains': forms.CheckboxInput(attrs={
                'placeholder': 'Include all subdomains',
            }),
            'destination_ip': forms.TextInput(attrs={
                'placeholder': 'Destination ip',
            }),
            'destination_http_port': forms.TextInput(attrs={
                'placeholder': 'Destination http port',
            }),
            'destination_https_port': forms.TextInput(attrs={
                'placeholder': 'Destination https port',
            })
        }

    def clean_name(self):
        name = self.cleaned_data['name']
        if not domain(name.encode('idna').decode('ascii')):
            raise forms.ValidationError('Invalid domain name')
        return name.strip().lower()

    def clean(self):
        cleaned_data = super().clean()
        if not self.errors:
            rvp = cleaned_data.get('reverse_proxy')
            if rvp is None:
                rvp = ReverseProxy.objects.first()
                if rvp is None:
                    raise forms.ValidationError(
                        'No suitable host reverse proxy')

                cleaned_data['reverse_proxy'] = rvp

            user = cleaned_data.get('user')
            if user is None:
                user = self.request.user
                cleaned_data['user'] = user

        return cleaned_data


class DomainUpdateForm(ExtendedFormMixin, forms.ModelForm):
    permissions = {
        'user': permissions.is_superuser,
    }

    user = forms.ModelChoiceField(
        required=False,
        queryset=User.objects.all(),
        widget=forms.Select(
            attrs={
                'class': 'dropdown ui selection',
                'placeholder': 'User'
            }
        )
    )

    class Meta:
        model = Domain
        fields = ['include_sub_domains',
                  'destination_ip',
                  'destination_http_port',
                  'destination_https_port',
                  'user']
        widgets = {
            'include_sub_domains': forms.CheckboxInput(attrs={
                'placeholder': 'Include all subdomains',
            }),
            'destination_ip': forms.TextInput(attrs={
                'placeholder': 'Destination ip',
            }),
            'destination_http_port': forms.TextInput(attrs={
                'placeholder': 'Destination http port',
            }),
            'destination_https_port': forms.TextInput(attrs={
                'placeholder': 'Destination https port',
            })
        }

    def clean(self):
        cleaned_data = super().clean()
        if not self.errors:

            user = cleaned_data.get('user')
            if user is None:
                user = self.request.user
                cleaned_data['user'] = user

        return cleaned_data


class DomainDeleteForm(forms.ModelForm):
    class Meta:
        model = Domain
        fields = ['dummy']

    dummy = forms.CharField(initial='1', widget=forms.HiddenInput())

    def save(self, commit=True):
        self.instance.deleted = True
        self.instance.save()
        return self.instance


class FilterForm(BaseFilterForm):
    query = forms.CharField(
        required=False,
        widget=forms.TextInput(attrs={'placeholder': 'Search'}),
    )

    def filter_queryset(self, queryset, request):
        query = self.cleaned_data.get('query')

        if query:
            queryset = queryset.filter(
                models.Q(name__icontains=query)
            )

        return queryset
