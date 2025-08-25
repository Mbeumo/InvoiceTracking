import uuid
from django.db import models
from django.utils import timezone
from django.contrib.auth.models import AbstractBaseUser, PermissionsMixin, BaseUserManager

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
    service_id = models.CharField(max_length=50)

    ROLE_CHOICES = [
        ('admin', 'Admin'),
        ('manager', 'Manager'),
        ('employee', 'Employee'),
        ('viewer', 'Viewer'),
        ('approver', 'Approver'),
        ('finance', 'Finance'),
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
    # date_joined = models.DateTimeField(default=timezone.now)

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['name', 'role', 'service_id']

    objects = UserManager()

    def __str__(self):
        return f"{self.name} ({self.email})"

    class Meta:
        db_table = 'users'