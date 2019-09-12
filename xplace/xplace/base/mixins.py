from django.db import transaction


class AtomicViewSetMixin:
    @transaction.atomic()
    def perform_create(self, serializer):
        return super().perform_create(serializer)

    @transaction.atomic()
    def perform_update(self, serializer):
        return super().perform_update(serializer)

    @transaction.atomic()
    def perform_destroy(self, instance):
        return super().perform_destroy(instance)
