from __future__ import absolute_import, unicode_literals
import os

import raven
from raven.contrib.celery import register_signal, register_logger_signal

from celery import Celery as CeleryBase
from celery.schedules import crontab

# set the default Django settings module for the 'celery' program.
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "xplace.settings")  # NOQA

from django.conf import settings  # NOQA


class Celery(CeleryBase):
    def on_configure(self):
        client = raven.Client(dsn=settings.RAVEN_CONFIG.get("dsn"))

        # register a custom filter to filter out duplicate logs
        register_logger_signal(client)

        # hook into the Celery error handler
        register_signal(client)


app = Celery("xplace")

# Using a string here means the worker doesn't have to serialize
# the configuration object to child processes.
# - namespace='CELERY' means all celery-related configuration keys
#   should have a `CELERY_` prefix.
app.config_from_object("django.conf:settings", namespace="CELERY")

# Load task modules from all registered Django app configs.
app.autodiscover_tasks()

app.conf.beat_schedule = {
    "add-every-30-seconds": {
        "task": "xplace.compute.tasks.backup_all_containers",
        "schedule": crontab(hour=0, minute=30, day_of_week=1),
        "args": (),
    },
}
app.conf.timezone = "UTC"
