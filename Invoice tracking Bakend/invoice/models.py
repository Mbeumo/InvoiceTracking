from sys import audit
from django.db import models
from django.conf import settings
from auditlog.registry import auditlog

# Create your models here.


class InvoiceTemplate(models.Model):
    #supplier = models.ForeignKey(Supplier, on_delete=models.CASCADE, related_name="templates", null=True, blank=True)
    name = models.CharField(max_length=255)

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="invoice_templates",
        null=True,
        blank=True
    )
    name = models.CharField(max_length=255)
    enabled = models.BooleanField(default=True)
    # simple keyword-based detection and field extraction hints
    detection_keywords = models.JSONField(default=list, blank=True)
    # Regions of interest (percent-based rects) for key fields: { field: {x,y,w,h} in 0..1 }
    rois = models.JSONField(default=dict, blank=True)

    sample_image = models.ImageField(upload_to="invoice_templates/", blank=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self) -> str:
        return self.name


class Invoice(models.Model):
    class Status(models.TextChoices):
        DRAFT = "draft", "Draft"
        PENDING_REVIEW = "pending_review", "Pending Review"
        PENDING_APPROVAL = "pending_approval", "Pending Approval"
        APPROVED = "approved", "Approved"
        REJECTED = "rejected", "Rejected"
        TRANSFERRED = "transferred", "Transferred"
        PAID = "paid", "Paid"
        CANCELLED = "cancelled", "Cancelled"
        ARCHIVED = "archived", "Archived"

    class Priority(models.TextChoices):
        LOW = "low", "Low"
        MEDIUM = "medium", "Medium"
        HIGH = "high", "High"
        URGENT = "urgent", "Urgent"
        CRITICAL = "critical", "Critical"

    number = models.CharField(max_length=100)
    #vendor = models.ForeignKey(Vendor, on_delete=models.PROTECT, related_name="invoices")
    vendor_name = models.CharField(max_length=255)
    vendor_email = models.EmailField(blank=True)
    vendor_phone = models.CharField(max_length=50, blank=True)

    description = models.TextField(blank=True)
    notes = models.TextField(blank=True)
    external_reference = models.CharField(max_length=100, blank=True)

    subtotal = models.DecimalField(max_digits=12, decimal_places=2)
    tax_amount = models.DecimalField(max_digits=12, decimal_places=2)
    total_amount = models.DecimalField(max_digits=12, decimal_places=2)
    currency = models.CharField(max_length=10, default="USD")
    exchange_rate = models.FloatField(null=True, blank=True)
    base_currency_amount = models.DecimalField(max_digits=12, decimal_places=2, null=True, blank=True)

    invoice_date = models.DateField()
    issue_date = models.DateField()
    due_date = models.DateField()
    payment_date = models.DateField(null=True, blank=True)

    status = models.CharField(max_length=20, choices=Status.choices, default=Status.DRAFT)
    current_service = models.CharField(max_length=255)
    assigned_to = models.ForeignKey(
        settings.AUTH_USER_MODEL, 
        on_delete=models.SET_NULL, 
        null=True, blank=True
    )
    priority = models.CharField(max_length=10, choices=Priority.choices, default=Priority.MEDIUM)

    approval_level = models.IntegerField(default=0)
    approved_by = models.ForeignKey(
        settings.AUTH_USER_MODEL, 
        on_delete=models.SET_NULL, 
        null=True, 
        blank=True, 
        related_name="approved_invoices"
    )
    approved_at = models.DateTimeField(null=True, blank=True)
    rejection_reason = models.TextField(blank=True)

    payment_terms = models.IntegerField(default=30)
    late_fees = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    discount_amount = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    discount_due_date = models.DateField(null=True, blank=True)

    file = models.FileField(upload_to="invoices/")
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL, 
        on_delete=models.PROTECT, 
        related_name="created_invoices"
    )
    updated_by = models.ForeignKey(
        settings.AUTH_USER_MODEL, 
        on_delete=models.SET_NULL, 
        null=True, 
        blank=True, 
        related_name="updated_invoices"
    )

    version = models.IntegerField(default=1)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    raw_text = models.TextField(blank=True)  # Full OCR output
    ocr_confidence = models.FloatField(null=True, blank=True)  # Confidence score from OCR engine
    matched_template = models.ForeignKey(
        settings.TEMPLATE_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="matched_invoices"
    )
    workflow = models.ForeignKey(
        settings.WORKFLOW_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="workflow_invoices"
    )

    class Meta:
        unique_together = ("vendor_name", "number")
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.vendor_name} #{self.number}"

class InvoiceAttachment(models.Model):
    invoice = models.ForeignKey(settings.INVOICE_MODEL, on_delete=models.CASCADE, related_name="attachments")
    file_name = models.CharField(max_length=255)
    file_path = models.CharField(max_length=500)
    file_size = models.BigIntegerField()
    mime_type = models.CharField(max_length=100)
    uploaded_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True)
    uploaded_at = models.DateTimeField(auto_now_add=True)
    description = models.TextField(blank=True)

class InvoiceLineItem(models.Model):
    invoice = models.ForeignKey(settings.INVOICE_MODEL, on_delete=models.CASCADE, related_name="line_items")
    description = models.CharField(max_length=255)
    quantity = models.IntegerField()
    unit_price = models.DecimalField(max_digits=10, decimal_places=2)
    total_price = models.DecimalField(max_digits=12, decimal_places=2)
    tax_rate = models.FloatField(null=True, blank=True)
    tax_amount = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    cost_center = models.CharField(max_length=100, blank=True)
    gl_account = models.CharField(max_length=100, blank=True)
    category = models.CharField(max_length=100, blank=True)

class InvoiceHistory(models.Model):
    class ActionType(models.TextChoices):
        STATUS_CHANGE = "status_change"
        SERVICE_TRANSFER = "service_transfer"
        ASSIGNMENT_CHANGE = "assignment_change"
        APPROVAL = "approval"
        REJECTION = "rejection"
        COMMENT_ADDED = "comment_added"
        FILE_ATTACHED = "file_attached"
        AMOUNT_MODIFIED = "amount_modified"
        DUE_DATE_CHANGED = "due_date_changed"
        PRIORITY_CHANGED = "priority_changed"
        BULK_OPERATION = "bulk_operation"
        SYSTEM_ACTION = "system_action"

    invoice = models.ForeignKey(settings.INVOICE_MODEL, on_delete=models.CASCADE, related_name="history")
    action = models.CharField(max_length=255)
    action_type = models.CharField(max_length=50, choices=ActionType.choices)

    from_status = models.CharField(max_length=20, choices=Invoice.Status.choices, null=True, blank=True)
    to_status = models.CharField(max_length=20, choices=Invoice.Status.choices, null=True, blank=True)
    from_service = models.CharField(max_length=255, blank=True)
    to_service = models.CharField(max_length=255, blank=True)

    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True)
    user_name = models.CharField(max_length=255)
    user_email = models.EmailField()

    comment = models.TextField(blank=True)
    metadata = models.JSONField(default=dict, blank=True)

    timestamp = models.DateTimeField(auto_now_add=True)
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    user_agent = models.TextField(blank=True)
    session_id = models.CharField(max_length=255, blank=True)

class InvoiceComment(models.Model):
    invoice = models.ForeignKey(settings.INVOICE_MODEL, on_delete=models.CASCADE, related_name="comments")
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    comment = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self) -> str:
        return f"Comment by {self.user} on {self.invoice_id}"


class WorkflowRule(models.Model):
    TRIGGER_CHOICES = [
        ('event', 'Event'),
        ('time', 'Time'),
        ('manual', 'Manual'),
    ]

    ACTION_CHOICES = [
        ('notify', 'Notify'),
        ('approve', 'Approve'),
        ('escalate', 'Escalate'),
        ('assign', 'Assign'),
    ]

    name = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    trigger_type = models.CharField(max_length=20, choices=TRIGGER_CHOICES)
    trigger_conditions = models.JSONField(blank=True, null=True)
    action_type = models.CharField(max_length=20, choices=ACTION_CHOICES)
    action_parameters = models.JSONField(blank=True, null=True)

    # Placeholder for future many-to-many relationship
    services = models.ManyToManyField(
        settings.SERVICE_MODEL,
        through= settings.WORK_SERV,
        related_name='services_in_department'
    )


    priority = models.IntegerField(default=0)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        related_name='created_workflow_rules'
    )

    def __str__(self):
        return f"{self.name} ({self.trigger_type} → {self.action_type})"
class WorkflowRuleServiceLink(models.Model):
    workflow_rule = models.ForeignKey(settings.WORKFLOW_MODEL, on_delete=models.CASCADE)
    service = models.ForeignKey(settings.SERVICE_MODEL, on_delete=models.CASCADE)

    # Metadata fields
    scope = models.CharField(max_length=100, blank=True)
    is_enabled = models.BooleanField(default=True)
    activation_date = models.DateTimeField(null=True, blank=True)

    added_on = models.DateTimeField(auto_now_add=True)
    approved = models.BooleanField(default=False)
    def __str__(self):
        return f"{self.workflow_rule.name} ↔ {self.service.name}"

auditlog.register(Invoice)
# auditlog.register(InvoiceLineItem)
# auditlog.register(InvoiceAttachment)
# auditlog.register(InvoiceComment)
# no need i already got a history table for the log of inovices only 