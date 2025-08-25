from django.db import models
from django.contrib.auth.models import AbstractUser
# Create your models here.

User = get_user_model()

@admin.register(User)
class UserAdmin(admin.ModelAdmin):
    list_display = ("id", "username", "email", "role", "is_active")
    search_fields = ("username", "email")
    list_filter = ("role", "is_active", "is_staff") 