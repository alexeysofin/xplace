from rest_framework import viewsets

from xplace.base.mixins import AtomicViewSetMixin
from xplace.base.users import filter_queryset_owner
from xplace.support import serializers, models, filters


class TicketViewSet(AtomicViewSetMixin,
                    viewsets.ModelViewSet):

    def get_serializer_class(self):
        if self.action == 'create':
            return serializers.TicketCreateSerializer
        elif self.action in ('update', 'partial_update'):
            return serializers.TicketUpdateSerializer

        return serializers.TicketSerializer

    def get_queryset(self):
        user = self.request.user

        queryset = models.Ticket.objects.all()

        return filter_queryset_owner(
            queryset, user).optimized().order_by('-created_at')


class TicketCommentViewSet(AtomicViewSetMixin,
                           viewsets.ModelViewSet):
    filterset_class = filters.TicketCommentFilterSet

    def get_serializer_class(self):
        if self.action in ('create', 'update', 'partial_update'):
            return serializers.TicketCommentCreateUpdateSerializer

        return serializers.TicketCommentSerializer

    def get_queryset(self):
        user = self.request.user

        queryset = models.TicketComment.objects.all()

        return filter_queryset_owner(
            queryset, user,
            user_kw_name='ticket__user'
        ).order_by('-created_at')
