from asgiref.sync import async_to_sync
from channels.layers import get_channel_layer
from django.db.models.signals import post_save
from django.dispatch import receiver
from django.utils import timezone

from .models import Invoice, Notification, AIProcessingResult


@receiver(post_save, sender=Notification)
def broadcast_notification(sender, instance: Notification, created: bool, **kwargs):
    """Broadcast new notifications via WebSocket"""
    if created:
        channel_layer = get_channel_layer()
        
        if channel_layer:
            # Send to user-specific group
            async_to_sync(channel_layer.group_send)(f"user_{instance.user.id}", {
                "type": "new_notification",
                "notification": {
                    "id": instance.id,
                    "title": instance.title,
                    "message": instance.message,
                    "type": instance.type,
                    "priority": instance.priority,
                    "created_at": instance.created_at.isoformat(),
                },
                "user_id": str(instance.user.id),
                "timestamp": timezone.now().isoformat()
            })
            
            # Send to general notifications group
            async_to_sync(channel_layer.group_send)("notifications", {
                "type": "new_notification",
                "notification": {
                    "id": instance.id,
                    "title": instance.title,
                    "type": instance.type,
                    "priority": instance.priority,
                },
                "user_id": str(instance.user.id),
                "timestamp": timezone.now().isoformat()
            })
@receiver(post_save, sender=Invoice)
def broadcast_invoice_change(sender, instance: Invoice, created: bool, **kwargs):
@receiver(post_save, sender=AIProcessingResult)
def broadcast_ai_processing_complete(sender, instance: AIProcessingResult, created: bool, **kwargs):
    """Broadcast AI processing completion via WebSocket"""
    if not created and instance.processing_status == 'completed':
        channel_layer = get_channel_layer()
        
        if channel_layer:
            # Send to invoice-specific group
            async_to_sync(channel_layer.group_send)(f"invoice_{instance.invoice.id}", {
                "type": "ai_processing_complete",
                "invoice_id": instance.invoice.id,
                "results": {
                    "ocr_confidence": instance.ocr_confidence,
                    "anomaly_score": instance.anomaly_score,
                    "priority_score": instance.priority_score,
                    "fraud_risk_score": instance.fraud_risk_score,
                    "recommendations": instance.ai_recommendations,
                    "anomalies": instance.anomalies_detected,
                },
                "timestamp": timezone.now().isoformat()
            })
            
            # Send to AI insights group
            async_to_sync(channel_layer.group_send)("ai_insights", {
                "type": "new_insight",
                "insight": {
                    "invoice_id": instance.invoice.id,
                    "invoice_number": instance.invoice.number,
                    "processing_completed": True,
                    "risk_score": instance.fraud_risk_score,
                    "anomalies_count": len(instance.anomalies_detected) if instance.anomalies_detected else 0,
                },
                "timestamp": timezone.now().isoformat()
            })
    """Broadcast invoice changes via WebSocket"""
    channel_layer = get_channel_layer()
    
    if channel_layer:
        # Send to general invoice updates group
        async_to_sync(channel_layer.group_send)("invoice_updates", {
            "type": "invoice_updated",
            "invoice": {
                "id": instance.id,
                "number": instance.number,
                "status": instance.status,
                "total_amount": str(instance.total_amount),
                "vendor_name": instance.vendor_name,
                "created": created,
            },
            "timestamp": timezone.now().isoformat()
        })
        
        # Send to specific invoice group
        async_to_sync(channel_layer.group_send)(f"invoice_{instance.id}", {
            "type": "invoice_updated",
            "invoice": {
                "id": instance.id,
                "number": instance.number,
                "status": instance.status,
                "total_amount": str(instance.total_amount),
                "vendor_name": instance.vendor_name,
            },
            "timestamp": timezone.now().isoformat()
        })
        
        # If status changed, send specific status change event
        if not created and hasattr(instance, '_original_status'):
            if instance._original_status != instance.status:
                async_to_sync(channel_layer.group_send)("invoice_updates", {
                    "type": "invoice_status_changed",
                    "invoice_id": instance.id,
                    "old_status": instance._original_status,
                    "new_status": instance.status,
                    "changed_by": getattr(instance, '_changed_by', 'Unknown'),
                    "timestamp": timezone.now().isoformat()
                })