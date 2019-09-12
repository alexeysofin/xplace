import django_filters
from django_filters.rest_framework import FilterSet

from xplace.support import models


class TicketCommentFilterSet(FilterSet):
    ticket = django_filters.UUIDFilter()

    def filter_ticket(self, queryset, name, value):
        return queryset.filter(ticket__pk=value)

    class Meta:
        model = models.TicketComment
        fields = ['ticket']
