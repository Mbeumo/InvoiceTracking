from django.contrib.auth import get_user_model
from rest_framework import serializers

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = get_user_model()
        fields = ['id', 'email', 'name', 'role', 'timezone', 'employee_id', 'phone', 'avatar_url',
          'service_id', 'manager_id', 'location', 'is_active', 'email_verified', 'last_login',
          'failed_login_attempts', 'locked_until', 'password_changed_at', 'require_password_change',
          'created_at', 'updated_at', 'created_by', 'updated_by', 'notes']
        read_only_fields = ['id', 'created_at', 'updated_at', 'last_login', 'password_changed_at', 'locked_until']


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