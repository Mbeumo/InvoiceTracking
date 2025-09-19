from rest_framework import serializers

from .models import AIProcessingResult

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