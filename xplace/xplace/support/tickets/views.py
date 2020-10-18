from django.contrib import messages
from django.contrib.auth.mixins import LoginRequiredMixin
from django.db import transaction
from django.urls import reverse
from django.views import generic

from xplace.support.models import Ticket, TicketComment
from xplace.support.tickets import forms
from xplace.support.tickets.forms import CommentAddForm
from xplace.support.tickets import tasks


class OwnerQuerySetMixin:
    def get_queryset(self):
        return Ticket.objects.filter_request(
            request=self.request).order_by('-created_at')


class CommentOwnerQuerySetMixin:
    def get_queryset(self):
        return TicketComment.objects.filter_request(
            request=self.request).order_by('-created_at')


class ListView(LoginRequiredMixin, OwnerQuerySetMixin, generic.ListView):
    template_name = 'tickets/list.html'
    paginate_by = 10


class AddView(LoginRequiredMixin, generic.CreateView):
    template_name = 'tickets/add.html'
    form_class = forms.AddForm

    def get_success_url(self):
        return reverse('support:tickets:detail', kwargs=dict(pk=self.object.pk))

    def get_form_kwargs(self):
        kw = super().get_form_kwargs()
        kw['request'] = self.request
        return kw

    def form_valid(self, form):
        messages.success(self.request,
                         'Ticket successfully created.',
                         extra_tags='Done')

        form.instance.user = self.request.user

        response = super().form_valid(form)

        ticket_url = self.request.build_absolute_uri(
            reverse('support:tickets:detail',
                    kwargs={'pk': form.instance.pk})
        )
        transaction.on_commit(
            lambda: tasks.send_ticket_created.send(str(form.instance.id),
                                                    ticket_url)
        )

        return response


class DetailView(LoginRequiredMixin, OwnerQuerySetMixin, generic.DetailView):
    template_name = 'tickets/detail.html'

    def get_queryset(self):
        queryset = super().get_queryset()
        return queryset.prefetch_related('comments')

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context['comment_form'] = CommentAddForm(self.request, initial={
            'ticket': self.object
        })
        return context


class SettingsView(LoginRequiredMixin, OwnerQuerySetMixin, generic.UpdateView):
    template_name = 'tickets/detail_settings.html'
    form_class = forms.UpdateForm

    def get_form_kwargs(self):
        kw = super().get_form_kwargs()
        kw['request'] = self.request
        return kw

    def get_success_url(self):
        return reverse('support:tickets:settings',
                       kwargs=dict(pk=self.object.pk))

    def form_valid(self, form):
        messages.success(self.request,
                         'Ticket successfully updated, ',
                         extra_tags='Done')

        response = super().form_valid(form)

        if form.instance.is_closed:
            ticket_url = self.request.build_absolute_uri(
                reverse('support:tickets:detail',
                        kwargs={'pk': form.instance.pk})
            )
            transaction.on_commit(
                lambda: tasks.send_ticket_closed.send(
                    str(form.instance.id), ticket_url)
            )

        return response


class DeleteView(LoginRequiredMixin, OwnerQuerySetMixin, generic.DeleteView):
    template_name = 'tickets/detail_delete.html'

    def get_success_url(self):
        return reverse('support:tickets:list')

    def delete(self, request, *args, **kwargs):
        response = super().delete(request, *args, **kwargs)
        messages.success(self.request,
                         'Ticket successfully deleted.',
                         extra_tags='Done')
        return response


class CommentAddView(LoginRequiredMixin, generic.CreateView):
    form_class = forms.CommentAddForm

    def get_success_url(self):
        return reverse('support:tickets:detail',
                       kwargs=dict(pk=self.object.ticket.pk))

    def get_form_kwargs(self):
        kw = super().get_form_kwargs()
        kw['request'] = self.request
        return kw

    def form_valid(self, form):
        messages.success(self.request,
                         'Comment successfully created.',
                         extra_tags='Done')

        form.instance.user = self.request.user

        response = super().form_valid(form)

        ticket_url = self.request.build_absolute_uri(
            reverse('support:tickets:detail',
                    kwargs={'pk': form.instance.ticket.pk})
        )
        transaction.on_commit(
            lambda: tasks.send_ticket_comment.send(
                str(form.instance.id), ticket_url)
        )

        return response


class CommentUpdateView(LoginRequiredMixin, CommentOwnerQuerySetMixin,
                        generic.UpdateView):
    template_name = 'tickets/comment_update.html'
    form_class = forms.CommentUpdateForm

    def get_form_kwargs(self):
        kw = super().get_form_kwargs()
        kw['request'] = self.request
        return kw

    def get_success_url(self):
        return reverse('support:tickets:detail',
                       kwargs=dict(pk=self.object.ticket.pk))

    def form_valid(self, form):
        messages.success(self.request,
                         'Comment successfully updated, ',
                         extra_tags='Done')
        response = super().form_valid(form)

        return response


class CommentDeleteView(LoginRequiredMixin,
                        CommentOwnerQuerySetMixin,
                        generic.DeleteView):
    template_name = 'tickets/comment_delete.html'

    def get_success_url(self):
        return reverse('support:tickets:detail',
                       kwargs=dict(pk=self.object.ticket.pk))

    def delete(self, request, *args, **kwargs):
        response = super().delete(request, *args, **kwargs)
        messages.success(self.request,
                         'Comment successfully deleted.',
                         extra_tags='Done')
        return response
