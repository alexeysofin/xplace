import string
from random import SystemRandom


random = SystemRandom()


def generate_unique_id(length=5):
    return ''.join([random.choice(
        string.ascii_lowercase + string.digits) for _ in range(length)])
