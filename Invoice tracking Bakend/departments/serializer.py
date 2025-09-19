from rest_framework import serializers
from decimal import Decimal
from datetime import datetime
from .models import Service

class ServiceSerializer(serializers.ModelSerializer):
    invoice_count = serializers.SerializerMethodField()
    pending_invoices = serializers.SerializerMethodField()
    
    class Meta:
        model = Service
        fields = [
            "service_id", "name", "code", "description", "color", "icon",
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