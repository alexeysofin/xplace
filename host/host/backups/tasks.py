import os
import shutil
from host.containers import lxc
from host.storage.lvm2.const import LVM_BACKEND
from host.utils.sub_process import run_command


def backup_container(container_name, path):
    container = lxc.Container(container_name)

    fs = container.root_fs()

    # path = utils.get_backup_path(filename)

    if os.path.exists(path):
        shutil.rmtree(path)

    cmd = 'qemu-img'
    args = 'convert', '-O', 'raw', fs.path, path

    run_command(cmd, *args)


def restore_container(container_name, path):
    container = lxc.Container(container_name)

    fs = container.root_fs()

    cmd = 'dd'
    args = 'if={}'.format(path), 'of={}'.format(fs.path)

    run_command(cmd, *args)


def delete_container_backup(path):
    os.unlink(path)


def resize_container_storage(name, size):
    container = lxc.Container(name)

    fs = container.root_fs()

    if fs.backend == LVM_BACKEND:
        run_command('lvresize', '--resizefs', '--size', size, fs.path)
