from rest_framework import permissions, status, viewsets,parsers
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from django.http import HttpResponse
from django.db.models import Q, Count, Sum
from django.db import models
from django.shortcuts import get_object_or_404
from rest_framework.views import APIView
from django.utils import timezone
from datetime import datetime
from decimal import Decimal
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import filters
from django.utils.dateparse import parse_date
from django.db import transaction
from django.core.files.uploadedfile import UploadedFile
from pytesseract import image_to_string
from PIL import Image
from .ocr_utils import perform_ocr_and_extract_data, get_image_from_uploaded_file
import json
import io
from django.core.cache import cache

from .tasks import compute_analytics, CACHE_KEY,invoice_ocr_task
import re
from .models import Invoice, InvoiceComment, InvoiceTemplate,WorkflowRule
from notifications.models import Notification

#WorkflowRule, Service, Vendor
from ai_system.models import  AIProcessingResult
from .serializers import (
    InvoiceCommentSerializer, InvoiceSerializer, InvoiceCreateSerializer,
    InvoiceStatusUpdateSerializer, InvoiceTemplateSerializer
)
from .permissions import IsManagerOrReadOnly
from ai_system.tasks import process_invoice_ocr, process_invoice_ai_pipeline
from notifications.tasks import send_automated_reminders
#from .ai_services import workflow_service, analytics_service

from notifications.service import notification_service


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
    filterset_fields = ["vendor_name", "enabled"]


class InvoiceViewSet(viewsets.ModelViewSet):
    queryset = Invoice.objects.select_related("assigned_to", "created_by", "matched_template").all()
    serializer_class = InvoiceSerializer
    permission_classes = [permissions.AllowAny]
    parser_classes = [JSONParser, MultiPartParser, FormParser]
    filter_backends = [DjangoFilterBackend,filters.OrderingFilter]

    
    filterset_fields = ["status", "current_service", "due_date", "assigned_to"]
    search_fields = ["number", "vendor_name", "raw_text"]
    ordering_fields = ["created_at", "due_date", "total_amount"]

    def get_serializer_class(self):
        # Use a simpler serializer for creation to avoid 400s on missing read-only/derived fields
        if getattr(self, 'action', None) == 'create':
            return InvoiceCreateSerializer
        return InvoiceSerializer

    def perform_create(self, serializer):
        # Save the invoice with auditing fields
        instance = serializer.save(created_by=self.request.user, updated_by=self.request.user)
        # If a file is attached, trigger asynchronous OCR processing
        if instance.file:
            invoice_ocr_task.delay(instance.id)

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
    @action(detail=False, methods=["post"], url_path="ocr-upload")
    def ocr_upload(self, request):
        uploaded_file = request.FILES.get("file")

        if not uploaded_file:
            return Response({"error": "No file provided."}, status=status.HTTP_400_BAD_REQUEST)

        try:
            # Convert uploaded file to an image format suitable for OCR
            image_for_ocr = get_image_from_uploaded_file(uploaded_file)
            extracted_data, raw_text, ocr_confidence = perform_ocr_and_extract_data(image_for_ocr)
        except ValueError as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return Response({"error": f"OCR processing failed: {e}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        # Prepare data for serializer, starting with OCR extracted data
        data_for_serializer = {
            "vendor_name": extracted_data.get("vendor_name"),
            "invoice_date": extracted_data.get("invoice_date"),
            "due_date": extracted_data.get("due_date"),
            "total_amount": extracted_data.get("total_amount"),
            "currency": extracted_data.get("currency"),
            "number": extracted_data.get("number"),
            "raw_text": raw_text,
            "ocr_confidence": ocr_confidence,
            "file": uploaded_file, # Attach the original file
        }

        # Apply manual overrides from request.data, ensuring they take precedence
        # request.data is a QueryDict for multipart/form-data, which can contain both file and other fields.
        # We iterate through the fields that can be overridden and check if they are explicitly provided
        # in the request.data (excluding the file itself).
        for field in ["vendor_name", "invoice_date", "due_date", "total_amount", "currency", "number"]:
            # If the field is explicitly provided in request.data, it overrides the OCR-extracted value.
            # An empty string '' is considered a valid override to clear a field.
            if field in request.data:
                # For fields like vendor_name, invoice_date, etc., if an empty string is provided,
                # it should be treated as clearing the field, which means setting it to None.
                # Otherwise, use the provided value.
                if request.data[field] == '':
                    data_for_serializer[field] = None
                else:
                    data_for_serializer[field] = request.data[field]
        serializer = InvoiceSerializer(data=data_for_serializer, context={"request": request})
        if serializer.is_valid():
            instance = serializer.save(created_by=request.user)
            return Response(InvoiceSerializer(instance).data, status=status.HTTP_201_CREATED)
        else:
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class InvoiceOCRUploadView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    parser_classes = [parsers.MultiPartParser, parsers.FormParser]

    def post(self, request):
        uploaded_file: UploadedFile = request.FILES.get('file')
        invoice_id = request.data.get('invoice_id')

        if not uploaded_file:
            return Response({'detail': 'No file provided.'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            image = Image.open(uploaded_file)
            raw_text = image_to_string(image)
        except Exception as e:
            return Response({'detail': f'OCR failed: {str(e)}'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        # Simple regex-based extraction (replace with structured parser if needed)
        vendor_name = self.extract_vendor_name(raw_text)
        invoice_number = self.extract_invoice_number(raw_text)
        total_amount = self.extract_total_amount(raw_text)
        invoice_date = self.extract_invoice_date(raw_text)

        with transaction.atomic():
            if invoice_id:
                invoice = Invoice.objects.get(pk=invoice_id)
            else:
                invoice = Invoice(created_by=request.user)

            invoice.file = uploaded_file
            invoice.raw_text = raw_text
            invoice.ocr_confidence = 0.85  # Placeholder confidence
            invoice.vendor_name = vendor_name or invoice.vendor_name
            invoice.number = invoice_number or invoice.number
            invoice.total_amount = total_amount or invoice.total_amount
            invoice.invoice_date = invoice_date or invoice.invoice_date
            invoice.updated_by = request.user
            invoice.save()

        serializer = InvoiceSerializer(invoice)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def extract_vendor_name(self, text: str) -> str:
        match = re.search(r'(?i)vendor[:\s]+([A-Za-z0-9 &]+)', text)
        return match.group(1).strip() if match else None

    def extract_invoice_number(self, text: str) -> str:
        match = re.search(r'(?i)invoice\s+number[:\s]*([A-Z0-9\-]+)', text)
        return match.group(1).strip() if match else None

    def extract_total_amount(self, text: str) -> float:
        match = re.search(r'(?i)total[:\s]*\$?([\d,]+\.\d{2})', text)
        return float(match.group(1).replace(',', '')) if match else None

    def extract_invoice_date(self, text: str):
        match = re.search(r'(?i)date[:\s]*([0-9]{4}-[0-9]{2}-[0-9]{2})', text)
        return parse_date(match.group(1)) if match else None

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



class AnalyticsAPIView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        """
        Return cached analytics. If missing, trigger compute_analytics synchronously (or return empty and enqueue).
        Accept query param 'force_refresh=true' to recompute immediately (synchronously) - use with caution.
        """
        force = request.query_params.get("force_refresh", "false").lower() in ("1", "true", "yes")
        data = cache.get(ANALYTICS_KEY)
        if data and not force:
            return Response(data)

        if force:
            # compute synchronously (only if admin or internal; else consider asynchronous)
            result = compute_analytics.apply()  # runs task synchronously
            new_data = cache.get(ANALYTICS_KEY) or {}
            return Response(new_data if new_data else {"status": "computing"}, status=status.HTTP_200_OK)

        # If no cache, enqueue compute and return 202 with message
        compute_analytics.delay()
        return Response({"status": "queued", "message": "Analytics are being computed; try again shortly."}, status=status.HTTP_202_ACCEPTED)