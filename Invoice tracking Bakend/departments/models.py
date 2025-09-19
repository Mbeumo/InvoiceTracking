from django.db import models
from django.conf import settings
from auditlog.registry import auditlog


class Service(models.Model):
    name = models.CharField(max_length=255)
    code = models.CharField(max_length=50, unique=True)
    description = models.TextField(blank=True)
    color = models.CharField(max_length=7, help_text="Hex color code (e.g. #FF5733)", blank=True)
    icon = models.CharField(max_length=100, blank=True)

    can_create_invoices = models.BooleanField(default=True)
    can_approve_invoices = models.BooleanField(default=False)
    approval_threshold = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    requires_manager_approval = models.BooleanField(default=False)

    default_currency = models.CharField(max_length=10, default='EUR')
    payment_terms = models.CharField(max_length=100, blank=True)
    cost_center = models.CharField(max_length=100, blank=True)

    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    workflow_rules = models.ManyToManyField(
        settings.WORKFLOW_MODEL,
        through= settings.WORK_SERV,
        related_name='workflow_rules_from_invoice'
 
    )

    def __str__(self):
        return f"{self.name} ({self.code})"

auditlog.register(Service)
