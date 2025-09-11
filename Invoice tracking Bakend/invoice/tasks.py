from celery import shared_task
from django.db import transaction, models
from django.db.models import Count, Avg
from django.core.mail import send_mail
from django.conf import settings
from django.utils import timezone
from datetime import datetime, timedelta
from decimal import Decimal, InvalidOperation
import logging

from .models import Invoice, InvoiceTemplate
from .ocr.engine import OcrEngine, TemplateHint

logger = logging.getLogger(__name__)


@shared_task
def process_invoice_ocr(invoice_id: int) -> dict:
    """Process OCR for uploaded invoice."""
    try:
        invoice = Invoice.objects.select_related("supplier").get(id=invoice_id)
    except Invoice.DoesNotExist:
        logger.error(f"Invoice {invoice_id} not found")
        return {"success": False, "error": "Invoice not found"}

    if not invoice.file:
        logger.error(f"No file attached to invoice {invoice_id}")
        return {"success": False, "error": "No file attached"}

    try:
        # Build template candidates from DB
        candidates = []
        templates = InvoiceTemplate.objects.filter(enabled=True)
        
        # Filter by supplier if available
        if invoice.supplier:
            supplier_templates = templates.filter(supplier=invoice.supplier)
            if supplier_templates.exists():
                templates = supplier_templates
        
        for template in templates:
            candidates.append(
                TemplateHint(
                    template_id=template.id,
                    name=template.name,
                    detection_keywords=template.detection_keywords,
                    rois=template.rois
                )
            )

        # Run OCR processing
        engine = OcrEngine()
        result = engine.run(image_path=invoice.file.path, templates=candidates)

        # Update invoice with OCR results
        with transaction.atomic():
            invoice.raw_text = result.raw_text
            invoice.ocr_confidence = result.confidence
            
            if result.template_id:
                invoice.matched_template_id = result.template_id
            
            # Update fields if extracted and not already set
            if result.fields.get("invoice_number") and not invoice.number:
                invoice.number = result.fields["invoice_number"]
            
            # Parse and update amount
            if result.fields.get("amount") and not invoice.amount:
                try:
                    amount_str = result.fields["amount"].replace(",", "")
                    invoice.amount = Decimal(amount_str)
                except (InvalidOperation, ValueError):
                    logger.warning(f"Could not parse amount: {result.fields['amount']}")
            
            # Parse dates
            if result.fields.get("date"):
                try:
                    # Simple date parsing - you might want to use dateutil.parser for more robust parsing
                    date_str = result.fields["date"]
                    if "/" in date_str:
                        parsed_date = datetime.strptime(date_str, "%m/%d/%Y").date()
                    elif "-" in date_str:
                        parsed_date = datetime.strptime(date_str, "%m-%d-%Y").date()
                    else:
                        parsed_date = None
                    
                    if parsed_date and not invoice.issue_date:
                        invoice.issue_date = parsed_date
                        # Set due date 30 days from issue date if not set
                        if not invoice.due_date:
                            invoice.due_date = parsed_date + timedelta(days=30)
                            
                except ValueError:
                    logger.warning(f"Could not parse date: {result.fields['date']}")
            
            invoice.save()
            
        logger.info(f"OCR processing completed for invoice {invoice_id}")
        return {
            "success": True,
            "confidence": result.confidence,
            "template_matched": result.template_id is not None,
            "fields_extracted": len(result.fields)
        }
        
    except Exception as e:
        logger.error(f"OCR processing failed for invoice {invoice_id}: {e}")
        return {"success": False, "error": str(e)}


@shared_task
def detect_anomalies() -> dict:
    """Run periodic anomaly detection over invoices."""
    try:
        anomalies = []
        
        # Check for duplicate invoices
        duplicates = Invoice.objects.values('supplier', 'number').annotate(
            count=Count('id')
        ).filter(count__gt=1)
        
        for dup in duplicates:
            anomalies.append({
                "type": "duplicate_invoice",
                "supplier": dup['supplier'],
                "number": dup['number'],
                "count": dup['count']
            })
        
        # Check for unusually high amounts
        avg_amount = Invoice.objects.aggregate(avg=Avg('amount'))['avg'] or 0
        high_threshold = avg_amount * 3  # 3x average
        
        high_amount_invoices = Invoice.objects.filter(
            amount__gt=high_threshold,
            status__in=[Invoice.Status.PENDING, Invoice.Status.APPROVED]
        )
        
        for invoice in high_amount_invoices:
            anomalies.append({
                "type": "high_amount",
                "invoice_id": invoice.id,
                "amount": float(invoice.amount),
                "threshold": float(high_threshold)
            })
        
        logger.info(f"Anomaly detection completed. Found {len(anomalies)} anomalies")
        return {"success": True, "anomalies": anomalies}
        
    except Exception as e:
        logger.error(f"Anomaly detection failed: {e}")
        return {"success": False, "error": str(e)}


@shared_task
def send_due_reminders() -> dict:
    """Send email reminders for upcoming due invoices."""
    try:
        # Find invoices due in 3 days
        due_soon = timezone.now().date() + timedelta(days=3)
        upcoming_invoices = Invoice.objects.filter(
            due_date__lte=due_soon,
            due_date__gte=timezone.now().date(),
            status__in=[Invoice.Status.APPROVED, Invoice.Status.PENDING]
        ).select_related('supplier', 'created_by')
        
        # Find overdue invoices
        overdue_invoices = Invoice.objects.filter(
            due_date__lt=timezone.now().date(),
            status__in=[Invoice.Status.APPROVED, Invoice.Status.PENDING]
        ).select_related('supplier', 'created_by')
        
        sent_count = 0
        
        # Send reminders for upcoming invoices
        for invoice in upcoming_invoices:
            try:
                send_mail(
                    subject=f"Invoice {invoice.number} Due Soon",
                    message=f"Invoice {invoice.number} from {invoice.supplier.name} "
                           f"for ${invoice.amount} is due on {invoice.due_date}",
                    from_email=settings.DEFAULT_FROM_EMAIL,
                    recipient_list=[invoice.created_by.email],
                    fail_silently=False
                )
                sent_count += 1
            except Exception as e:
                logger.error(f"Failed to send reminder for invoice {invoice.id}: {e}")
        
        # Send overdue notifications
        for invoice in overdue_invoices:
            try:
                days_overdue = (timezone.now().date() - invoice.due_date).days
                send_mail(
                    subject=f"OVERDUE: Invoice {invoice.number}",
                    message=f"Invoice {invoice.number} from {invoice.supplier.name} "
                           f"for ${invoice.amount} is {days_overdue} days overdue!",
                    from_email=settings.DEFAULT_FROM_EMAIL,
                    recipient_list=[invoice.created_by.email],
                    fail_silently=False
                )
                sent_count += 1
            except Exception as e:
                logger.error(f"Failed to send overdue notice for invoice {invoice.id}: {e}")
        
        logger.info(f"Sent {sent_count} due date reminders")
        return {
            "success": True,
            "upcoming_count": upcoming_invoices.count(),
            "overdue_count": overdue_invoices.count(),
            "sent_count": sent_count
        }
        
    except Exception as e:
        logger.error(f"Due reminder task failed: {e}")
        return {"success": False, "error": str(e)}