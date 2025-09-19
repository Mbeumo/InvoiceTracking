from django.shortcuts import render
from rest_framework import permissions, status, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.parsers import MultiPartParser, FormParser
from django.http import HttpResponse
from django.db.models import Q, Count, Sum
from django.db import models
from django.utils import timezone
from datetime import datetime, timedelta
from .models import AIProcessingResult
from invoice.models import Invoice
# Create your views here.

class AIAnalyticsViewSet(viewsets.ViewSet):
    """AI-powered analytics and insights"""
    permission_classes = [permissions.IsAuthenticated]
    
    @action(detail=False, methods=["get"], url_path="dashboard-insights")
    def dashboard_insights(self, request):
        """Get AI insights for dashboard"""
        try:
            # Get recent AI processing results
            recent_results = AIProcessingResult.objects.filter(
                processing_status='completed',
                created_at__gte=timezone.now() - timedelta(days=30)
            ).select_related('invoice')
            
            # Calculate AI performance metrics
            total_processed = recent_results.count()
            avg_confidence = recent_results.aggregate(
                avg_confidence=models.Avg('ocr_confidence')
            )['avg_confidence'] or 0
            
            high_risk_count = recent_results.filter(
                fraud_risk_score__gte=70
            ).count()
            
            anomalies_detected = sum(
                len(result.anomalies_detected) for result in recent_results
            )
            
            return Response({
                "ai_performance": {
                    "total_processed": total_processed,
                    "avg_ocr_confidence": round(avg_confidence, 2),
                    "high_risk_invoices": high_risk_count,
                    "anomalies_detected": anomalies_detected,
                    "automation_rate": round((total_processed / max(total_processed, 1)) * 100, 1)
                },
                "insights": cache.get('predictive_insights', []),
                "last_updated": timezone.now().isoformat()
            })
            
        except Exception as e:
            return Response(
                {"error": str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    @action(detail=False, methods=["post"], url_path="analyze-spending-patterns")
    def analyze_spending_patterns(self, request):
        """Analyze spending patterns using AI"""
        try:
            time_range = request.data.get('time_range', 'month')
            service_filter = request.data.get('service', None)
            
            # Calculate date range
            if time_range == 'week':
                start_date = timezone.now().date() - timedelta(days=7)
            elif time_range == 'month':
                start_date = timezone.now().date() - timedelta(days=30)
            elif time_range == 'quarter':
                start_date = timezone.now().date() - timedelta(days=90)
            else:
                start_date = timezone.now().date() - timedelta(days=365)
            
            # Build query
            query = Q(
                status='paid',
                payment_date__gte=start_date
            )
            
            if service_filter:
                query &= Q(current_service=service_filter)
            
            # Get spending data
            spending_data = Invoice.objects.filter(query).aggregate(
                total_amount=Sum('total_amount'),
                avg_amount=Avg('total_amount'),
                invoice_count=Count('id')
            )
            
            # Vendor analysis
            top_vendors = Invoice.objects.filter(query).values(
                'vendor_name'
            ).annotate(
                total_spent=Sum('total_amount'),
                invoice_count=Count('id')
            ).order_by('-total_spent')[:10]
            
            # Service analysis
            service_breakdown = Invoice.objects.filter(query).values(
                'current_service__name'
            ).annotate(
                total_spent=Sum('total_amount'),
                invoice_count=Count('id')
            ).order_by('-total_spent')
            
            return Response({
                "time_range": time_range,
                "spending_summary": spending_data,
                "top_vendors": list(top_vendors),
                "service_breakdown": list(service_breakdown),
                "analysis_date": timezone.now().isoformat()
            })
            
        except Exception as e:
            return Response(
                {"error": str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
