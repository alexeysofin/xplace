import os

from host.utils.sub_process import run_command
from .const import LXC_BIN_PATH
from .exceptions import ContainerException


def run_container_command(command, *args, command_input=None):
    command = os.path.join(LXC_BIN_PATH, command)
    return run_command(command, *args, command_input=command_input,
                       exception_class=ContainerException)
