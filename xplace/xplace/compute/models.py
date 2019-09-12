from django.conf import settings
from django.core import validators
from django.db import models
from django.utils import timezone

from xplace.base import fsm
from xplace.base.models import BaseModel

from .cpus import num_cpus


class DiskSize(BaseModel):
    size = models.IntegerField(db_index=True)

    def __str__(self):
        return '{} GB'.format(self.size)


class RamSize(BaseModel):
    size = models.IntegerField(db_index=True)

    def __str__(self):
        return '{} MB'.format(self.size)


class Host(BaseModel):
    hostname = models.CharField(max_length=255, unique=True)
    ram = models.IntegerField()
    disk_size = models.IntegerField()
    num_cpus = models.IntegerField()
    public_ipv4 = models.CharField(
        max_length=39,
        validators=[validators.validate_ipv46_address],
    )
    lvm_vgname = models.CharField(max_length=255)
    default_cpus = models.CharField(max_length=16)
    ssh_port_add = models.IntegerField(default=5000)

    def format_disk_size(self):
        return '{}G'.format(self.disk_size)

    def format_ram(self):
        return '{}M'.format(self.ram)

    def __str__(self):
        return self.hostname

    def __repr__(self):
        return self.__str__()


class LXCTemplate:
    UBUNTU = 'ubuntu'
    CENTOS = 'centos'

    CHOICES = (
        (UBUNTU, UBUNTU),
        (CENTOS, CENTOS),
    )


class Image(BaseModel):
    name = models.CharField(max_length=255)
    version = models.CharField(max_length=32)
    image_url = models.ImageField(blank=True, null=True)
    lxc_template_name = models.CharField(choices=LXCTemplate.CHOICES,
                                         max_length=32)
    lxc_template_args = models.CharField(max_length=255, blank=True)

    def __str__(self):
        return self.name

    def __repr__(self):
        return self.__str__()


class ContainerState:
    CREATING = 'CREATING'
    UPDATING = 'UPDATING'

    STOPPING = 'STOPPING'
    STOPPED = 'STOPPED'

    STARTING = 'STARTING'
    RUNNING = 'RUNNING'

    REBOOTING = 'REBOOTING'

    DELETING = 'DELETING'

    BACKING_UP = 'BACKING_UP'
    RESTORING = 'RESTORING'

    RESIZING = 'RESIZING'

    CHOICES = (
        (CREATING, CREATING),
        (UPDATING, UPDATING),
        (STOPPING, STOPPING),
        (STOPPED, STOPPED),
        (STARTING, STARTING),
        (RUNNING, RUNNING),
        (REBOOTING, REBOOTING),
        (DELETING, DELETING),
        (BACKING_UP, BACKING_UP),
        (RESTORING, RESTORING),
        (RESIZING, RESIZING)
    )

    STATE_MACHINE = {
        CREATING: (
            RUNNING,
        ),
        UPDATING: (
            STOPPED,
            RUNNING
        ),
        RUNNING: (
            STOPPING,
            REBOOTING,
            STOPPED,  # when host event is received,
            UPDATING
        ),
        REBOOTING: (
            RUNNING,
        ),
        STARTING: (
            RUNNING,
        ),
        STOPPED: (
            STARTING,
            RESTORING,
            BACKING_UP,
            DELETING,
            RUNNING,  # when host event is received,
            UPDATING,
            RESIZING,
        ),
        STOPPING: (
            STOPPED,
        ),
        RESTORING: (
            STOPPED,
        ),
        BACKING_UP: (
            STOPPED,
        ),
        RESIZING: (
            STOPPED,
        )
    }


class ContainerQueryset(models.QuerySet):
    def filter_request(self, request, *args, **kwargs):
        fs = {}
        if not request.user.is_superuser:
            fs['user'] = request.user
        return self.filter(*args, **kwargs, **fs)

    def optimized(self):
        return self.select_related('image', 'host', 'user')


class Container(fsm.FSMModelMixin, BaseModel):
    FSM_STATES = ContainerState.STATE_MACHINE
    FSM_STATE_FIELD = 'state'

    objects = ContainerQueryset.as_manager()

    name = models.CharField(max_length=255, db_index=True)
    hostname = models.CharField(max_length=255, unique=True)
    image = models.ForeignKey(Image, on_delete=models.CASCADE)
    host = models.ForeignKey(Host, on_delete=models.CASCADE)
    user = models.ForeignKey(settings.AUTH_USER_MODEL,
                             on_delete=models.CASCADE,
                             related_name='containers')
    ram = models.IntegerField()
    disk_size = models.IntegerField()
    cpus = models.CharField(max_length=16)
    state = models.CharField(choices=ContainerState.CHOICES,
                             max_length=16,
                             default=ContainerState.CREATING)
    username = models.CharField(max_length=255, null=True, blank=True)
    private_ipv4 = models.CharField(
        max_length=39, null=True, blank=True,
        validators=[validators.validate_ipv46_address],
    )
    public_ipv4 = models.CharField(
        max_length=39, null=True, blank=True,
        validators=[validators.validate_ipv46_address],
    )

    event_id = models.CharField(max_length=32, null=True, blank=True)

    @property
    def static_state(self):
        return self.state in (ContainerState.STOPPED, ContainerState.RUNNING)

    @property
    def running(self):
        return self.state == ContainerState.RUNNING

    @property
    def num_cpus(self):
        try:
            return num_cpus(self.cpus)
        except ValueError:
            return ''

    def format_disk_size(self):
        return '{}G'.format(self.disk_size)

    def format_ram(self):
        return '{}M'.format(self.ram)

    def ssh_port(self):
        if self.private_ipv4 is None:
            return None

        last = self.private_ipv4.rsplit('.', 1)[1]

        return self.host.ssh_port_add + int(last)

    def get_ssh_connect_string(self):
        return 'ssh {}@{} -p {}'.format(
            self.username,
            self.host.public_ipv4,
            self.ssh_port()
        )

    def __str__(self):
        return self.hostname


class ContainerEventType:
    STARTED = 'STARTED'
    STOPPED = 'STOPPED'
    REBOOTED = 'REBOOTED'
    PASSWORD_RESET = 'PASSWORD_RESET'
    BACKED_UP = 'BACKED_UP'
    RESTORED = 'RESTORED'
    RESIZED = 'RESIZED'
    UPDATED = 'UPDATED'

    CHOICES = (
        (STARTED, STARTED),
        (STOPPED, STOPPED),
        (REBOOTED, REBOOTED),
        (PASSWORD_RESET, PASSWORD_RESET),
        (BACKED_UP, BACKED_UP),
        (RESIZED, RESIZED),
        (UPDATED, UPDATED)
    )

    ICONS = {
        STARTED: 'play',
        STOPPED: 'stop',
        REBOOTED: 'refresh',
        PASSWORD_RESET: 'lock',
        BACKED_UP: 'save',
        RESTORED: 'file'
    }

    DESCRIPTION = {
        STARTED: 'Container was started',
        STOPPED: 'Container was stopped',
        REBOOTED: 'Container was rebooted',
        PASSWORD_RESET: 'Container password was reset',
        BACKED_UP: 'Container was backed up',
        RESTORED: 'Container was restored from backup'
    }


class ContainerEvent(BaseModel):
    container = models.ForeignKey(Container, on_delete=models.CASCADE,
                                  related_name='events')
    type = models.CharField(max_length=16, choices=ContainerEventType.CHOICES)

    metadata = models.TextField(null=True)

    @property
    def icon(self):
        return ContainerEventType.ICONS.get(self.type, 'server')

    @property
    def description(self):
        return ContainerEventType.DESCRIPTION.get(self.type, 'unknown event')

    class Meta:
        ordering = ['-created_at']


class BackupState:
    ACTIVE = 'ACTIVE'
    CREATING = 'CREATING'
    DELETING = 'DELETING'
    RESTORING = 'RESTORING'

    CHOICES = (
        (CREATING, CREATING),
        (ACTIVE, ACTIVE),
        (DELETING, DELETING),
        (RESTORING, RESTORING),
    )

    STATE_MACHINE = {
        ACTIVE: (
            DELETING,
            RESTORING,
        ),
        RESTORING: (
            ACTIVE,
        ),
        CREATING: (
            ACTIVE,
        )
    }


class BackupQuerySet(models.QuerySet):
    def create(self, container, **kwargs):
        filename = 'backup.{}.{}.raw'.format(
            container.hostname,
            timezone.now().isoformat()
        )

        kwargs.setdefault('filename', filename)

        return super().create(
            container=container, **kwargs)


class Backup(fsm.FSMModelMixin, BaseModel):
    FSM_STATES = BackupState.STATE_MACHINE
    FSM_STATE_FIELD = 'state'

    objects = BackupQuerySet.as_manager()

    state = models.CharField(
        max_length=32, db_index=True, choices=BackupState.CHOICES,
        default=BackupState.CREATING
    )
    container = models.ForeignKey(Container, on_delete=models.CASCADE,
                                  related_name='backups')
    filename = models.CharField(max_length=255)
