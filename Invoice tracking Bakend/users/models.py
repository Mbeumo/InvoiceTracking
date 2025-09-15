from sys import audit
import uuid
from django.db import models
from django.utils import timezone
from django.contrib.auth.models import AbstractBaseUser, PermissionsMixin, BaseUserManager,Permission
from auditlog.registry import auditlog
"""class Permission(models.Model):
    id = models.AutoField(primary_key=True)
    code = models.CharField(max_length=100, unique=True)
    description = models.TextField(blank=True)

    class Meta:
        db_table = 'permissions'

    def __str__(self):
        return self.code
class UserPermission(models.Model):
    user = models.ForeignKey('User', on_delete=models.CASCADE)
    permission = models.ForeignKey('Permission', on_delete=models.CASCADE)
    granted_at = models.DateTimeField(auto_now_add=True)
    granted_by = models.ForeignKey('User', on_delete=models.SET_NULL, null=True, related_name='granted_permissions')

    class Meta:
        db_table = 'user_permissions'
        unique_together = ('user', 'permission')

    def __str__(self):
        return f"{self.user.email} → {self.permission.code} (by {self.granted_by.email if self.granted_by else 'unknown'})"
Django provide built in implimentation of this 
"""
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
        # ('approver', 'Approver'),
        # ('finance', 'Finance'),
        # ('supplier','Vendor')
    ]
    role = models.CharField(max_length=20, choices=ROLE_CHOICES)
    user_permissions = models.ManyToManyField(
        Permission,
        verbose_name='user permissions',
        blank=True,
        help_text='Specific permissions for this user.',
        related_name='user_set',
        related_query_name='user',
    )

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
    """permissions = models.ManyToManyField(
        'Permission',
        related_name='users',
        db_table='user_permissions',
        blank=True
    ) this is for automatic weak relationship generation"""
    # permissions = models.ManyToManyField(
    #     'Permission',
    #     through='UserPermission',
    #     through_fields=('user', 'permission'),
    #     related_name='users',
    #     blank=True
    # )
    # permissions = models.ManyToManyField(
    #     'Permission',
    #     through='UserPermission',
    #     through_fields=('user', 'permission'),
    #     related_name='users',
    #     blank=True
    # )


    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['name', 'role', 'service_id']

    objects = UserManager()

    def __str__(self):
        return f"{self.name} ({self.email})"

    class Meta:
        db_table = 'users'

auditlog.register(User);
#auditlog.register(UserManager);