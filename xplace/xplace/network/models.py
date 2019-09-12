from django.conf import settings
from django.core import validators
from django.db import models

from xplace.base.models import BaseModel
from xplace.base import fsm


class ReverseProxy(BaseModel):
    hostname = models.CharField(max_length=255, unique=True)
    public_ipv4 = models.CharField(
        max_length=39,
        validators=[validators.validate_ipv46_address],
    )


class DomainQueryset(models.QuerySet):
    def filter_request(self, request, *args, **kwargs):
        fs = {}
        if not request.user.is_superuser:
            fs['user'] = request.user
        return self.filter(*args, **kwargs, **fs)

    def optimized(self):
        return self.select_related('user', 'reverse_proxy')


class DomainState:
    CREATING = 'CREATING'
    ACTIVE = 'ACTIVE'
    DELETING = 'DELETING'
    UPDATING = 'UPDATING'

    CHOICES = (
        (CREATING, CREATING),
        (UPDATING, UPDATING),
        (ACTIVE, ACTIVE),
        (DELETING, DELETING),
    )

    STATE_MACHINE = {
        CREATING: (
            ACTIVE,
        ),
        ACTIVE: (
            UPDATING,
            DELETING,
        ),
        UPDATING: (
            ACTIVE,
        ),
    }


class Domain(fsm.FSMModelMixin, BaseModel):
    FSM_STATES = DomainState.STATE_MACHINE
    FSM_STATE_FIELD = 'state'

    objects = DomainQueryset.as_manager()

    state = models.CharField(
        max_length=32, db_index=True, choices=DomainState.CHOICES,
        default=DomainState.CREATING
    )

    event_id = models.CharField(max_length=32, null=True, blank=True)

    name = models.CharField(max_length=255)
    reverse_proxy = models.ForeignKey(
        ReverseProxy, on_delete=models.CASCADE, related_name='domains')
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    include_sub_domains = models.BooleanField(default=False)

    destination_ip = models.CharField(
        max_length=39,
        validators=[validators.validate_ipv46_address],
    )
    destination_http_port = models.IntegerField(default=80)
    destination_https_port = models.IntegerField(default=443)

    backend_id = models.CharField(null=True, max_length=255)

    def __str__(self):
        return self.name

    class Meta:
        unique_together = ('name', 'include_sub_domains')
