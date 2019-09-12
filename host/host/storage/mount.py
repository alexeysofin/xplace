import os

from host.utils.storage import is_device
from host.utils.sub_process import run_command


def mount(device, directory, *options):
    return run_command('mount', device, directory, *options)


def umount(directory, *options):
    return run_command('umount', '-l', directory, *options)


class mount_context:
    def __init__(self, device, directory):
        self.device = device
        self.directory = directory

        if is_device(device) and not os.path.ismount(directory):
            self.need_mount = True
        else:
            self.need_mount = False

    def __enter__(self):
        if self.need_mount:
            mount(self.device, self.directory)
        return self

    def __exit__(self, exc_type, exc_val, exc_tb):
        if self.need_mount:
            umount(self.directory)
