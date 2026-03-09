from rest_framework import serializers


class ChatRequestSerializer(serializers.Serializer):
    message = serializers.CharField()
    lesson_id = serializers.IntegerField(required=False, default=None)


class ChatResponseSerializer(serializers.Serializer):
    message = serializers.CharField()
    achievement_unlocked = serializers.DictField(required=False, default=None)
