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
from .serializers import (
    InvoiceCommentSerializer, InvoiceSerializer, InvoiceCreateSerializer,
    InvoiceStatusUpdateSerializer, InvoiceTemplateSerializer
)
from .permissions import IsManagerOrReadOnly
from .tasks import process_invoice_ocr


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
        # Trigger OCR processing asynchronously
        if invoice.file:
            process_invoice_ocr.delay(invoice.id)

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