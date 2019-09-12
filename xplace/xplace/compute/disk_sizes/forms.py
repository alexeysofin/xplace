from django import forms

from xplace.base.forms import RequestFormMixin
from ..models import DiskSize


class AddForm(RequestFormMixin, forms.ModelForm):
    class Meta:
        model = DiskSize
        fields = ['size']
        widgets = {
            'size': forms.TextInput(attrs={
                'placeholder': 'Size (GB)',
            }),
        }


class UpdateForm(AddForm):
    pass
