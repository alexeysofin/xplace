import os
import time
import glob
from collections import namedtuple

from .exceptions import ContainerException

from .utils import run_container_command
from .config import parse_configuration
from .config import keys
from .const import LXC_BASE_PATH, ContainerState


RootFS = namedtuple('RootFS', ('backend', 'path'))


class Container:
    def __init__(self, name, force_state=None):
        self.name = name
        self.force_state = force_state

        self._config = None

    info_link_key = 'Link'
    info_link_sub_keys = ('TX bytes', 'RX bytes', 'Total bytes')

    @property
    def info(self):
        output = run_container_command('lxc-info', '-n', self.name)
        lines = output.split('\n')

        result = {}

        current_link = None

        for line in lines:
            key, value = line.split(':', 1)
            key, value = key.strip(), value.strip()

            if key == self.info_link_key:
                current_link = {}

                if self.info_link_key not in result:
                    result[self.info_link_key] = {
                        value: current_link
                    }
                else:
                    result[self.info_link_key][value] = current_link
            elif current_link is not None and key in self.info_link_sub_keys:
                current_link[key] = value

            else:
                result[key] = value

        return result

    def start(self):
        run_container_command('lxc-start', '-n', self.name)
        self.force_state = ContainerState.RUNNING

    def stop(self, timeout=None):
        try:
            cmd = ['lxc-stop', '-n', self.name, '--logpriority', 'INFO']
            if timeout is not None:
                cmd.extend(['-t', str(int(timeout))])
            run_container_command(*cmd)
            self.force_state = ContainerState.STOPPED
        except ContainerException as exc:
            if '{} is not running'.format(self.name) not in \
                    (exc.stderr or '').lower():
                raise

    def reboot(self, stop_timeout=None):
        # lxc-stop -r -n test returns 1 returncode :(
        self.stop(timeout=stop_timeout)
        time.sleep(1)
        self.start()
        self.force_state = ContainerState.RUNNING

    def get_cgroup(self, cgroup):
        return run_container_command('lxc-cgroup', '-n', self.name, cgroup)

    def destroy(self):
        run_container_command('lxc-destroy', '-n', self.name)

    def attach(self, *command_args, command_input=None):
        return run_container_command(
            'lxc-attach', '-n', self.name, '--',
            *command_args,
            command_input=command_input)

    def get_internal_ip(self, timeout=0):
        while True:
            info = self.info

            ip = info.get('IPV4', None)

            if ip is None:
                ip = info.get('IP', None)

            if ip is not None and ip != '-':
                return ip

            if timeout == 0:
                break

            timeout -= 1
            time.sleep(1)

    def root_fs(self):
        config = self.get_config()

        legacy_path = config.get(keys.RootFS.LEGACY_PATH)
        legacy_backend = config.get(keys.RootFS.LEGACY_BACKEND)

        path = config.get(keys.RootFS.PATH)

        if path is not None:
            backend, path = path.split(':', 1)
        else:
            backend, path = legacy_backend, legacy_path

        fs = RootFS(backend.strip(), path.strip())

        return fs

    def rootfs_mount_path(self):
        mount_path = os.path.join(self.base_path(), 'rootfs')

        if not os.path.exists(mount_path):
            os.makedirs(mount_path, 0o751)

        return mount_path

    def base_path(self):
        return os.path.join(LXC_BASE_PATH, self.name)

    def get_override_path(self):
        return os.path.join(self.base_path(), 'override/')

    def list_overrides_paths(self):
        return glob.glob(os.path.join(self.get_override_path(), '*'))

    def get_overrides(self):
        result = {}

        for path in self.list_overrides_paths():
            result[os.path.basename(path)] = self.get_config(path)

        return result

    def clear_overrides(self):
        for path in self.list_overrides_paths():
            os.unlink(path)

    @property
    def config(self):
        return self.get_overrides()

    def ensure_override_exists(self):
        os.makedirs(self.get_override_path(), exist_ok=True)

    def get_config_path(self, override=None):
        if override is not None:
            return os.path.join(self.get_override_path(), override)
        return os.path.join(self.base_path(), 'config')

    def get_raw_config(self, override=None, raise_exception=False):
        try:
            with open(self.get_config_path(override=override)) as fp:
                return fp.read()
        except FileNotFoundError:
            if raise_exception:
                raise

    def get_config(self, override=None):
        return parse_configuration(self.get_raw_config(override=override))

    def save_config(self, override, config):
        if override is not None:
            if config is None:
                try:
                    os.unlink(self.get_config_path(override=override))
                except FileNotFoundError:
                    pass
            else:
                with open(self.get_config_path(override=override), 'w') as fp:
                    for k, v in config.items():
                        fp.write('{} = {}\n'.format(k, v))

    def add_override_include(self):
        override_path = self.get_override_path()

        if override_path not in self.get_config().get('includes', ()):
            self.ensure_override_exists()

            with open(self.get_config_path(), 'a') as fp:
                fp.write('\nlxc.include = {}\n'.format(override_path))

    @property
    def state(self):
        if self.force_state is not None:
            return self.force_state

        return self.info.get('State')


def list_():
    output = run_container_command('lxc-ls', '--fancy', '-F', 'name,state')
    lines = output.split('\n')

    result = []

    for line in lines[1:]:
        items = line.strip().split(sep=None, maxsplit=1)
        result.append(
            Container(items[0].strip(), force_state=items[1].strip())
        )

    return result


def exists(name):
    return name in [c.name for c in list_()]


TEMPLATE_USERS = {
    'ubuntu': 'ubuntu',
    'centos': 'root'
}

DEFAULT_USER = 'root'


def create(name, template,
           backend='dir', vgname=None,
           fssize=None, fstype=None, template_args=()):

    args = ['-n', name, '-t', template, '-B', backend]

    if fssize:
        args.extend(['--fssize', fssize])

    if vgname:
        args.extend(['--vgname', vgname])

    if fstype:
        args.extend(['--fstype', fstype])

    run_container_command(
        'lxc-create', *args, '--', *template_args,
        # make lvcreate override existing filesystem - y is the answer to
        # lvcreate prompt
        # WARNING: ext4 signature detected on
        # /dev/lxc/test at offset 1080. Wipe it? [y/n]
        command_input=b'y'
    )

    c = Container(name, force_state=ContainerState.STOPPED)
    c.add_override_include()
    return c
