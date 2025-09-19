from django.db import models

# Create your models here
from django.db import models
from django.conf import settings
from invoice.models import Invoice

class AIProcessingResult(models.Model):
    PROCESSING_STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('running', 'Running'),
        ('completed', 'Completed'),
        ('failed', 'Failed'),
    ]

    invoice = models.ForeignKey(Invoice, on_delete=models.CASCADE, related_name='ai_results')
    ocr_text = models.TextField(blank=True, null=True)
    ocr_confidence = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True)
    extracted_data = models.JSONField(blank=True, null=True)
    anomaly_score = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True)
    anomalies_detected = models.JSONField(blank=True, null=True)
    priority_score = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True)
    fraud_risk_score = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True)
    processing_status = models.CharField(max_length=20, choices=PROCESSING_STATUS_CHOICES, default='pending')
    processing_started_at = models.DateTimeField(null=True, blank=True)
    processing_completed_at = models.DateTimeField(null=True, blank=True)
    processing_time_ms = models.IntegerField(null=True, blank=True)
    ai_model_version = models.CharField(max_length=50, blank=True, null=True)
    error_message = models.TextField(blank=True, null=True)
    ai_recommendations = models.JSONField(blank=True, null=True)
    suggested_actions = models.JSONField(blank=True, null=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)


    def __str__(self):
        return f"AI Result for Invoice {self.invoice.number}"
