import json
import logging
import shlex
import uuid

import dramatiq

from django.conf import settings
from django.core.cache import cache
from django.core.mail import send_mail
from django.db import transaction
from django.template.loader import render_to_string
from django.utils import timezone

from nameko.standalone.rpc import ClusterRpcProxy

from xplace.base.utils import generate_random_token
from xplace.compute.containers import const

from .const import PowerAction, BACKUP_LOCK_KEY
from .configuration import resources_dict
from ..models import (
    Container, ContainerState, ContainerEvent, ContainerEventType, Backup
)

_log = logging.getLogger(__name__)


def get_host_rpc_name(container):
    return 'compute.host.{}'.format(container.host.hostname)


@dramatiq.actor
@transaction.atomic
def create_container(container_id, ssh_keys=()):
    container = Container.objects.get(id=container_id)

    if ssh_keys:
        ssh_keys = container.user.ssh_keys.filter(id__in=ssh_keys)

    password = generate_random_token(32)

    with ClusterRpcProxy(settings.NAMEKO_CONFIG) as cluster_rpc:
        host_rpc = cluster_rpc[get_host_rpc_name(container)]

        create_response = host_rpc.create_container(
            **{
                'name': container.hostname,
                'template': container.image.lxc_template_name,
                'backend': 'lvm',
                'vgname': container.host.lvm_vgname,
                'fssize': container.format_disk_size(),
                'fstype': 'ext4',
                'config': {
                    'cgroups.conf': resources_dict(container)
                },
                'password': password,
                'ssh_keys': [key.public_key for key in ssh_keys],
                'template_args': shlex.split(
                    container.image.lxc_template_args or '')
            }
        )

        state_response = host_rpc.change_container_state(
            container.hostname, 'start', 30
        )

    container.username = create_response['username']

    container.private_ipv4 = state_response.get('info', {}).get('IP')

    email_ctx = {
        'username': container.username,
        'password': password,
        'hostname': container.hostname,
        'ssh_keys': [key.name for key in ssh_keys],
        'ssh_connect_string': container.get_ssh_connect_string()
    }

    send_mail(
        'xplace.pro container created',
        render_to_string('emails/containers/created.txt', context=email_ctx),
        settings.FROM_EMAIL,
        [container.user.email],
        html_message=render_to_string(
            'emails/containers/created.html', context=email_ctx),
    )

    ContainerEvent.objects.create(
        container=container,
        type=ContainerEventType.STARTED
    )

    container.state = ContainerState.RUNNING
    container.event_id = None
    container.save()


@dramatiq.actor
@transaction.atomic
def change_container_state(container_id, power_action):
    container = Container.objects.get(id=container_id)

    if power_action == PowerAction.STOP:
        state = ContainerState.STOPPED
        event_type = ContainerEventType.STOPPED
    elif power_action == PowerAction.START:
        state = ContainerState.RUNNING
        event_type = ContainerEventType.STARTED
    elif power_action == PowerAction.REBOOT:
        state = ContainerState.RUNNING
        event_type = ContainerEventType.REBOOTED
    else:
        state = event_type = None

    if state is not None and event_type is not None:

        with ClusterRpcProxy(settings.NAMEKO_CONFIG) as cluster_rpc:
            host_rpc = cluster_rpc[get_host_rpc_name(container)]

            host_rpc.change_container_state(
                container.hostname, power_action.lower(),
                stop_timeout=const.CONTAINER_STOP_TIMEOUT)

        container.state = state
        container.event_id = None

        # TODO: update_fields everywhere (including modified_date)
        container.save()
        ContainerEvent.objects.create(
            container=container,
            type=event_type
        )


@dramatiq.actor
@transaction.atomic()
def delete_container(container_id):
    container = Container.objects.get(id=container_id)

    with ClusterRpcProxy(settings.NAMEKO_CONFIG) as cluster_rpc:
        host_rpc = cluster_rpc[get_host_rpc_name(container)]
        host_rpc.delete_container(container.hostname)

    container.delete()


@dramatiq.actor
def update_container(container_id):
    container = Container.objects.get(id=container_id)

    with ClusterRpcProxy(settings.NAMEKO_CONFIG) as cluster_rpc:
        host_rpc = cluster_rpc[get_host_rpc_name(container)]
        host_rpc.update_container(container.hostname, config={
            'cgroups.conf': resources_dict(container)
        })


@dramatiq.actor
@transaction.atomic
def reset_container_password(container_id):
    container = Container.objects.get(id=container_id)

    password = generate_random_token(32)

    with ClusterRpcProxy(settings.NAMEKO_CONFIG) as cluster_rpc:
        host_rpc = cluster_rpc[get_host_rpc_name(container)]

        host_rpc.set_container_password(
            container.hostname, container.username, password
        )

    email_ctx = {
        'username': container.username,
        'password': password,
        'hostname': container.hostname
    }

    send_mail(
        'xplace.pro container password reset',
        render_to_string('emails/containers/password_reset.txt',
                         context=email_ctx),
        settings.FROM_EMAIL,
        [container.user.email],
        html_message=render_to_string(
            'emails/containers/password_reset.html', context=email_ctx),
    )

    ContainerEvent.objects.create(
        container=container,
        type=ContainerEventType.PASSWORD_RESET
    )


@dramatiq.actor
@transaction.atomic()
def force_container_state(hostname, state):
    container = Container.objects.get(hostname=hostname)

    if container.state not in [ContainerState.RUNNING,
                               ContainerState.STOPPED]:
        return

    if container.state == state:
        return

    if state == ContainerState.STOPPED:
        event_type = ContainerEventType.STOPPED
    elif state == ContainerState.RUNNING:
        event_type = ContainerEventType.STARTED
    else:
        event_type = None

    container.change_state(state, event_id=None)

    if event_type is not None:
        ContainerEvent.objects.create(
            container=container,
            type=event_type
        )


@dramatiq.actor
def backup_all_containers(container_id=None):
    lock = cache.client.lock(BACKUP_LOCK_KEY, timeout=21600)

    try:
        acquired = lock.acquire(blocking=False)

        if acquired:
            _log.info('Running backup')

            containers = Container.objects.all()

            if container_id is not None:
                containers = containers.filter(pk=container_id)

            for container in containers:
                container.refresh_from_db()

                _log.info('Backing up container %s', container.hostname)

                prev_state = container.state

                event_id = str(uuid.uuid4().hex)

                with transaction.atomic():
                    container.state = ContainerState.BACKING_UP
                    container.event_id = event_id
                    container.save(update_fields=['state', 'event_id'])

                filename = 'backup.{}.{}.raw'.format(
                    container.hostname,
                    timezone.now().isoformat()
                )

                with ClusterRpcProxy(settings.NAMEKO_CONFIG) as cluster_rpc:
                    host_rpc = cluster_rpc[get_host_rpc_name(container)]

                    host_rpc.change_container_state(
                        container.hostname, 'stop',
                        stop_timeout=const.CONTAINER_STOP_TIMEOUT)

                    host_rpc.backup_container(
                        container.hostname, filename)

                    if prev_state == ContainerState.RUNNING:
                        host_rpc.change_container_state(
                            container.hostname, 'start')

                with transaction.atomic():
                    container.state = prev_state
                    container.event_id = None
                    container.save(update_fields=['state', 'event_id'])

                    backup = Backup.objects.create(
                        container=container,
                        filename=filename
                    )

                    ContainerEvent.objects.create(
                        container=container,
                        type=ContainerEventType.BACKED_UP,
                        metadata=json.dumps({
                            'backup_id': str(backup.id)
                        })
                    )

                    cleanup_backups(container.id)

                _log.info('Finished backing up container %s',
                          container.hostname)
        else:
            _log.info('Can not acquire backup lock')

    finally:
        lock.release()


@dramatiq.actor
def cleanup_backups(container_id):
    try:
        container = Container.objects.get(id=container_id)
    except Container.DoesNotExist:
        pass
    else:
        backups_for_deletion = container.backups.all().order_by(
            '-created_at')[settings.MAX_BACKUPS:]

        with ClusterRpcProxy(settings.NAMEKO_CONFIG) as cluster_rpc:
            host_rpc = cluster_rpc[get_host_rpc_name(container)]

            # TODO: store backups in separate directory for each container

            for backup in backups_for_deletion:
                # TODO: catch file not found error
                host_rpc.delete_container_backup(backup.filename)
                backup.delete()


@dramatiq.actor
@transaction.atomic()
def restore_from_backup(container_id, backup_id):
    container = Container.objects.get(id=container_id)
    backup = Backup.objects.get(id=backup_id)

    with ClusterRpcProxy(settings.NAMEKO_CONFIG) as cluster_rpc:
        host_rpc = cluster_rpc[get_host_rpc_name(container)]
        host_rpc.restore_container(container.hostname, backup.filename)

    ContainerEvent.objects.create(
        container=container,
        type=ContainerEventType.RESTORED,
        metadata=json.dumps({
            'backup_id': str(backup.id)
        })
    )

    container.state = ContainerState.STOPPED
    container.event_id = None

    container.save()

