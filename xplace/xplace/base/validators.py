from django.forms import ValidationError

ASCII_CHARACTERS = (
    '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ-_.'
)

ERROR_MESSAGES = {
    'invalid_ascii': 'Some characters are not allowed, '
                     'use [{0}]'.format(ASCII_CHARACTERS)
}


def validate_ascii(value):
    for ch in value:
        if ch not in ASCII_CHARACTERS:
            raise ValidationError(ERROR_MESSAGES['invalid_ascii'])
    return value
