from sys import audit
from django.db import models
from django.conf import settings
from auditlog.registry import auditlog
from django.core.validators import MinValueValidator, MaxValueValidator
from django.utils import timezone
from datetime import timedelta

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


class Service(models.Model):
    """Service/Department model for organizational structure"""
    id = models.CharField(max_length=50, primary_key=True)
    name = models.CharField(max_length=255)
    code = models.CharField(max_length=10, unique=True)
    description = models.TextField(blank=True)
    color = models.CharField(max_length=7)  # Hex color
    icon = models.CharField(max_length=100, blank=True)
    
    # Workflow Configuration
    can_create_invoices = models.BooleanField(default=True)
    can_approve_invoices = models.BooleanField(default=False)
    approval_threshold = models.DecimalField(max_digits=15, decimal_places=2, null=True, blank=True)
    requires_manager_approval = models.BooleanField(default=True)
    
    # Business Rules
    default_currency = models.CharField(max_length=3, default='EUR')
    payment_terms = models.IntegerField(default=30)
    cost_center = models.CharField(max_length=50, blank=True)
    
    # Status
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    created_by = models.CharField(max_length=36, null=True, blank=True)
    
    class Meta:
        ordering = ['name']
    
    def __str__(self):
        return f"{self.name} ({self.code})"


class Vendor(models.Model):
    """Enhanced vendor model with business information"""
    id = models.CharField(max_length=36, primary_key=True)
    name = models.CharField(max_length=255)
    code = models.CharField(max_length=50, unique=True)
    email = models.EmailField(blank=True)
    phone = models.CharField(max_length=50, blank=True)
    website = models.URLField(blank=True)
    
    # Address Information
    address = models.TextField(blank=True)
    city = models.CharField(max_length=100, blank=True)
    state = models.CharField(max_length=100, blank=True)
    postal_code = models.CharField(max_length=20, blank=True)
    country = models.CharField(max_length=100, blank=True)
    
    # Business Information
    tax_id = models.CharField(max_length=100, blank=True)
    registration_number = models.CharField(max_length=100, blank=True)
    vat_number = models.CharField(max_length=100, blank=True)
    
    # Payment Information
    default_currency = models.CharField(max_length=3, default='EUR')
    payment_terms = models.IntegerField(default=30)
    bank_account = models.TextField(blank=True)
    
    # Status & Metadata
    is_active = models.BooleanField(default=True)
    rating = models.DecimalField(
        max_digits=2, 
        decimal_places=1, 
        null=True, 
        blank=True,
        validators=[MinValueValidator(1), MaxValueValidator(5)]
    )
    notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.PROTECT,
        related_name='created_vendors'
    )
    
    class Meta:
        ordering = ['name']
        indexes = [
            models.Index(fields=['name']),
            models.Index(fields=['code']),
            models.Index(fields=['is_active']),
        ]
    
    def __str__(self):
        return f"{self.name} ({self.code})"


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
    vendor = models.ForeignKey(Vendor, on_delete=models.PROTECT, related_name="invoices", null=True, blank=True)
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
    current_service = models.ForeignKey(Service, on_delete=models.PROTECT, related_name="invoices")
    assigned_to = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True)
    priority = models.CharField(max_length=10, choices=Priority.choices, default=Priority.MEDIUM)

    approval_level = models.IntegerField(default=0)
    approved_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True, related_name="approved_invoices")
    approved_at = models.DateTimeField(null=True, blank=True)
    rejection_reason = models.TextField(blank=True)

    payment_terms = models.IntegerField(default=30)
    late_fees = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    discount_amount = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    discount_due_date = models.DateField(null=True, blank=True)

    file = models.FileField(upload_to="invoices/")
    created_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.PROTECT, related_name="created_invoices")
    updated_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True, related_name="updated_invoices")

    version = models.IntegerField(default=1)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    # AI Processing Results
    raw_text = models.TextField(blank=True)
    ocr_confidence = models.FloatField(null=True, blank=True)
    ai_processing_status = models.CharField(
        max_length=20,
        choices=[
            ('pending', 'Pending'),
            ('processing', 'Processing'),
            ('completed', 'Completed'),
            ('failed', 'Failed')
        ],
        default='pending'
    )
    ai_risk_score = models.FloatField(null=True, blank=True)
    ai_priority_score = models.FloatField(null=True, blank=True)
    ai_anomalies = models.JSONField(default=list, blank=True)
    ai_recommendations = models.JSONField(default=list, blank=True)
    
    matched_template = models.ForeignKey(
        InvoiceTemplate,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="matched_invoices"
    )

    class Meta:
        unique_together = ("vendor_name", "number")
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.vendor_name} #{self.number}"
    
    @property
    def is_overdue(self):
        """Check if invoice is overdue"""
        return (
            self.due_date < timezone.now().date() and 
            self.status not in ['paid', 'cancelled', 'archived']
        )
    
    @property
    def days_until_due(self):
        """Calculate days until due date"""
        return (self.due_date - timezone.now().date()).days
    
    @property
    def requires_urgent_attention(self):
        """Check if invoice requires urgent attention"""
        return (
            self.is_overdue or 
            self.days_until_due <= 3 or
            self.priority in ['urgent', 'critical'] or
            (self.ai_risk_score and self.ai_risk_score > 70)
        )

class InvoiceAttachment(models.Model):
    invoice = models.ForeignKey(Invoice, on_delete=models.CASCADE, related_name="attachments")
    file_name = models.CharField(max_length=255)
    file_path = models.CharField(max_length=500)
    file_size = models.BigIntegerField()
    mime_type = models.CharField(max_length=100)
    uploaded_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True)
    uploaded_at = models.DateTimeField(auto_now_add=True)
    description = models.TextField(blank=True)

class InvoiceLineItem(models.Model):
    invoice = models.ForeignKey(Invoice, on_delete=models.CASCADE, related_name="line_items")
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

    invoice = models.ForeignKey(Invoice, on_delete=models.CASCADE, related_name="history")
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
    invoice = models.ForeignKey(Invoice, on_delete=models.CASCADE, related_name="comments")
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    comment = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self) -> str:
        return f"Comment by {self.user} on {self.invoice_id}" 


class Notification(models.Model):
    """Enhanced notification model with multiple delivery channels"""
    
    class Type(models.TextChoices):
        INFO = 'info', 'Info'
        WARNING = 'warning', 'Warning'
        ERROR = 'error', 'Error'
        SUCCESS = 'success', 'Success'
        REMINDER = 'reminder', 'Reminder'
    
    class Priority(models.TextChoices):
        LOW = 'low', 'Low'
        MEDIUM = 'medium', 'Medium'
        HIGH = 'high', 'High'
        URGENT = 'urgent', 'Urgent'
    
    id = models.CharField(max_length=36, primary_key=True)
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='notifications')
    type = models.CharField(max_length=20, choices=Type.choices)
    title = models.CharField(max_length=255)
    message = models.TextField()
    
    # Related Entity
    related_entity_type = models.CharField(max_length=50, blank=True)
    related_entity_id = models.CharField(max_length=36, blank=True)
    action_url = models.URLField(blank=True)
    
    # Status
    is_read = models.BooleanField(default=False)
    is_archived = models.BooleanField(default=False)
    priority = models.CharField(max_length=20, choices=Priority.choices, default=Priority.MEDIUM)
    
    # Delivery
    delivery_channels = models.JSONField(default=list)  # ['email', 'sms', 'push']
    delivered_at = models.DateTimeField(null=True, blank=True)
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    read_at = models.DateTimeField(null=True, blank=True)
    expires_at = models.DateTimeField(null=True, blank=True)
    
    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['user', 'is_read']),
            models.Index(fields=['type', 'priority']),
            models.Index(fields=['created_at']),
        ]
    
    def __str__(self):
        return f"{self.title} - {self.user.name}"
    
    def mark_as_read(self):
        """Mark notification as read"""
        if not self.is_read:
            self.is_read = True
            self.read_at = timezone.now()
            self.save()


class AIProcessingResult(models.Model):
    """Store AI processing results for invoices"""
    
    class ProcessingStatus(models.TextChoices):
        PENDING = 'pending', 'Pending'
        PROCESSING = 'processing', 'Processing'
        COMPLETED = 'completed', 'Completed'
        FAILED = 'failed', 'Failed'
        RETRY = 'retry', 'Retry'
    
    id = models.CharField(max_length=36, primary_key=True)
    invoice = models.OneToOneField(Invoice, on_delete=models.CASCADE, related_name='ai_result')
    
    # OCR Results
    ocr_text = models.TextField(blank=True)
    ocr_confidence = models.FloatField(null=True, blank=True)
    extracted_data = models.JSONField(default=dict)
    
    # ML Analysis Results
    anomaly_score = models.FloatField(null=True, blank=True)
    anomalies_detected = models.JSONField(default=list)
    priority_score = models.FloatField(null=True, blank=True)
    fraud_risk_score = models.FloatField(null=True, blank=True)
    
    # Processing Status
    processing_status = models.CharField(max_length=20, choices=ProcessingStatus.choices, default=ProcessingStatus.PENDING)
    processing_started_at = models.DateTimeField(null=True, blank=True)
    processing_completed_at = models.DateTimeField(null=True, blank=True)
    processing_time_ms = models.IntegerField(null=True, blank=True)
    
    # AI Model Information
    ai_model_version = models.CharField(max_length=50, blank=True)
    error_message = models.TextField(blank=True)
    
    # Recommendations
    ai_recommendations = models.JSONField(default=list)
    suggested_actions = models.JSONField(default=list)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        indexes = [
            models.Index(fields=['processing_status']),
    """Configurable workflow automation rules"""
    
    class TriggerType(models.TextChoices):
        AMOUNT_THRESHOLD = 'amount_threshold', 'Amount Threshold'
        VENDOR_TYPE = 'vendor_type', 'Vendor Type'
        SERVICE_RULE = 'service_rule', 'Service Rule'
        ANOMALY_DETECTED = 'anomaly_detected', 'Anomaly Detected'
        PRIORITY_LEVEL = 'priority_level', 'Priority Level'
    
    class ActionType(models.TextChoices):
        AUTO_APPROVE = 'auto_approve', 'Auto Approve'
        ASSIGN_USER = 'assign_user', 'Assign to User'
        REQUIRE_APPROVAL = 'require_approval', 'Require Approval'
        SEND_NOTIFICATION = 'send_notification', 'Send Notification'
        SET_PRIORITY = 'set_priority', 'Set Priority'
    
    id = models.CharField(max_length=36, primary_key=True)
    name = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    
    # Rule Configuration
    trigger_type = models.CharField(max_length=50, choices=TriggerType.choices)
    trigger_conditions = models.JSONField()  # Flexible conditions
    action_type = models.CharField(max_length=50, choices=ActionType.choices)
    action_parameters = models.JSONField()  # Flexible action parameters
    
    # Scope
    service = models.ForeignKey(Service, on_delete=models.CASCADE, null=True, blank=True)
    priority = models.IntegerField(default=1)  # Rule execution order
    
    # Status
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.PROTECT,
        related_name='created_workflow_rules'
    )
    
    class Meta:
        ordering = ['priority', 'name']
    
    def __str__(self):
        return f"{self.name} ({self.trigger_type} → {self.action_type})"
    
    def evaluate(self, invoice_data: Dict[str, Any]) -> bool:
        """Evaluate if this rule should trigger for given invoice data"""
        try:
            conditions = self.trigger_conditions
            
            if self.trigger_type == 'amount_threshold':
                amount = float(invoice_data.get('total_amount', 0))
                threshold = float(conditions.get('threshold', 0))
                operator = conditions.get('operator', 'gte')
                
                if operator == 'gte':
                    return amount >= threshold
                elif operator == 'lte':
                    return amount <= threshold
                elif operator == 'eq':
                    return abs(amount - threshold) < 0.01
            
            elif self.trigger_type == 'vendor_type':
                vendor_name = invoice_data.get('vendor_name', '').lower()
                vendor_patterns = conditions.get('patterns', [])
                
                return any(pattern.lower() in vendor_name for pattern in vendor_patterns)
            
            elif self.trigger_type == 'priority_level':
                invoice_priority = invoice_data.get('priority', 'medium')
                required_priorities = conditions.get('priorities', [])
                
                return invoice_priority in required_priorities
            
            elif self.trigger_type == 'anomaly_detected':
                risk_score = float(invoice_data.get('ai_risk_score', 0))
                threshold = float(conditions.get('risk_threshold', 50))
                
                return risk_score >= threshold
            
            return False
            
        except Exception as e:
            logger.error(f"Error evaluating workflow rule {self.id}: {e}")
            return False
            models.Index(fields=['anomaly_score']),
            models.Index(fields=['created_at']),
class SecurityAuditLog(models.Model):
    """Enhanced security and audit logging"""
    
    class ActionType(models.TextChoices):
        LOGIN = 'login', 'Login'
        LOGOUT = 'logout', 'Logout'
        INVOICE_CREATE = 'invoice_create', 'Invoice Created'
        INVOICE_UPDATE = 'invoice_update', 'Invoice Updated'
        INVOICE_DELETE = 'invoice_delete', 'Invoice Deleted'
        INVOICE_APPROVE = 'invoice_approve', 'Invoice Approved'
        INVOICE_REJECT = 'invoice_reject', 'Invoice Rejected'
        USER_CREATE = 'user_create', 'User Created'
        USER_UPDATE = 'user_update', 'User Updated'
        USER_DELETE = 'user_delete', 'User Deleted'
        PERMISSION_CHANGE = 'permission_change', 'Permission Changed'
        SYSTEM_CONFIG = 'system_config', 'System Configuration'
        DATA_EXPORT = 'data_export', 'Data Export'
        BULK_OPERATION = 'bulk_operation', 'Bulk Operation'
    
    class RiskLevel(models.TextChoices):
        LOW = 'low', 'Low'
        MEDIUM = 'medium', 'Medium'
        HIGH = 'high', 'High'
        CRITICAL = 'critical', 'Critical'
    
    id = models.CharField(max_length=36, primary_key=True)
    timestamp = models.DateTimeField(auto_now_add=True)
    
    # User Information
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True)
    user_email = models.EmailField()
    user_name = models.CharField(max_length=255)
    user_role = models.CharField(max_length=50)
    
    # Action Details
    action_type = models.CharField(max_length=50, choices=ActionType.choices)
    action_description = models.TextField()
    entity_type = models.CharField(max_length=50, blank=True)
    entity_id = models.CharField(max_length=36, blank=True)
    
    # Security Context
    ip_address = models.GenericIPAddressField()
    user_agent = models.TextField(blank=True)
    session_id = models.CharField(max_length=255, blank=True)
    request_id = models.CharField(max_length=255, blank=True)
    
    # Risk Assessment
    risk_level = models.CharField(max_length=20, choices=RiskLevel.choices, default=RiskLevel.LOW)
    risk_indicators = models.JSONField(default=list)
    
    # Data Changes
    old_values = models.JSONField(default=dict, blank=True)
    new_values = models.JSONField(default=dict, blank=True)
    
    # Additional Context
    metadata = models.JSONField(default=dict, blank=True)
    
    class Meta:
        ordering = ['-timestamp']
        indexes = [
            models.Index(fields=['user', 'timestamp']),
            models.Index(fields=['action_type', 'timestamp']),
            models.Index(fields=['risk_level', 'timestamp']),
            models.Index(fields=['ip_address', 'timestamp']),
        ]
    
    def __str__(self):
        return f"{self.action_type} by {self.user_name} at {self.timestamp}"
        ]
    
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
    def __str__(self):
        return f"AI Result for {self.invoice.number}"
auditlog.register(Invoice)
auditlog.register(Vendor)
auditlog.register(Service)
auditlog.register(Notification)
auditlog.register(WorkflowRule)
auditlog.register(SystemConfiguration)
# auditlog.register(InvoiceLineItem)
# auditlog.register(InvoiceAttachment)
# auditlog.register(InvoiceComment)
# no need i already got a history table for the log of inovices only 