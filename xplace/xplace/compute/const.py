from xplace.compute import models


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
        STOP: models.ContainerState.RUNNING,
        START: models.ContainerState.STOPPED,
        REBOOT: models.ContainerState.RUNNING,
    }

    MID_STATE = {
        STOP: models.ContainerState.STOPPING,
        START: models.ContainerState.STARTING,
        REBOOT: models.ContainerState.REBOOTING,
    }


BACKUP_LOCK_KEY = 'containers.backup.{}'


CONTAINER_STOP_TIMEOUT = 15
