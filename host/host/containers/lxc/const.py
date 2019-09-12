LXC_BASE_PATH = '/var/lib/lxc'

LXC_BIN_PATH = '/usr/bin'


class ContainerState:
    RUNNING = 'RUNNING'
    STOPPED = 'STOPPED'
    REBOOT = 'REBOOT'

    ALL = (RUNNING, STOPPED, REBOOT)