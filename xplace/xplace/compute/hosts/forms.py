from django import forms

from xplace.base.forms import RequestFormMixin
from ..models import Host


class AddForm(RequestFormMixin, forms.ModelForm):
    class Meta:
        model = Host
        fields = ['hostname',
                  'ram',
                  'disk_size',
                  'num_cpus',
                  'public_ipv4',
                  'lvm_vgname', 'default_cpus', 'ssh_port_add']
        widgets = {
            'hostname': forms.TextInput(attrs={
                'placeholder': 'Hostname',
            }),
            'ram': forms.TextInput(attrs={
                'placeholder': 'RAM',
            }),
            'disk_size': forms.TextInput(attrs={
                'placeholder': 'Disk size',
            }),
            'num_cpus': forms.TextInput(attrs={
                'placeholder': 'Number of cpus',
            }),
            'public_ipv4': forms.TextInput(attrs={
                'placeholder': 'Public ip',
            }),
            'lvm_vgname': forms.TextInput(attrs={
                'placeholder': 'LVM vgname',
            }),
            'default_cpus': forms.TextInput(attrs={
                'placeholder': 'Default CPU cores',
            }),
            'ssh_port_add': forms.TextInput(attrs={
                'placeholder': 'SSH port add',
            }),
        }


class UpdateForm(AddForm):
    pass
