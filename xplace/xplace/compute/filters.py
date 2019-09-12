import django_filters
from django_filters.rest_framework import FilterSet

from django.db import models as djmodels

from xplace.compute import models


class ContainerFilterSet(FilterSet):
    """Filter for Books by if books are published or not"""
    search = django_filters.CharFilter(field_name='search',
                                       method='filter_search')

    def filter_search(self, queryset, name, value):
        # TODO: gin index on pg_trgm for query optimization
        return queryset.filter(
            djmodels.Q(name__icontains=value) |
            djmodels.Q(hostname__icontains=value) |
            djmodels.Q(private_ipv4__icontains=value) |
            djmodels.Q(public_ipv4__icontains=value)
        )

    class Meta:
        model = models.Container
        fields = ['search', 'host']
