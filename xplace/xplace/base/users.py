from django.db import models
from django.db.models import OuterRef

from xplace.users import models as user_models


def filter_queryset_owner(queryset, user, user_kw_name='user'):
    if user.is_superuser:
        user_filter = {}
        sub_q = models.Q()
    else:
        user_filter = {user_kw_name: user}
        sub_q = models.Q(
            **{
                '{}__in'.format(user_kw_name): models.Subquery(
                    user_models.OrganizationUser.objects.filter(
                        user=OuterRef(user_kw_name),
                        organization__owner=user
                    ).values_list('user')
                )
            }
        )

    return queryset.filter(
        models.Q(
            **user_filter
        ) |
        sub_q
    )
