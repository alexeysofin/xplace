from django.db import transaction

from xplace.base.exceptions import StateException


class FSMModelMixin:
    FSM_STATES = {}
    FSM_STATE_FIELD = 'state'

    def change_state(self, target, **kwargs):
        source = self.state

        allowed_states = self.FSM_STATES.get(source, ())

        if target not in allowed_states:
            raise StateException(
                'state transition from {} to {} is not allowed'.format(
                    source, target))

        with transaction.atomic():
            updated = self.__class__.objects.filter(
                **{
                    'pk': self.pk,
                    self.FSM_STATE_FIELD: source
                }
            ).update(
                **{
                    **kwargs,
                    self.FSM_STATE_FIELD: target
                }
            )

            if updated:
                for k, v in kwargs.items():
                    setattr(self, k, v)

                setattr(self, self.FSM_STATE_FIELD, target)

            else:
                raise StateException('state was changed concurrently')
