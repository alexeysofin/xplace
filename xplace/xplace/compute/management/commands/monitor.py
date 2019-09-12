from __future__ import absolute_import, unicode_literals


from django.core.management import BaseCommand
from django.conf import settings

from kombu import Connection
from kombu.mixins import ConsumerMixin
from kombu.log import get_logger
from kombu import Exchange, Queue

from xplace.compute.containers.tasks import force_container_state

task_exchange = Exchange('lxc-state-monitor.events',
                         type='topic', auto_delete=True)

task_queues = [
    Queue('xplace-lxc-state-monitor.events', task_exchange, routing_key='#')]

logger = get_logger(__name__)


class Worker(ConsumerMixin):

    def __init__(self, connection):
        self.connection = connection

    def get_consumers(self, Consumer, channel):
        return [Consumer(queues=task_queues,
                         accept=['pickle', 'json'],
                         callbacks=[self.process_task])]

    def process_task(self, body, message):
        logger.info('Received task %s %s', body, message)

        try:
            force_container_state(body.get('hostname'), body.get('state'))
        except Exception:
            logger.exception('Error in monitor task')

        message.ack()


class Command(BaseCommand):
    help = 'Listen host monitor events'

    def handle(self, *args, **options):
        print('Connecting to', settings.NAMEKO_CONFIG.get('AMQP_URI'))
        with Connection(settings.NAMEKO_CONFIG.get('AMQP_URI')) as conn:
            try:
                worker = Worker(conn)
                worker.run()
            except KeyboardInterrupt:
                print('bye bye')
