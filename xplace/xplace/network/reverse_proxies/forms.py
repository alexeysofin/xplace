from django import forms

from xplace.base.forms import RequestFormMixin
from ..models import ReverseProxy


class AddForm(RequestFormMixin, forms.ModelForm):
    class Meta:
        model = ReverseProxy
        fields = ['hostname', 'public_ipv4']
        widgets = {
            'hostname': forms.TextInput(attrs={
                'placeholder': 'Hostname',
            }),
            'public_ipv4': forms.TextInput(attrs={
                'placeholder': 'Public ip',
            }),
        }


class UpdateForm(AddForm):
    pass
