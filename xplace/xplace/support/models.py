import string

from django.conf import settings
from django.db import models

from djchoices import DjangoChoices, ChoiceItem

from xplace.base.models import BaseModel
from xplace.base.utils import generate_random_token


class TicketStatus(DjangoChoices):
    OPEN = ChoiceItem('OPEN')
    IN_PROGRESS = ChoiceItem('IN_PROGRESS')
    CLOSED = ChoiceItem('CLOSED')


def generate_ticket_code():
    return generate_random_token(choices=string.digits,
                                 character_length=6)


class TicketQueryset(models.QuerySet):
    def filter_request(self, request, *args, **kwargs):
        fs = {}
        if not request.user.is_superuser:
            fs['user'] = request.user
        return self.filter(*args, **kwargs, **fs)

    def optimized(self):
        return self.select_related('user', 'assignee', 'container', 'domain')


class Ticket(BaseModel):
    objects = TicketQueryset.as_manager()

    user = models.ForeignKey(settings.AUTH_USER_MODEL,
                             on_delete=models.CASCADE,
                             related_name='opened_tickets')

    assignee = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE,
        related_name='assigned_tickets',
        null=True, blank=True
    )

    status = models.CharField(
        max_length=16, choices=TicketStatus.choices, db_index=True,
        default=TicketStatus.OPEN)

    closed_at = models.DateTimeField(null=True, blank=True)
    due_date = models.DateTimeField(null=True, blank=True)

    code = models.CharField(max_length=16, db_index=True,
                            default=generate_ticket_code)

    title = models.CharField(max_length=255)
    description = models.TextField()

    container = models.ForeignKey('compute.Container',
                                  on_delete=models.CASCADE,
                                  related_name='tickets',
                                  null=True,
                                  blank=True)

    domain = models.ForeignKey('network.Domain',
                               on_delete=models.CASCADE,
                               related_name='tickets',
                               null=True,
                               blank=True)

    @property
    def is_closed(self):
        return self.status == TicketStatus.CLOSED


class TicketCommentQueryset(models.QuerySet):
    def filter_request(self, request, *args, **kwargs):
        fs = {}
        if not request.user.is_superuser:
            fs['user'] = request.user
        return self.filter(*args, **kwargs, **fs)


class TicketComment(BaseModel):
    objects = TicketCommentQueryset.as_manager()

    class Meta:
        ordering = ['-created_at']
    ticket = models.ForeignKey(Ticket, on_delete=models.CASCADE,
                               related_name='comments')
    user = models.ForeignKey(settings.AUTH_USER_MODEL,
                             on_delete=models.CASCADE,
                             related_name='comments')
    message = models.TextField()
