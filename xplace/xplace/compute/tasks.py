import json
import logging
import shlex
import uuid

from celery import shared_task

from django.conf import settings
from django.core.cache import cache
from django.core.mail import send_mail
from django.db import transaction
from django.template.loader import render_to_string

from nameko.standalone.rpc import ClusterRpcProxy

from xplace.base.exceptions import StateException
from xplace.base.utils import generate_random_token
from xplace.compute import const
from xplace.compute import models
from xplace.compute.configuration import resources_dict


_log = logging.getLogger(__name__)


def get_host_rpc_name(container):
    return 'compute.host.{}'.format(container.host.hostname)


@shared_task
@transaction.atomic
def create_container(container_id, ssh_keys=()):
    container = models.Container.objects.get(
        id=container_id)

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

    models.ContainerEvent.objects.create(
        container=container,
        type=models.ContainerEventType.STARTED
    )

    container.change_state(
        models.ContainerState.RUNNING,
        event_id=None,
        private_ipv4=state_response.get('info', {}).get('IP'),
        username=create_response['username']
    )

    email_ctx = {
        'username': container.username,
        'password': password,
        'hostname': container.hostname,
        'ssh_keys': [key.name for key in ssh_keys],
        'ssh_connect_string': container.get_ssh_connect_string()
    }

    def send_email():
        send_mail(
            'xplace.pro container created',
            render_to_string('emails/containers/created.txt',
                             context=email_ctx),
            settings.FROM_EMAIL,
            [container.user.email],
            html_message=render_to_string(
                'emails/containers/created.html', context=email_ctx),
        )

    transaction.on_commit(send_email)

    return {
        'container_id': container_id,
        'task': 'CREATE_CONTAINER'
    }


@shared_task
@transaction.atomic
def change_container_state(container_id, power_action, create_event=True):
    container = models.Container.objects.get(id=container_id)

    if power_action == const.PowerAction.STOP:
        state = models.ContainerState.STOPPED
        event_type = models.ContainerEventType.STOPPED
    elif power_action == const.PowerAction.START:
        state = models.ContainerState.RUNNING
        event_type = models.ContainerEventType.STARTED
    elif power_action == const.PowerAction.REBOOT:
        state = models.ContainerState.RUNNING
        event_type = models.ContainerEventType.REBOOTED
    else:
        state = event_type = None

    if state is not None and event_type is not None:
        container.change_state(state, event_id=None)

        with ClusterRpcProxy(settings.NAMEKO_CONFIG) as cluster_rpc:
            host_rpc = cluster_rpc[get_host_rpc_name(container)]

            host_rpc.change_container_state(
                container.hostname, power_action.lower(),
                stop_timeout=const.CONTAINER_STOP_TIMEOUT)

        if create_event:
            models.ContainerEvent.objects.create(
                container=container,
                type=event_type
            )

    return {
        'container_id': container_id,
        'task': 'CHANGE_CONTAINER_STATE'
    }


@shared_task
@transaction.atomic()
def delete_container(container_id):
    container = models.Container.objects.get(id=container_id)

    with ClusterRpcProxy(settings.NAMEKO_CONFIG) as cluster_rpc:
        host_rpc = cluster_rpc[get_host_rpc_name(container)]
        host_rpc.delete_container(container.hostname)

        for backup in container.backups.all():
            # TODO: catch file not found error
            host_rpc.delete_container_backup(backup.filename)
            backup.delete()

    container.delete()

    return {
        'container_id': container_id,
        'task': 'DELETE_CONTAINER'
    }


@shared_task
@transaction.atomic()
def resize_container_storage(container_id):
    container = models.Container.objects.get(id=container_id)

    with ClusterRpcProxy(settings.NAMEKO_CONFIG) as cluster_rpc:
        host_rpc = cluster_rpc[get_host_rpc_name(container)]
        host_rpc.resize_container_storage(container.hostname,
                                          container.format_disk_size())

    container.change_state(
        models.ContainerState.STOPPED, event_id=None)

    models.ContainerEvent.objects.create(
        container=container,
        type=models.ContainerEventType.RESIZED,
    )

    return {
        'container_id': container_id,
        'task': 'RESIZE_CONTAINER_STORAGE'
    }


@shared_task
@transaction.atomic()
def update_container(container_id, return_to_state):
    container = models.Container.objects.get(id=container_id)

    with ClusterRpcProxy(settings.NAMEKO_CONFIG) as cluster_rpc:
        host_rpc = cluster_rpc[get_host_rpc_name(container)]
        host_rpc.update_container(container.hostname, config={
            'cgroups.conf': resources_dict(container)
        })

    container.change_state(
        return_to_state, event_id=None)

    models.ContainerEvent.objects.create(
        container=container,
        type=models.ContainerEventType.UPDATED,
    )

    return {
        'container_id': container_id,
        'task': 'UPDATE_CONTAINER'
    }


@shared_task
@transaction.atomic
def reset_container_password(container_id):
    container = models.Container.objects.get(id=container_id)

    password = generate_random_token(32)

    with ClusterRpcProxy(settings.NAMEKO_CONFIG) as cluster_rpc:
        host_rpc = cluster_rpc[get_host_rpc_name(container)]

        host_rpc.set_container_password(
            container.hostname, container.username, password
        )

    email_ctx = {
        'username': container.username,
        'password': password,
        'hostname': container.hostname,
        'ssh_connect_string': container.get_ssh_connect_string()
    }

    def send_email():
        send_mail(
            'xplace.pro container password reset',
            render_to_string('emails/containers/password_reset.txt',
                             context=email_ctx),
            settings.FROM_EMAIL,
            [container.user.email],
            html_message=render_to_string(
                'emails/containers/password_reset.html', context=email_ctx),
        )

    transaction.on_commit(send_email)

    models.ContainerEvent.objects.create(
        container=container,
        type=models.ContainerEventType.PASSWORD_RESET
    )


@shared_task()
@transaction.atomic()
def force_container_state(hostname, state):
    container = models.Container.objects.get(hostname=hostname)

    if container.state == state:
        return

    container.change_state(state, event_id=None)

    if state == models.ContainerState.STOPPED:
        event_type = models.ContainerEventType.STOPPED
    elif state == models.ContainerState.RUNNING:
        event_type = models.ContainerEventType.STARTED
    else:
        event_type = None

    if event_type is not None:
        models.ContainerEvent.objects.create(
            container=container,
            type=event_type
        )


@shared_task()
@transaction.atomic()
def create_container_backup(backup_id):
    backup = models.Backup.objects.get(id=backup_id)

    _log.info('Creating container backup %s', backup.container.id)

    with ClusterRpcProxy(settings.NAMEKO_CONFIG) as cluster_rpc:
        host_rpc = cluster_rpc[get_host_rpc_name(backup.container)]

        host_rpc.backup_container(backup.container.hostname, backup.filename)

    backup.container.change_state(models.ContainerState.STOPPED, event_id=None)
    backup.change_state(models.BackupState.ACTIVE)

    models.ContainerEvent.objects.create(
        container=backup.container,
        type=models.ContainerEventType.BACKED_UP,
        metadata=json.dumps({
            'backup_id': str(backup.id)
        })
    )

    return {
        'container_id': str(backup.container_id),
        'task': 'BACKUP_CONTAINER'
    }


def force_backup_container(container_id):
    container = models.Container.objects.get(id=container_id)

    start = False

    if container.state == models.ContainerState.RUNNING:
        with transaction.atomic():
            container.change_state(models.ContainerState.STOPPING)

        with transaction.atomic():
            change_container_state(
                container.id, const.PowerAction.STOP,
                create_event=False
            )

        container.refresh_from_db()

        start = True

    event_id = str(uuid.uuid4().hex)

    _log.info('Backing up container %s', container.hostname)

    with transaction.atomic():
        container.change_state(
            models.ContainerState.BACKING_UP, event_id=event_id)

        backup = models.Backup.objects.create(
            container
        )

    with transaction.atomic():
        create_container_backup(backup.id)
        cleanup_backups(container.id)

    # state may change here
    container.refresh_from_db()

    if start:
        with transaction.atomic():
            container.change_state(models.ContainerState.STARTING)

        with transaction.atomic():
            change_container_state(
                container.id,
                const.PowerAction.START,
                create_event=False
            )

    _log.info('Finished backing up container %s',
              container.hostname)


@shared_task()
def backup_all_containers():
    lock = cache.client.lock(
        const.BACKUP_LOCK_KEY.format('all'), timeout=3600)

    with lock:
        _log.info('Running backup')

        containers = models.Container.objects.all()

        for container in containers:
            try:
                force_backup_container(container.id)
            except StateException:
                _log.error('Could not back up container', exc_info=True)


@shared_task()
def delete_backup(backup_id):
    backup = models.Backup.objects.get(id=backup_id)

    with ClusterRpcProxy(settings.NAMEKO_CONFIG) as cluster_rpc:
        host_rpc = cluster_rpc[get_host_rpc_name(backup.container)]
        host_rpc.delete_container_backup(backup.filename)
        backup.delete()

    return {
        'container_id': str(backup.container_id),
        'task': 'DELETE_BACKUP'
    }


@shared_task()
def cleanup_backups(container_id):
    try:
        container = models.Container.objects.get(id=container_id)
    except models.Container.DoesNotExist:
        pass
    else:
        backups_for_deletion = container.backups.all().order_by(
            '-created_at')[settings.MAX_BACKUPS:]

        with ClusterRpcProxy(settings.NAMEKO_CONFIG) as cluster_rpc:
            host_rpc = cluster_rpc[get_host_rpc_name(container)]

            # TODO: store backups in separate directory for each container

            for backup in backups_for_deletion:
                backup.change_state(models.BackupState.DELETING)
                # TODO: catch file not found error
                host_rpc.delete_container_backup(backup.filename)
                backup.delete()


@shared_task()
@transaction.atomic()
def restore_from_backup(backup_id):
    backup = models.Backup.objects.get(id=backup_id)
    container = backup.container

    with ClusterRpcProxy(settings.NAMEKO_CONFIG) as cluster_rpc:
        host_rpc = cluster_rpc[get_host_rpc_name(container)]
        host_rpc.restore_container(container.hostname, backup.filename)

    models.ContainerEvent.objects.create(
        container=container,
        type=models.ContainerEventType.RESTORED,
        metadata=json.dumps({
            'backup_id': str(backup.id)
        })
    )

    container.change_state(models.ContainerState.STOPPED, event_id=None)
    backup.change_state(models.BackupState.ACTIVE)

    return {
        'container_id': str(backup.container_id),
        'task': 'RESTORE_CONTAINER'
    }
