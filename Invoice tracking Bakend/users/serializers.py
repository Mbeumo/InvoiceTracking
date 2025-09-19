from django.contrib.auth import get_user_model
from rest_framework import serializers
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.views import APIView
from departments.models import Service
from django.contrib.auth.models import Group, Permission
from .models import SystemConfiguration
from django.db.models.signals import post_save
from django.dispatch import receiver
User = get_user_model()
def get_user_permissions(user):
        perms = set()

        # 1. Direct permissions (only if you later add PermissionsMixin)
        """if hasattr(user, 'user_permissions'):
            perms.update(user.user_permissions.all())
            """
        # 2. Group permissions via role
        try:
            group = Group.objects.get(name=user.role)
            perms.update(group.permissions.all())
        except Group.DoesNotExist:
            pass

        return perms


class UserSerializer(serializers.ModelSerializer):
    permissions = serializers.SerializerMethodField()
    service = serializers.SerializerMethodField()


    class Meta:
        model = get_user_model()
        fields = ['id', 'email', 'name', 'role', 'timezone', 'employee_id', 'phone', 'avatar_url',
          'service_id', 'manager_id', 'location', 'is_active', 'email_verified', 'last_login',
          'failed_login_attempts', 'locked_until', 'password_changed_at', 'require_password_change',
          'created_at', 'updated_at', 'created_by', 'updated_by', 'notes','permissions','is_superuser','service']
        read_only_fields = ['id', 'created_at', 'updated_at', 'last_login', 'password_changed_at', 'locked_until','service']

    def get_service(self, obj):
        return obj.service_id.name if obj.service_id else None

 
    def get_permissions(self, obj):
        perms = get_user_permissions(obj)
        return [
            {
                "codename": p.codename,
                "name": p.name,
                "app_label": p.content_type.app_label
            }
            for p in perms
        ]
    """(post_save, sender=User)
    def create_user_settings(sender, instance, created, **kwargs):
        if created:
            # get default system settings
            defaults = {
                config.key: config.value
                for config in SystemConfiguration.objects.all()
            }
            UserSettings.objects.create(user=instance, settings=defaults)
    """


def validate_service_id(self, value):
    try:
        return Service.objects.get(name__iexact=value.strip())
    except Service.DoesNotExist:
        raise serializers.ValidationError("Invalid service name")


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=8) # Ensure password is write-only and has a minimum length
    service_id = serializers.PrimaryKeyRelatedField(
        queryset=Service.objects.all(),
    )

    class Meta:
        model = get_user_model()
        fields = ["name", "email", "password","role","timezone", "service_id"]

    def create(self, validated_data):
        service = validated_data.pop("service_id")
        password = validated_data.pop("password")

        User = get_user_model()
        user = User(**validated_data)
        user.set_password(password)
        user.service_id = service  
        user.save()
        return user

class SystemConfigurationSerializer(serializers.ModelSerializer):
    value = serializers.SerializerMethodField()

    class Meta:
        model = SystemConfiguration
        fields = [
            "key", "value", "setting_type", "description",
            "category", "is_editable", "requires_admin",
            "updated_at", "updated_by"
        ]

    def get_value(self, obj):
        """Cast stringified value to its native Python type"""
        if obj.setting_type == SystemConfiguration.SettingType.BOOLEAN:
            return obj.value.lower() in ("true", "1", "yes")
        if obj.setting_type == SystemConfiguration.SettingType.INTEGER:
            return int(obj.value)
        if obj.setting_type == SystemConfiguration.SettingType.FLOAT:
            return float(obj.value)
        if obj.setting_type == SystemConfiguration.SettingType.JSON:
            import json
            try:
                return json.loads(obj.value)
            except Exception:
                return {}
        return obj.value  # STRING fallback
class SettingsResponseSerializer(serializers.Serializer):
    user = UserSerializer()
    system = SystemConfigurationSerializer(many=True)