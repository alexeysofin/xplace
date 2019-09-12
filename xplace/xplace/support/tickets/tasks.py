from celery import shared_task
from django.conf import settings
from django.core.mail import send_mail
from django.template.loader import render_to_string

from xplace.support import models
from xplace.users import models as user_models


def get_ticket_subject(ticket):
    return 'xplace.pro ticket {}'.format(ticket.code)


def get_admin_emails(ticket):
    admins = user_models.User.objects.filter(is_superuser=True)

    if ticket.assignee is not None:
        return [ticket.assignee.email]

    admin_emails = []

    for admin in admins:
        if admin.email != ticket.user.email:
            admin_emails.append(admin.email)

    return admin_emails


@shared_task()
def send_ticket_created(ticket_id, ticket_url):
    ticket = models.Ticket.objects.get(id=ticket_id)

    email_ctx = {
        'ticket': ticket,
        'ticket_url': ticket_url
    }

    user_email = ticket.user.email

    admin_emails = get_admin_emails(ticket)

    def send(emails):
        send_mail(
            get_ticket_subject(ticket),
            render_to_string('emails/tickets/created.txt', context=email_ctx),
            settings.FROM_EMAIL,
            emails,
            html_message=render_to_string(
                'emails/tickets/created.html', context=email_ctx),
        )

    send([user_email])

    if admin_emails:
        send(admin_emails)


@shared_task()
def send_ticket_closed(ticket_id, ticket_url):
    ticket = models.Ticket.objects.get(id=ticket_id)

    email_ctx = {
        'ticket': ticket,
        'ticket_url': ticket_url
    }

    user_email = ticket.user.email

    admin_emails = get_admin_emails(ticket)

    def send(emails):
        send_mail(
            get_ticket_subject(ticket),
            render_to_string('emails/tickets/closed.txt', context=email_ctx),
            settings.FROM_EMAIL,
            emails,
            html_message=render_to_string(
                'emails/tickets/closed.html', context=email_ctx),
        )

    send([user_email])

    if admin_emails:
        send(admin_emails)


@shared_task()
def send_ticket_comment(comment_id, ticket_url):
    comment = models.TicketComment.objects.get(id=comment_id)

    email_ctx = {
        'comment': comment,
        'ticket_url': ticket_url
    }

    ticket = comment.ticket

    user_email = ticket.user.email

    admin_emails = get_admin_emails(ticket)

    def send(emails):
        send_mail(
            get_ticket_subject(comment.ticket),
            render_to_string('emails/tickets/message.txt', context=email_ctx),
            settings.FROM_EMAIL,
            emails,
            html_message=render_to_string(
                'emails/tickets/message.html', context=email_ctx),
        )

    send([user_email])

    if admin_emails:
        send(admin_emails)
