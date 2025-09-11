from django.contrib.auth import get_user_model
from rest_framework import serializers
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.views import APIView
from django.contrib.auth.models import Group, Permission

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

    class Meta:
        model = get_user_model()
        fields = ['id', 'email', 'name', 'role', 'timezone', 'employee_id', 'phone', 'avatar_url',
          'service_id', 'manager_id', 'location', 'is_active', 'email_verified', 'last_login',
          'failed_login_attempts', 'locked_until', 'password_changed_at', 'require_password_change',
          'created_at', 'updated_at', 'created_by', 'updated_by', 'notes','permissions','is_superuser']
        read_only_fields = ['id', 'created_at', 'updated_at', 'last_login', 'password_changed_at', 'locked_until']

    
 
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




class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=8)

    class Meta:
        model = get_user_model()
        fields = ["name", "email", "password","role","timezone"]

    def create(self, validated_data):
        User = get_user_model()
        password = validated_data.pop("password")
        user = User(**validated_data)
        user.set_password(password)
        user.save()
        return user 