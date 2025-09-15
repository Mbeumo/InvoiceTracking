from rest_framework import permissions, status, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.parsers import MultiPartParser, FormParser
from django.http import HttpResponse
from django.db.models import Q, Count, Sum
from django.db import models
from django.utils import timezone
from datetime import datetime, timedelta

from .models import Invoice, InvoiceComment, InvoiceTemplate
from .models import Notification, AIProcessingResult, WorkflowRule, Service, Vendor
from .serializers import (
    InvoiceCommentSerializer, InvoiceSerializer, InvoiceCreateSerializer,
    InvoiceStatusUpdateSerializer, InvoiceTemplateSerializer
)
from .permissions import IsManagerOrReadOnly
from .tasks import process_invoice_ocr, process_invoice_ai_pipeline, send_automated_reminders
from .ai_services import workflow_service, analytics_service, notification_service


"""class SupplierViewSet(viewsets.ModelViewSet):
    queryset = Supplier.objects.annotate(invoice_count=Count('invoices')) \
        .filter(user__role='supplier') 
    serializer_class = SupplierSerializer
    permission_classes = [permissions.IsAuthenticated]
    search_fields = ["name", "email"]
    ordering_fields = ["name", "invoice_count"]
"""


class InvoiceTemplateViewSet(viewsets.ModelViewSet):
    queryset = InvoiceTemplate.objects.all()
    serializer_class = InvoiceTemplateSerializer
    permission_classes = [permissions.IsAuthenticated]
    filterset_fields = ["supplier", "enabled"]


class InvoiceViewSet(viewsets.ModelViewSet):
    queryset = Invoice.objects.select_related("supplier", "created_by", "matched_template").all()
    serializer_class = InvoiceSerializer
    permission_classes = [permissions.IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser]
    filterset_fields = ["status", "supplier", "due_date"]
    search_fields = ["number", "supplier__name", "raw_text"]
    ordering_fields = ["created_at", "due_date", "amount"]

    def get_serializer_class(self):
        if self.action == 'create':
            return InvoiceCreateSerializer
        elif self.action == 'update_status':
            return InvoiceStatusUpdateSerializer
        return InvoiceSerializer

    def perform_create(self, serializer):
        invoice = serializer.save(created_by=self.request.user)
        # Trigger complete AI processing pipeline
        if invoice.file:
            process_invoice_ai_pipeline.delay(invoice.id)

    @action(detail=True, methods=["patch"], url_path="status")
    def update_status(self, request, pk=None):
        """Update invoice status with workflow validation."""
        invoice = self.get_object()
        serializer = InvoiceStatusUpdateSerializer(invoice, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        
        # Send notification about status change
        from notifications.tasks import send_status_notification
        send_status_notification.delay(invoice.id, request.user.id)
        
        return Response(InvoiceSerializer(invoice).data)

    @action(detail=True, methods=["get", "post"], url_path="comments")
    def comments(self, request, pk=None):
        """Manage invoice comments."""
        invoice = self.get_object()
        if request.method == "GET":
            qs = InvoiceComment.objects.filter(invoice=invoice).select_related("user").order_by('-created_at')
            return Response(InvoiceCommentSerializer(qs, many=True).data)
        
        serializer = InvoiceCommentSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        comment = serializer.save(invoice=invoice, user=request.user)
        
        # Send notification about new comment
        from notifications.tasks import send_comment_notification
        send_comment_notification.delay(comment.id)
        
        return Response(InvoiceCommentSerializer(comment).data, status=status.HTTP_201_CREATED)

    @action(detail=False, methods=["get"], url_path="dashboard")
    def dashboard(self, request):
        """Get dashboard statistics."""
        queryset = self.get_queryset()
        
        # Calculate statistics
        total_invoices = queryset.count()
        pending_approval = queryset.filter(status=Invoice.Status.PENDING).count()
        overdue = queryset.filter(
            due_date__lt=timezone.now().date(),
            status__in=[Invoice.Status.APPROVED, Invoice.Status.PENDING]
        ).count()
        
        # Recent invoices
        recent = queryset.order_by('-created_at')[:5]
        
        # Monthly totals
        this_month = timezone.now().replace(day=1)
        monthly_total = queryset.filter(
            created_at__gte=this_month,
            status=Invoice.Status.PAID
        ).aggregate(total=Sum('amount'))['total'] or 0
        
        return Response({
            'total_invoices': total_invoices,
            'pending_approval': pending_approval,
            'overdue_count': overdue,
            'monthly_total': monthly_total,
            'recent_invoices': InvoiceSerializer(recent, many=True).data
        })

    @action(detail=False, methods=["get"], url_path="export")
    def export_csv(self, request):
        """Export filtered invoices to CSV."""
        qs = self.filter_queryset(self.get_queryset())
        response = HttpResponse(content_type="text/csv")
        response["Content-Disposition"] = f"attachment; filename=invoices_{timezone.now().strftime('%Y%m%d')}.csv"
        
        # CSV header
        response.write("id,number,supplier,amount,currency,issue_date,due_date,status,created_at\n")
        
        # CSV data
        for inv in qs:
            response.write(
                f"{inv.id},{inv.number},{inv.supplier.name},{inv.amount},{inv.currency},"
                f"{inv.issue_date},{inv.due_date},{inv.status},{inv.created_at.strftime('%Y-%m-%d')}\n"
            )
        return response

    @action(detail=True, methods=["post"], url_path="reprocess-ocr")
    def reprocess_ocr(self, request, pk=None):
        """Manually trigger OCR reprocessing."""
        invoice = self.get_object()
        if not invoice.file:
            return Response(
                {"error": "No file attached to invoice"}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Trigger OCR processing
        task = process_invoice_ocr.delay(invoice.id)
        return Response({"task_id": task.id, "message": "OCR processing started"})

    @action(detail=True, methods=["get"], url_path="ai-analysis")
    def ai_analysis(self, request, pk=None):
        """Get AI analysis results for invoice"""
        invoice = self.get_object()
        
        try:
            ai_result = AIProcessingResult.objects.get(invoice=invoice)
            return Response({
                "processing_status": ai_result.processing_status,
                "ocr_confidence": ai_result.ocr_confidence,
                "anomaly_score": ai_result.anomaly_score,
                "priority_score": ai_result.priority_score,
                "fraud_risk_score": ai_result.fraud_risk_score,
                "anomalies_detected": ai_result.anomalies_detected,
                "recommendations": ai_result.ai_recommendations,
                "suggested_actions": ai_result.suggested_actions,
                "processing_time_ms": ai_result.processing_time_ms
            })
        except AIProcessingResult.DoesNotExist:
            return Response(
                {"error": "AI analysis not available for this invoice"},
                status=status.HTTP_404_NOT_FOUND
            )
    
    @action(detail=True, methods=["post"], url_path="predict-payment-delay")
    def predict_payment_delay(self, request, pk=None):
        """Get payment delay prediction for invoice"""
        invoice = self.get_object()
        
        invoice_data = {
            'total_amount': float(invoice.total_amount),
            'vendor_name': invoice.vendor_name,
            'due_date': invoice.due_date.isoformat(),
            'current_service': invoice.current_service.id,
            'priority': invoice.priority
        }
        
        prediction = analytics_service.predict_payment_delay(invoice_data)
        return Response(prediction)
    
    @action(detail=False, methods=["post"], url_path="bulk-ai-process")
    def bulk_ai_process(self, request):
        """Trigger AI processing for multiple invoices"""
        invoice_ids = request.data.get('invoice_ids', [])
        
        if not invoice_ids:
            return Response(
                {"error": "No invoice IDs provided"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Trigger AI processing for each invoice
        task_ids = []
        for invoice_id in invoice_ids:
            task = process_invoice_ai_pipeline.delay(invoice_id)
            task_ids.append(task.id)
        
        return Response({
            "message": f"AI processing started for {len(invoice_ids)} invoices",
            "task_ids": task_ids
        })
    
    @action(detail=False, methods=["get"], url_path="predictive-insights")
    def predictive_insights(self, request):
        """Get AI-generated predictive insights"""
        from django.core.cache import cache
        
        # Try to get cached insights first
        insights = cache.get('predictive_insights', [])
        
        if not insights:
            # Generate new insights if cache is empty
            from .tasks import generate_predictive_insights
            task_result = generate_predictive_insights.delay()
            
            return Response({
                "message": "Generating new insights",
                "task_id": task_result.id,
                "check_back_in": "60 seconds"
            })
        
        return Response({
            "insights": insights,
            "generated_at": cache.get('insights_generated_at', timezone.now().isoformat())
        })


class NotificationViewSet(viewsets.ModelViewSet):
    """Enhanced notification management with real-time updates"""
    serializer_class = NotificationSerializer
    permission_classes = [permissions.IsAuthenticated]
    filterset_fields = ["type", "is_read", "priority"]
    ordering_fields = ["created_at", "priority"]
    
    def get_queryset(self):
        return Notification.objects.filter(user=self.request.user)
    
    @action(detail=True, methods=["post"], url_path="mark-read")
    def mark_read(self, request, pk=None):
        """Mark notification as read"""
        notification = self.get_object()
        notification.mark_as_read()
        return Response({"status": "marked as read"})
    
    @action(detail=False, methods=["post"], url_path="mark-all-read")
    def mark_all_read(self, request):
        """Mark all notifications as read"""
        updated_count = Notification.objects.filter(
            user=request.user,
            is_read=False
        ).update(is_read=True, read_at=timezone.now())
        
        return Response({"marked_read": updated_count})
    
    @action(detail=False, methods=["get"], url_path="unread-count")
    def unread_count(self, request):
        """Get count of unread notifications"""
        count = Notification.objects.filter(
            user=request.user,
            is_read=False
        ).count()
        
        return Response({"unread_count": count})


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


class WorkflowRuleViewSet(viewsets.ModelViewSet):
    """Workflow automation rule management"""
    queryset = WorkflowRule.objects.all()
    permission_classes = [permissions.IsAuthenticated, IsManagerOrReadOnly]
    filterset_fields = ["trigger_type", "action_type", "is_active"]
    ordering_fields = ["priority", "name", "created_at"]
    
    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)
    
    @action(detail=True, methods=["post"], url_path="test-rule")
    def test_rule(self, request, pk=None):
        """Test workflow rule against sample data"""
        rule = self.get_object()
        test_data = request.data.get('test_data', {})
        
        if not test_data:
            return Response(
                {"error": "No test data provided"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Test rule evaluation
        would_trigger = rule.evaluate(test_data)
        
        return Response({
            "rule_name": rule.name,
            "would_trigger": would_trigger,
            "trigger_conditions": rule.trigger_conditions,
            "action_type": rule.action_type,
            "action_parameters": rule.action_parameters
        })