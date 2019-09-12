import json
import datetime

from django.conf import settings
from django.core import signing

from xplace.users import models

EMAIL_VERIFICATION_SALT = 'email-verification'
EMAIL_VERIFICATION_MAX_AGE = datetime.timedelta(hours=24)


RESET_PASSWORD_SALT = 'reset-password'
RESET_PASSWORD_MAX_AGE = datetime.timedelta(minutes=30)


def get_reset_password_link(request, user):
    return request.build_absolute_uri(
        '{}?token={}'.format(
            settings.RESET_PASSWORD_CONFIRMATION_PATH,
            get_reset_password_token(user)))


def get_email_verification_token(user):
    return signing.dumps(
        {'user_id': str(user.id)},
        salt=EMAIL_VERIFICATION_SALT
    )


def check_verification_token(token):
    return signing.loads(
        token, salt=EMAIL_VERIFICATION_SALT,
        max_age=EMAIL_VERIFICATION_MAX_AGE
    )


def get_reset_password_salt(user):
    return '{}.{}'.format(RESET_PASSWORD_SALT, user.password)


def get_reset_password_token(user):
    return signing.dumps(
        {'user_id': str(user.id)},
        # single use token which is not usable after password changed.
        salt=get_reset_password_salt(user)
    )


def check_reset_password_token(token):
    try:
        data = token.split(signing.TimestampSigner().sep)[0]
        data = json.loads(signing.b64_decode(
            data.encode('utf-8')).decode('utf-8'))
        user = models.User.objects.get(id=data['user_id'])
    except (ValueError, models.User.DoesNotExist):
        raise signing.BadSignature()

    return user, signing.loads(
        token, salt=get_reset_password_salt(user),
        max_age=RESET_PASSWORD_MAX_AGE
    )
