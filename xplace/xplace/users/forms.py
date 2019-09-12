from django import forms
from django.db import models

from xplace.base.forms import RequestFormMixin, BaseFilterForm

from .models import (
    User, UserLanguage
)


class UserAddForm(RequestFormMixin, forms.ModelForm):
    language = forms.ChoiceField(
        choices=UserLanguage.CHOICES,
        widget=forms.Select(attrs={
            'class': 'dropdown ui selection',
            'placeholder': 'Language',
        })
    )

    class Meta:
        model = User
        fields = ['email', 'first_name', 'last_name', 'language',
                  'available_ram', 'available_disk_size',
                  'is_superuser', 'is_staff']
        widgets = {
            'email': forms.TextInput(attrs={
                'placeholder': 'Email',
            }),
            'first_name': forms.TextInput(attrs={
                'placeholder': 'First name',
            }),
            'is_superuser': forms.CheckboxInput(attrs={
                'placeholder': 'Is superuser',
            }),
            'is_staff': forms.CheckboxInput(attrs={
                'placeholder': 'Is staff',
            }),
            'last_name': forms.TextInput(attrs={
                'placeholder': 'Last name',
            }),
            'available_ram': forms.TextInput(attrs={
                'placeholder': 'Available RAM',
            }),
            'available_disk_size': forms.TextInput(attrs={
                'placeholder': 'Available disk size',
            }),
        }


class UserUpdateForm(RequestFormMixin, forms.ModelForm):
    language = forms.ChoiceField(
        choices=UserLanguage.CHOICES,
        widget=forms.Select(attrs={
            'class': 'dropdown ui selection',
            'placeholder': 'Language',
        })
    )

    class Meta:
        model = User
        fields = ['email', 'first_name', 'last_name', 'language',
                  'available_ram', 'available_disk_size',
                  'is_superuser', 'is_staff']
        widgets = {
            'email': forms.TextInput(attrs={
                'placeholder': 'Email',
            }),
            'first_name': forms.TextInput(attrs={
                'placeholder': 'First name',
            }),
            'is_superuser': forms.CheckboxInput(attrs={
                'placeholder': 'Is superuser',
            }),
            'is_staff': forms.CheckboxInput(attrs={
                'placeholder': 'Is superuser',
            }),
            'last_name': forms.TextInput(attrs={
                'placeholder': 'Last name',
            }),
            'available_ram': forms.TextInput(attrs={
                'placeholder': 'Available RAM',
            }),
            'available_disk_size': forms.TextInput(attrs={
                'placeholder': 'Available disk size',
            }),
        }


class UserPasswordForm(RequestFormMixin, forms.ModelForm):
    class Meta:
        model = User
        fields = ['password']
        widgets = {
            'password': forms.PasswordInput(attrs={
                'placeholder': 'Password',
            }),
        }

    def save(self, commit=True):
        password = self.cleaned_data.pop('password')
        self.instance.set_password(password)
        user = super().save(commit=commit)
        return user


class FilterForm(BaseFilterForm):
    query = forms.CharField(
        required=False,
        widget=forms.TextInput(attrs={'placeholder': 'Search'}),
    )

    def filter_queryset(self, queryset, request):
        query = self.cleaned_data.get('query')

        if query:
            queryset = queryset.filter(
                models.Q(email__icontains=query) |
                models.Q(first_name__icontains=query) |
                models.Q(last_name__icontains=query)
            )

        return queryset
