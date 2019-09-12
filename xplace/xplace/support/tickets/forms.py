from django import forms
from django.utils import timezone

from xplace.base import permissions
from xplace.base.forms import ExtendedFormMixin
from xplace.base.utils import copy_dict
from xplace.compute.models import Container
from xplace.network.models import Domain
from xplace.users.models import User
from ..models import Ticket, TicketStatus, TicketComment


class AddForm(ExtendedFormMixin, forms.ModelForm):
    def __init__(self, request, *args, **kwargs):
        super().__init__(request, *args, **kwargs)

        if not request.user.is_superuser:
            container_queryset = \
                self.fields['container'].queryset.filter_request(request)
            self.fields['container'].queryset = container_queryset

            domain_queryset = self.fields['domain'].queryset.filter_request(
                request
            )
            self.fields['domain'].queryset = domain_queryset

        if 'assignee' in self.fields:
            self.fields['assignee'].queryset = User.objects.filter(
                is_superuser=True
            )

    container = forms.ModelChoiceField(
        required=False,
        queryset=Container.objects.all(),
        widget=forms.Select(
            attrs={
                'class': 'dropdown ui selection',
                'placeholder': 'Container'
            }
        ),
        empty_label='Select container',
    )

    domain = forms.ModelChoiceField(
        required=False,
        queryset=Domain.objects.all(),
        widget=forms.Select(
            attrs={
                'class': 'dropdown ui selection',
                'placeholder': 'Domain'
            }
        ),
        empty_label='Select domain'
    )

    assignee = forms.ModelChoiceField(
        required=False,
        queryset=Domain.objects.all(),
        widget=forms.Select(
            attrs={
                'class': 'dropdown ui selection',
                'placeholder': 'Assignee'
            }
        ),
        empty_label='Select assignee'
    )

    permissions = {
        'assignee': permissions.is_superuser,
    }

    class Meta:
        model = Ticket
        fields = ['title', 'assignee',
                  'description', 'container', 'domain']

        widgets = {
            'title': forms.TextInput(attrs={
                'placeholder': 'Title',
            }),
            'description': forms.Textarea(attrs={
                'placeholder': 'Description',
            }),
            'assignee': forms.Select(
                attrs={
                    'class': 'dropdown ui selection',
                    'placeholder': 'Assignee'
                }
            ),
        }

    def save(self, commit=True):
        if self.instance.is_closed:
            self.instance.closed_at = timezone.now()
        else:
            self.instance.closed_at = None
        return super().save(commit=commit)


class UpdateForm(AddForm):
    permissions = copy_dict(
        AddForm.permissions,
        **{
            'due_date': permissions.is_superuser,
            'status': permissions.is_superuser
        }
    )

    class Meta(AddForm.Meta):
        fields = AddForm.Meta.fields + ['status', 'due_date']
        widgets = copy_dict(
            AddForm.Meta.widgets,
            **{
                'status': forms.Select(
                    attrs={
                        'class': 'dropdown ui selection',
                        'placeholder': 'Status'
                    }
                ),
            }
        )


class CommentAddForm(ExtendedFormMixin, forms.ModelForm):
    class Meta:
        fields = ['message', 'ticket']
        model = TicketComment
        widgets = {
            'message': forms.Textarea(attrs={
                'placeholder': 'Message',
            }),
            'ticket': forms.HiddenInput()
        }

    def clean_ticket(self):
        ticket = self.cleaned_data['ticket']
        if not self.request.user.is_superuser:
            if ticket.user != self.request.user:
                raise forms.ValidationError('Ticket not found')
        return ticket


class CommentUpdateForm(ExtendedFormMixin, forms.ModelForm):
    class Meta:
        fields = ['message']
        model = TicketComment
        widgets = {
            'message': forms.Textarea(attrs={
                'placeholder': 'Message',
            }),
        }
