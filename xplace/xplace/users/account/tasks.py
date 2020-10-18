import dramatiq
from django.conf import settings
from django.template.loader import render_to_string
from django.core.mail import send_mail


@dramatiq.actor
def send_registration_link(email, link):
    send_mail(
        'xplace.pro registration confirmation',
        render_to_string('emails/signup/signup_confirm.txt', context={
            'confirmation_link': link
        }),
        settings.FROM_EMAIL,
        [email],
        html_message=render_to_string(
            'emails/signup/signup_confirm.html', context={
                'confirmation_link': link
            }),
    )


@dramatiq.actor
def send_welcome(email):
    send_mail(
        'Welcome to xplace.pro',
        render_to_string('emails/signup/welcome.txt'),
        settings.FROM_EMAIL,
        [email],
        html_message=render_to_string('emails/signup/welcome.html'),
    )


@dramatiq.actor
def send_reset_password_link(email, link):
    send_mail(
        'xplace.pro reset password confirmation',
        render_to_string(
            'emails/reset_password/reset_password_confirm.txt', context={
                'confirmation_link': link
        }),
        settings.FROM_EMAIL,
        [email],
        html_message=render_to_string(
            'emails/reset_password/reset_password_confirm.html', context={
                'confirmation_link': link
            }),
    )


@dramatiq.actor
def send_reset_password_notification(email):
    send_mail(
        'Password reset at xplace.pro',
        render_to_string(
            'emails/reset_password/reset_password_notification.txt'),
        settings.FROM_EMAIL,
        [email],
        html_message=render_to_string(
            'emails/reset_password/reset_password_notification.html'),
    )
