import shlex

from host.utils.sub_process import run_command
from host.exceptions import ProcessException


def chroot_command(chroot_path,
                   command,
                   command_input=None,
                   exception_class=ProcessException):

    if isinstance(command, str):
        command = shlex.split(command)

    return run_command('chroot', chroot_path, *command,
                       command_input=command_input,
                       exception_class=exception_class)
