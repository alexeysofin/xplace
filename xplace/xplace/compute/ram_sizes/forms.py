from django import forms

from xplace.base.forms import RequestFormMixin
from ..models import RamSize


class AddForm(RequestFormMixin, forms.ModelForm):
    class Meta:
        model = RamSize
        fields = ['size']
        widgets = {
            'size': forms.TextInput(attrs={
                'placeholder': 'Size (MB)',
            }),
        }


class UpdateForm(AddForm):
    pass
