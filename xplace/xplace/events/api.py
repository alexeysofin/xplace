from celery.result import AsyncResult
from rest_framework.generics import RetrieveAPIView

from xplace.events import serializers


class MockQuerySet:
    pass


class EventRetrieveAPIView(RetrieveAPIView):
    queryset = MockQuerySet()

    serializer_class = serializers.EventSerializer

    def get_object(self):
        result = AsyncResult(self.kwargs['id'])
        return result
