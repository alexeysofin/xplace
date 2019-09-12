import copy
import string
from random import SystemRandom

random = SystemRandom()


def generate_random_token(character_length,
                          choices=string.ascii_letters + string.digits):
    return ''.join([random.choice(choices) for _ in range(character_length)])


def normalize_email(email):
    return email.strip().lower()


def copy_dict(original, **kwargs):
    new = copy.deepcopy(original)
    new.update(kwargs)
    return new
