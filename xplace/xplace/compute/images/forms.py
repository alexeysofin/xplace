from django import forms

from xplace.base.forms import RequestFormMixin
from ..models import Image


class AddForm(RequestFormMixin, forms.ModelForm):
    class Meta:
        model = Image
        fields = ['name', 'version', 'lxc_template_name', 'lxc_template_args']

        widgets = {
            'name': forms.TextInput(attrs={
                'placeholder': 'Name',
            }),
            'version': forms.TextInput(attrs={
                'placeholder': 'Version',
            }),
            'lxc_template_name': forms.TextInput(attrs={
                'placeholder': 'LXC template name',
            }),
            'lxc_template_args': forms.TextInput(attrs={
                'placeholder': 'LXC template args',
            }),
        }


class UpdateForm(AddForm):
    pass
