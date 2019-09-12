import os

from host.utils.sub_process import run_command

from .const import LVM_BIN_PATH
from .exceptions import LVMException


def run_lvm_command(command, *args, command_input=None):
    command = os.path.join(LVM_BIN_PATH, command)
    return run_command(command, *args, command_input=command_input,
                       exception_class=LVMException)
