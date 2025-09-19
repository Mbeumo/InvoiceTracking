from rest_framework import serializers

from .models import Notification
class NotificationSerializer(serializers.ModelSerializer):
    user_name = serializers.CharField(source='user.name', read_only=True)
    time_ago = serializers.SerializerMethodField()
    
    class Meta:
        model = Notification
        fields = [
            "id", "user", "user_name", "type", "title", "message",
            "related_entity_type", "related_entity_id", "action_url",
            "is_read", "is_archived", "priority", "delivery_channels",
            "created_at", "read_at", "expires_at", "time_ago"
        ]
        read_only_fields = ["id", "user", "user_name", "created_at", "time_ago"]
    
    def get_time_ago(self, obj):
        from django.utils.timesince import timesince
        return timesince(obj.created_at)