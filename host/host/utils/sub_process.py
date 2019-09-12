from logging import getLogger

import subprocess

from host.exceptions import ProcessException


logger = getLogger(__name__)


def run_command(command, *args, command_input=None,
                exception_class=ProcessException):
    command = (command,) + args

    proc = subprocess.Popen(
        command, stdout=subprocess.PIPE, stderr=subprocess.PIPE,
        stdin=subprocess.PIPE)

    command_str = ' '.join(command)

    logger.debug('Executing command: %s', command_str)

    stdout, stderr = proc.communicate(input=command_input)

    stderr = stderr.decode().strip()
    stdout = stdout.decode().strip()

    if proc.returncode > 0:
        raise exception_class(command_str, proc.returncode, stdout, stderr)

    # some programs (like passwd) write their output to stderr
    result = stdout or stderr

    logger.debug(result)

    return result
