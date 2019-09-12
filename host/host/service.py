import socket

from nameko.dependency_providers import Config
from nameko.rpc import rpc

from host.backups import tasks as backup_tasks, utils as backup_utils
from host.utils.random import generate_unique_id
from host.containers.tasks import reset_container_password, add_ssh_keys
from host.containers import lxc


class StateAction:
    stop = 'stop'
    start = 'start'
    reboot = 'reboot'

    ALL = [start, stop, reboot]


class HostService:
    name = 'compute.host.{}'.format(socket.getfqdn())

    config = Config()

    @rpc
    def create_container(
        self,  name, template,
        backend, vgname, fssize, fstype,
        config, password, ssh_keys=(), template_args=()
    ):
        if fssize is not None and isinstance(fssize, int):
            fssize = '{}G'.format(fssize)

        container = lxc.container.create(
            name=name,
            template=template,
            backend=backend,
            template_args=template_args,
            fssize=fssize,
            vgname=vgname,
            fstype=fstype
        )

        if config:
            for override, values in config.items():
                container.save_config(override, values)

        username = lxc.container.TEMPLATE_USERS.get(
            template, lxc.container.DEFAULT_USER)

        if password:
            reset_container_password(name, username, password)
        else:
            reset_container_password(name, username, generate_unique_id(128))

        if ssh_keys:
            add_ssh_keys(container, username, ssh_keys)

        return {
            'username': username,
        }

    @rpc
    def update_container(self, name, config, partial=False):
        container = lxc.Container(name)

        if config is not None:
            if not partial:
                container.clear_overrides()

            for override, values in config.items():
                container.save_config(override, values)

        return True

    @rpc
    def delete_container(self, name):
        c = lxc.Container(name)
        c.destroy()
        return True

    @rpc
    def change_container_state(self,
                               name, action,
                               wait_for_ip_timeout=None,
                               stop_timeout=None):
        container = lxc.Container(name)

        if action == StateAction.start:
            container.start()
        elif action == StateAction.stop:
            container.stop(timeout=stop_timeout)
        elif action == StateAction.reboot:
            container.reboot(stop_timeout=stop_timeout)

        if wait_for_ip_timeout is not None and action in (
                StateAction.start, StateAction.reboot):
            container.get_internal_ip(wait_for_ip_timeout)

        return {
            'info': container.info
        }

    @rpc
    def set_container_password(self, name, username, password):
        reset_container_password(name, username, password)
        return True

    @rpc
    def backup_container(self, name, filename):
        return backup_tasks.backup_container(
            name, backup_utils.get_backup_path(filename, self.config))

    @rpc
    def restore_container(self, name, filename):
        return backup_tasks.restore_container(
            name, backup_utils.get_backup_path(filename, self.config))

    @rpc
    def delete_container_backup(self, filename):
        return backup_tasks.delete_container_backup(
            backup_utils.get_backup_path(filename, self.config))

    @rpc
    def resize_container_storage(self, name, size):
        return backup_tasks.resize_container_storage(
            name, size)

