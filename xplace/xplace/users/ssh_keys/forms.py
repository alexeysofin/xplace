from sshpubkeys import SSHKey, InvalidKeyException

from django import forms

from xplace.base.forms import RequestFormMixin
from ..models import SshKey


class SshKeyForm(RequestFormMixin, forms.ModelForm):
    class Meta:
        model = SshKey
        fields = ['name', 'public_key']
        widgets = {
            'name': forms.TextInput(attrs={'placeholder': 'Name'}),
            'public_key': forms.Textarea(attrs={'placeholder': 'Public key'})
        }

    def clean_public_key(self):
        public_key = self.cleaned_data['public_key']

        key = SSHKey(public_key)

        try:
            key.parse()
        except InvalidKeyException as exc:
            raise forms.ValidationError('Invalid ssh public key') from exc
        else:
            self.instance.hash_md5 = key.hash_md5().replace('MD5:', '')

        return public_key
