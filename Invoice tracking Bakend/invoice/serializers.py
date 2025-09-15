from rest_framework import serializers
from decimal import Decimal
from datetime import datetime

from .models import Invoice, InvoiceComment, InvoiceTemplate
from .models import Notification, AIProcessingResult, WorkflowRule, Service, Vendor


"""class SupplierSerializer(serializers.ModelSerializer):
    invoice_count = serializers.SerializerMethodField()
    
    class Meta:
        model = Supplier
        fields = ["id", "name", "email", "phone", "invoice_count"]
        
    def get_invoice_count(self, obj):
        return obj.invoices.count()
"""

class InvoiceTemplateSerializer(serializers.ModelSerializer):
    class Meta:
        model = InvoiceTemplate
        fields = [
            "id", "supplier", "name", "enabled", "detection_keywords", 
            "rois", "sample_image", "created_at", "updated_at"
        ]


class InvoiceCreateSerializer(serializers.ModelSerializer):
    supplier_id = serializers.IntegerField(write_only=True)
    
    class Meta:
        model = Invoice
        fields = [
            "supplier_id", "number", "amount", "currency", 
            "issue_date", "due_date", "file"
        ]
    
    def validate_amount(self, value):
        if value <= 0:
            raise serializers.ValidationError("Amount must be positive")
        return value
    
    def validate_due_date(self, value):
        if value < datetime.now().date():
            raise serializers.ValidationError("Due date cannot be in the past")
        return value


class InvoiceSerializer(serializers.ModelSerializer):
    #supplier = SupplierSerializer(read_only=True)
    created_by = serializers.StringRelatedField(read_only=True)
    days_until_due = serializers.SerializerMethodField()
    is_overdue = serializers.SerializerMethodField()
    comments_count = serializers.SerializerMethodField()

    class Meta:
        model = Invoice
        fields = [
            "id", "created_by", "supplier", "number", "amount", "currency",
            "issue_date", "due_date", "status", "raw_text", "ocr_confidence",
            "matched_template", "file", "created_at", "updated_at",
            "days_until_due", "is_overdue", "comments_count"
        ]
        read_only_fields = [
            "id", "created_by", "raw_text", "ocr_confidence", 
            "matched_template", "created_at", "updated_at"
        ]
    
    def get_days_until_due(self, obj):
        from datetime import date
        return (obj.due_date - date.today()).days
    
    def get_is_overdue(self, obj):
        from datetime import date
        return obj.due_date < date.today() and obj.status != Invoice.Status.PAID
    
    def get_comments_count(self, obj):
        return obj.comments.count()


class InvoiceStatusUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Invoice
        fields = ["status"]
    
    def validate_status(self, value):
        current_status = self.instance.status if self.instance else None
        
        # Define valid status transitions
        valid_transitions = {
            Invoice.Status.DRAFT: [Invoice.Status.PENDING],
            Invoice.Status.PENDING: [Invoice.Status.APPROVED, Invoice.Status.REJECTED],
            Invoice.Status.APPROVED: [Invoice.Status.PAID],
            Invoice.Status.REJECTED: [Invoice.Status.DRAFT],
        }
        
        if current_status and value not in valid_transitions.get(current_status, []):
            raise serializers.ValidationError(
                f"Cannot transition from {current_status} to {value}"
            )
        
        return value


class InvoiceCommentSerializer(serializers.ModelSerializer):
    user = serializers.StringRelatedField(read_only=True)
    user_role = serializers.CharField(source='user.role', read_only=True)

    class Meta:
        model = InvoiceComment
        fields = ["id", "invoice", "user", "user_role", "comment", "created_at"]
        read_only_fields = ["id", "user", "user_role", "created_at"]


class NotificationSerializer(serializers.ModelSerializer):
    user_name = serializers.CharField(source='user.name', read_only=True)
    time_ago = serializers.SerializerMethodField()
    
    class Meta:
        model = Notification
        fields = [
            "id", "user", "user_name", "type", "title", "message",
            "related_entity_type", "related_entity_id", "action_url",
            "is_read", "is_archived", "priority", "delivery_channels",
            "created_at", "read_at", "expires_at", "time_ago"
        ]
        read_only_fields = ["id", "user", "user_name", "created_at", "time_ago"]
    
    def get_time_ago(self, obj):
        from django.utils.timesince import timesince
        return timesince(obj.created_at)


class AIProcessingResultSerializer(serializers.ModelSerializer):
    invoice_number = serializers.CharField(source='invoice.number', read_only=True)
    processing_duration = serializers.SerializerMethodField()
    
    class Meta:
        model = AIProcessingResult
        fields = [
            "id", "invoice", "invoice_number", "ocr_text", "ocr_confidence",
            "extracted_data", "anomaly_score", "anomalies_detected",
            "priority_score", "fraud_risk_score", "processing_status",
            "processing_started_at", "processing_completed_at", "processing_time_ms",
            "ai_model_version", "error_message", "ai_recommendations",
            "suggested_actions", "processing_duration"
        ]
        read_only_fields = [
            "id", "invoice_number", "processing_started_at", 
            "processing_completed_at", "processing_duration"
        ]
    
    def get_processing_duration(self, obj):
        if obj.processing_started_at and obj.processing_completed_at:
            duration = obj.processing_completed_at - obj.processing_started_at
            return duration.total_seconds()
        return None


class WorkflowRuleSerializer(serializers.ModelSerializer):
    created_by_name = serializers.CharField(source='created_by.name', read_only=True)
    service_name = serializers.CharField(source='service.name', read_only=True)
    
    class Meta:
        model = WorkflowRule
        fields = [
            "id", "name", "description", "trigger_type", "trigger_conditions",
            "action_type", "action_parameters", "service", "service_name",
            "priority", "is_active", "created_at", "updated_at",
            "created_by", "created_by_name"
        ]
        read_only_fields = ["id", "created_by", "created_by_name", "service_name"]


class ServiceSerializer(serializers.ModelSerializer):
    invoice_count = serializers.SerializerMethodField()
    pending_invoices = serializers.SerializerMethodField()
    
    class Meta:
        model = Service
        fields = [
            "id", "name", "code", "description", "color", "icon",
            "can_create_invoices", "can_approve_invoices", "approval_threshold",
            "requires_manager_approval", "default_currency", "payment_terms",
            "cost_center", "is_active", "created_at", "updated_at",
            "invoice_count", "pending_invoices"
        ]
        read_only_fields = ["id", "created_at", "updated_at", "invoice_count", "pending_invoices"]
    
    def get_invoice_count(self, obj):
        return obj.invoices.count()
    
    def get_pending_invoices(self, obj):
        return obj.invoices.filter(status='pending_approval').count()


class VendorSerializer(serializers.ModelSerializer):
    created_by_name = serializers.CharField(source='created_by.name', read_only=True)
    invoice_count = serializers.SerializerMethodField()
    total_amount = serializers.SerializerMethodField()
    last_invoice_date = serializers.SerializerMethodField()
    
    class Meta:
        model = Vendor
        fields = [
            "id", "name", "code", "email", "phone", "website",
            "address", "city", "state", "postal_code", "country",
            "tax_id", "registration_number", "vat_number",
            "default_currency", "payment_terms", "bank_account",
            "is_active", "rating", "notes", "created_at", "updated_at",
            "created_by", "created_by_name", "invoice_count", "total_amount",
            "last_invoice_date"
        ]
        read_only_fields = [
            "id", "created_by", "created_by_name", "created_at", "updated_at",
            "invoice_count", "total_amount", "last_invoice_date"
        ]
    
    def get_invoice_count(self, obj):
        return obj.invoices.count()
    
    def get_total_amount(self, obj):
        total = obj.invoices.aggregate(total=models.Sum('total_amount'))['total']
        return float(total) if total else 0.0
    
    def get_last_invoice_date(self, obj):
        last_invoice = obj.invoices.order_by('-invoice_date').first()
        return last_invoice.invoice_date if last_invoice else None