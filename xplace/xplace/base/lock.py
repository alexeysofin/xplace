from django.core.cache import cache
from django.core.exceptions import ImproperlyConfigured


def lock(key, *args, **kwargs):
    try:
        _lock = cache.client.lock
    except AttributeError:
        raise ImproperlyConfigured('Cache lock is not supported')

    return _lock(key, *args, **kwargs)
