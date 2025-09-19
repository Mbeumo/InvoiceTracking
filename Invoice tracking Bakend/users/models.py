import uuid
from django.db import models
from django.utils import timezone as time
from django.contrib.auth.models import AbstractBaseUser, PermissionsMixin, BaseUserManager, Permission
from django.conf import settings
from auditlog.registry import auditlog
from django.contrib.auth import get_user_model
import json
from django.db.models.signals import post_save
from django.dispatch import receiver

class UserManager(BaseUserManager):
    def create_user(self, email, password=None, **extra_fields):
        if not email:
            raise ValueError("Email is required")
        email = self.normalize_email(email)
        user = self.model(email=email, **extra_fields)
        user.set_password(password)
        user.save()
        return user

    def create_superuser(self, email, password=None, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        extra_fields.setdefault('is_active', True)
        return self.create_user(email, password, **extra_fields)


class User(AbstractBaseUser, PermissionsMixin):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    employee_id = models.CharField(max_length=50, unique=True, null=True, blank=True)
    name = models.CharField(max_length=255)
    email = models.EmailField(unique=True)
    phone = models.CharField(max_length=50, null=True, blank=True)
    avatar_url = models.TextField(null=True, blank=True)
    service_id = models.ForeignKey(
        settings.DEPART_MODEL,
        on_delete=models.PROTECT,
    )
    ROLE_CHOICES = [
        ('admin', 'Admin'),
        ('manager', 'Manager'),
        ('employee', 'Employee'),
        ('viewer', 'Viewer'),
    ]
    role = models.CharField(max_length=20, choices=ROLE_CHOICES)

    manager_id = models.CharField(max_length=36, null=True, blank=True)
    location = models.CharField(max_length=255, null=True, blank=True)
    timezone = models.CharField(max_length=100, default='UTC', null=True, blank=True)

    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)
    is_superuser = models.BooleanField(default=False)
    email_verified = models.BooleanField(default=False)
    last_login = models.DateTimeField(null=True, blank=True)
    failed_login_attempts = models.IntegerField(default=0)
    locked_until = models.DateTimeField(null=True, blank=True)
    password_changed_at = models.DateTimeField(null=True, blank=True)
    require_password_change = models.BooleanField(default=False)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    created_by = models.CharField(max_length=36, null=True, blank=True)
    updated_by = models.CharField(max_length=36, null=True, blank=True)
    notes = models.TextField(null=True, blank=True)

    notif  = models.ManyToManyField(
        settings.NOTIFICATION_MODEL,
        through=settings.USER_NOT,
        related_name='user'
    )

    date_joined = models.DateTimeField(default=time.now)

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['name', 'role', 'service_id']

    objects = UserManager()

    def __str__(self):
        return f"{self.name} ({self.email})"

    class Meta:
        db_table = 'users'


class SystemConfiguration(models.Model):
    """System-wide configuration settings"""

    class SettingType(models.TextChoices):
        STRING = 'string', 'String'
        INTEGER = 'integer', 'Integer'
        FLOAT = 'float', 'Float'
        BOOLEAN = 'boolean', 'Boolean'
        JSON = 'json', 'JSON'

    key = models.CharField(max_length=100, primary_key=True)
    value = models.TextField()
    setting_type = models.CharField(max_length=20, choices=SettingType.choices, default=SettingType.STRING)
    description = models.TextField(blank=True)
    category = models.CharField(max_length=50, default='general')

    # Access Control
    is_editable = models.BooleanField(default=True)
    requires_admin = models.BooleanField(default=False)

    # Validation
    validation_rules = models.JSONField(default=dict, blank=True)

    # Metadata
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    updated_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True
    )

    class Meta:
        ordering = ['category', 'key']

    def __str__(self):
        return f"{self.key} = {self.value[:50]}"

    def get_typed_value(self):
        """Get value converted to appropriate type"""
        try:
            if self.setting_type == 'integer':
                return int(self.value)
            elif self.setting_type == 'float':
                return float(self.value)
            elif self.setting_type == 'boolean':
                return self.value.lower() in ['true', '1', 'yes', 'on']
            elif self.setting_type == 'json':
                return json.loads(self.value)
            else:
                return self.value
        except (ValueError, json.JSONDecodeError):
            return self.value

DEFAULT_USER_SETTINGS = [
    # Appearance
    {"key": "appearance.theme", "value": "light", "setting_type": "string", "category": "appearance", "is_editable": True},
    {"key": "appearance.language", "value": "en", "setting_type": "string", "category": "appearance", "is_editable": True},

    # Security
    {"key": "security.sessionTimeout", "value": "30", "setting_type": "integer", "category": "security", "is_editable": True},
    {"key": "security.mfaEnabled", "value": "false", "setting_type": "boolean", "category": "security", "is_editable": True},

    # Notifications
    {"key": "notifications.email", "value": "true", "setting_type": "boolean", "category": "notifications", "is_editable": True},
    {"key": "notifications.sms", "value": "false", "setting_type": "boolean", "category": "notifications", "is_editable": True},
]
@receiver(post_save, sender=get_user_model())
def create_default_user_settings(sender, instance, created, **kwargs):
    if created:
        for setting in DEFAULT_USER_SETTINGS:
            SystemConfiguration.objects.create(
                key=setting["key"],
                value=setting["value"],
                setting_type=setting["setting_type"],
                category=setting["category"],
                is_editable=setting["is_editable"],
                user=instance  # link to the registered user
            )
# Register for audit logging
auditlog.register(SystemConfiguration)
auditlog.register(User)
