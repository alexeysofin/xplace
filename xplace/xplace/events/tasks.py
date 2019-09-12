import time

from celery import shared_task


@shared_task(bind=True)
def test(self, seconds, exc=None):
    self.update_state(meta={'test': 2})

    time.sleep(seconds)

    if exc:
        raise RuntimeError(exc)

    return {
        ''
    }
