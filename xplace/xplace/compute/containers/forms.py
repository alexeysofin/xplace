import string

from django import forms
from django.db import models

from xplace.base.forms import BaseFilterForm, \
    ExtendedFormMixin
from xplace.base.utils import generate_random_token
from xplace.base.validators import validate_ascii
from xplace.base import permissions
from xplace.users.models import SshKey, User
from .const import PowerAction
from ..models import Container, Image, RamSize, DiskSize, Host, \
    ContainerState, Backup


def get_ram_size_choices():
    return [(ram.size, '{} MB'.format(ram.size))
            for ram in RamSize.objects.all()]


def get_disk_size_choices():
    return [(ram.size, '{} GB'.format(ram.size))
            for ram in DiskSize.objects.all()]


def check_resources(user, ram, disk_size=None, available_ram=None):
    if not user.is_superuser:
        errors = {}

        if available_ram is None:
            available_ram = user.available_ram
        left_ram = available_ram - user.used_ram - ram
        if left_ram < 0:
            errors['ram'] = '{} MB lacks'.format(abs(left_ram))

        if disk_size is not None:
            total_disk_size = user.available_disk_size
            left_disk_size = total_disk_size - user.used_disk_size - disk_size
            if left_disk_size < 0:
                errors['disk_size'] = '{} GB lacks'.format(abs(left_disk_size))

        if errors:
            raise forms.ValidationError(
                errors
            )


class ContainerAddForm(ExtendedFormMixin, forms.ModelForm):
    permissions = {
        'user': permissions.is_superuser,
        'host': permissions.is_superuser,
        'cpus': permissions.is_superuser
    }

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.fields['ssh_keys'].choices = [
            (key.id, key.name) for key in
            self.request.user.ssh_keys.all()
        ]

    def clean_hostname_prefix(self):
        hostname_prefix = self.cleaned_data['hostname_prefix']
        validate_ascii(hostname_prefix)
        return hostname_prefix.lower().strip()

    class Meta:
        model = Container
        fields = ['hostname_prefix', 'name',
                  'host', 'image', 'ram', 'disk_size', 'ssh_keys', 'user',
                  'cpus']

    cpus = forms.CharField(
        required=False,
        widget=forms.TextInput(attrs={
            'placeholder': 'CPUs'
        })
    )

    ssh_keys = forms.MultipleChoiceField(
        required=False,
        choices=(),
        widget=forms.SelectMultiple(attrs={'class': 'dropdown ui selection'})
    )

    image = forms.ModelChoiceField(
        required=True,
        queryset=Image.objects.all(),
        widget=forms.Select(
            attrs={
                'class': 'dropdown ui selection',
                'placeholder': 'Image'
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

    host = forms.ModelChoiceField(
        required=True,
        queryset=Host.objects.all(),
        widget=forms.Select(
            attrs={
                'class': 'dropdown ui selection',
                'placeholder': 'Host'
            }
        )
    )

    name = forms.CharField(
        required=True,
        widget=forms.TextInput(attrs={'placeholder': 'Name'}),
        max_length=255
    )

    hostname_prefix = forms.CharField(
        required=True,
        widget=forms.TextInput(attrs={'placeholder': 'Hostname (ascii)'}),
        label='Hostname (ascii)',
        max_length=250
    )
    ram = forms.ChoiceField(
        required=True,
        choices=get_ram_size_choices,
        label='Ram size',
        widget=forms.Select(
            attrs={
                'class': 'dropdown ui selection',
                'placeholder': 'Ram size'
            }
        )
    )
    disk_size = forms.ChoiceField(
        required=True,
        choices=get_disk_size_choices,
        widget=forms.Select(
            attrs={
                'class': 'dropdown ui selection',
                'placeholder': 'Disk size'
            }
        )
    )

    def clean_ssh_keys(self):
        ssh_keys = self.cleaned_data['ssh_keys']
        users = SshKey.objects.filter(id__in=ssh_keys).values_list(
            'user_id', flat=True)

        for u in users:
            if u != self.request.user.id:
                raise forms.ValidationError('SSH key not found')

        return ssh_keys

    def clean_disk_size(self):
        try:
            return int(self.cleaned_data['disk_size'])
        except ValueError:
            raise forms.ValidationError('Invalid integer')

    def clean_ram(self):
        try:
            return int(self.cleaned_data['ram'])
        except ValueError:
            raise forms.ValidationError('Invalid integer')

    def clean(self):
        cleaned_data = super().clean()
        if not self.errors:
            check_resources(
                self.request.user,
                cleaned_data['ram'],
                disk_size=cleaned_data['disk_size'])

            host = cleaned_data.get('host')
            if host is None:
                host = Host.objects.first()
                if host is None:
                    raise forms.ValidationError('No suitable host found')

                cleaned_data['host'] = host

            cpus = cleaned_data.get('cpus')
            if not cpus:
                cleaned_data['cpus'] = host.default_cpus

            user = cleaned_data.get('user')
            if user is None:
                user = self.request.user
                cleaned_data['user'] = user

            self.instance.hostname = '{}-{}'.format(
                cleaned_data['hostname_prefix'],
                generate_random_token(
                    5, choices=string.digits + string.ascii_lowercase)
            )

        return cleaned_data


class ContainerUpdateForm(ExtendedFormMixin, forms.ModelForm):
    permissions = {
        'user': permissions.is_superuser,
        'cpus': permissions.is_superuser
    }

    cpus = forms.CharField(
        required=False,
        widget=forms.TextInput(attrs={
            'placeholder': 'CPUs'
        })
    )

    class Meta:
        model = Container
        fields = ['ram', 'user', 'name', 'cpus']

    widgets = {
        'name': forms.TextInput(attrs={
            'placeholder': 'Name',
        }),
    }

    ram = forms.ChoiceField(
        required=True,
        choices=get_ram_size_choices,
        label='Ram size',
        widget=forms.Select(
            attrs={
                'class': 'dropdown ui selection',
                'placeholder': 'Ram size'
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

    def clean_ram(self):
        try:
            return int(self.cleaned_data['ram'])
        except ValueError:
            raise forms.ValidationError('Invalid integer')

    def clean(self):
        cleaned_data = super().clean()
        check_resources(
            self.request.user, cleaned_data['ram'],
            available_ram=self.request.user.available_ram+self.instance.ram
        )

        user = cleaned_data.get('user')
        if user is None:
            user = self.request.user
            cleaned_data['user'] = user

        cpus = cleaned_data.get('cpus')
        if not cpus:
            cleaned_data['cpus'] = self.instance.host.default_cpus

        return cleaned_data


class ContainerDeleteForm(forms.ModelForm):
    class Meta:
        model = Container
        fields = ['dummy']

    dummy = forms.CharField(initial='1', widget=forms.HiddenInput())

    def clean(self):
        cleaned_data = super().clean()

        required_state = ContainerState.STOPPED

        if not self.errors:

            if self.instance.state != required_state:
                raise forms.ValidationError(
                    'Container must be in {} state'.format(required_state))

        return cleaned_data

    def save(self, commit=True):
        self.instance.state = ContainerState.DELETING
        self.instance.save()
        return self.instance


class ContainerPowerForm(forms.ModelForm):
    power_action = forms.ChoiceField(
        choices=PowerAction.CHOICES,
        required=True,
        widget=forms.Select(
            attrs={
                'class': 'dropdown ui selection',
                'placeholder': 'Image'
            }
        )
    )

    class Meta:
        model = Container
        fields = ['power_action']

    def clean(self):
        cleaned_data = super().clean()
        if not self.errors:
            power_action = cleaned_data['power_action']
            required = PowerAction.REQUIRED_STATE.get(power_action)
            if required != self.instance.state:
                raise forms.ValidationError(
                    'Container must be in {} state'.format(required))

            self.instance.state = PowerAction.MID_STATE[power_action]

        return cleaned_data


class ContainerResetPasswordForm(forms.ModelForm):
    dummy = forms.CharField(initial='1', widget=forms.HiddenInput())

    class Meta:
        model = Container
        fields = ['dummy']

    def save(self, commit=True):
        return self.instance


class ContainerBackupRestoreForm(forms.ModelForm):
    backup_id = forms.UUIDField(widget=forms.HiddenInput(), required=True)

    def clean_backup_id(self):
        backup_id = self.cleaned_data['backup_id']

        try:
            backup = self.instance.backups.get(id=backup_id)
            self.cleaned_data['backup'] = backup
        except Backup.DoesNotExist:
            raise forms.ValidationError('Backup does not exist')

        return backup_id

    def clean(self):
        cleaned_data = super().clean()

        container = self.instance
        if container.state != ContainerState.STOPPED:
            raise forms.ValidationError('Container must be in STOPPED state')

        return cleaned_data

    class Meta:
        model = Backup
        fields = ['backup_id']


class FilterForm(BaseFilterForm):
    query = forms.CharField(
        required=False,
        widget=forms.TextInput(attrs={'placeholder': 'Search'}),
    )

    def filter_queryset(self, queryset, request):
        query = self.cleaned_data.get('query')

        if query:
            queryset = queryset.filter(
                models.Q(name__icontains=query) |
                models.Q(hostname__icontains=query) |
                models.Q(private_ipv4=query) |
                models.Q(public_ipv4=query)
            )

        return queryset
