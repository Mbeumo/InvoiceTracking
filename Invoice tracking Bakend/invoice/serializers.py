from rest_framework import serializers
from decimal import Decimal
from datetime import datetime

from .models import Invoice, InvoiceComment, InvoiceTemplate


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