from django.db import models
from django.conf import settings
from auditlog.registry import auditlog
# Create your models here.
class Notification(models.Model):
    METHOD_CHOICES = [
        ('email', 'Email'),
        ('sms', 'SMS'),
        ('push', 'Push'),
        ('inapp', 'In-App'),
    ]

    object_id = models.BigIntegerField()
    notiftype = models.CharField(max_length=10)
    object_type = models.CharField(max_length=50)
    title = models.CharField(max_length=100)
    message = models.TextField()
    change_message = models.TextField(blank=True)
    is_read=models.BooleanField(default=False)
    is_active = models.BooleanField(default=True)
    method = models.CharField(max_length=10, choices=METHOD_CHOICES)
    delivered_at = models.DateTimeField(null=True, blank=True)
    expires_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(null=True,blank=True)
    users = models.ManyToManyField(
        settings.AUTH_USER_MODEL,
        through= settings.USER_NOT,
        related_name='notifications',
        blank = True
    )

    def __str__(self):
        return self.title

class UserNotification(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    notif = models.ForeignKey(settings.NOTIFICATION_MODEL, on_delete=models.CASCADE)
    attribute = models.TextField(blank=True)

    def __str__(self):
        return f"{self.user.username} ↔ {self.notif.title}"

auditlog.register(Notification)
