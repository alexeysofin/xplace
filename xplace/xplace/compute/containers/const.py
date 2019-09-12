from ..models import ContainerState


class PowerAction:
    STOP = 'STOP'
    START = 'START'
    REBOOT = 'REBOOT'

    CHOICES = (
        (STOP, STOP),
        (START, START),
        (REBOOT, REBOOT)
    )

    REQUIRED_STATE = {
        STOP: ContainerState.RUNNING,
        START: ContainerState.STOPPED,
        REBOOT: ContainerState.RUNNING,
    }

    MID_STATE = {
        STOP: ContainerState.STOPPING,
        START: ContainerState.STARTING,
        REBOOT: ContainerState.REBOOTING,
    }


BACKUP_LOCK_KEY = 'containers.backup'


CONTAINER_STOP_TIMEOUT = 15
