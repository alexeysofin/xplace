from celery import shared_task
from django.conf import settings
from django.template.loader import render_to_string
from django.core.mail import send_mail


@shared_task
def send_invite_confirmation(email, link):
    send_mail(
        'xplace.pro invite confirmation',
        render_to_string(
            'emails/invite/invite_confirm.txt', context={
                'confirmation_link': link
        }),
        settings.FROM_EMAIL,
        [email],
        html_message=render_to_string(
            'emails/invite/invite_confirm.html', context={
                'confirmation_link': link
            }),
    )
