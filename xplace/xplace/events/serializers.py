from rest_framework import serializers


class EventSerializer(serializers.Serializer):
    ready = serializers.SerializerMethodField()
    failed = serializers.SerializerMethodField()

    result = serializers.SerializerMethodField()

    id = serializers.CharField(read_only=True)

    def get_ready(self, obj):
        return obj.ready()

    def get_failed(self, obj):
        return obj.failed()

    def get_result(self, obj):
        result = obj.result

        if isinstance(result, Exception):
            result = str(result)

        return result

    def create(self, validated_data):
        raise NotImplementedError()

    def update(self, instance, validated_data):
        raise NotImplementedError()
