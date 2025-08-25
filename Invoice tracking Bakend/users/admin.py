from django.contrib import admin
from django.contrib.auth import get_user_model
# Register your models here.


class UserAdmin(admin.ModelAdmin):
    list_display = ('name', 'email', 'role', 'is_active', 'last_login', 'service_id')
    search_fields = ('name', 'email', 'employee_id', 'location')
    list_filter = ('role', 'is_active', 'email_verified', 'timezone')
    readonly_fields = ('created_at', 'updated_at', 'last_login', 'password_changed_at', 'locked_until')

   
admin.site.register(get_user_model(), UserAdmin)
