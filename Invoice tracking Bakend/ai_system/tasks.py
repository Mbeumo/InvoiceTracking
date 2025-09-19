from celery import shared_task
from django.db import transaction, models
from django.db.models import Count, Avg
from django.core.mail import send_mail
from django.conf import settings
from django.utils import timezone
from datetime import datetime, timedelta
from decimal import Decimal, InvalidOperation
import logging
from .ocr.engine import OcrEngine, TemplateHint

from invoice.models import Invoice, InvoiceTemplate,WorkflowRule
from notifications.models import Notification
from ai_system.models import AIProcessingResult
from invoice.service import WorkflowAutomationService
#import workflow service


logger = logging.getLogger(__name__)


@shared_task
def process_invoice_ocr(invoice_id: int) -> dict:
    """Process OCR for uploaded invoice."""
    try:
        invoice = Invoice.objects.select_related("created_by").get(id=invoice_id)
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
                invoice.matched_template = result.template_id
            
            # Update fields if extracted and not already set
            if result.fields.get("number") and not invoice.number:
                invoice.number = result.fields["number"]
            
            # Parse and update amount
            if result.fields.get("total_amount") and not invoice.total_amount:
                try:
                    amount_str = result.fields["total_amount"].replace(",", "")
                    invoice.total_amount = Decimal(amount_str)
                except (InvalidOperation, ValueError):
                    logger.warning(f"Could not parse amount: {result.fields['total_amount']}")
            
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
def process_invoice_ai_pipeline(invoice_id: int) -> dict:
    """Complete AI processing pipeline for new invoices"""
    try:
        invoice = Invoice.objects.get(id=invoice_id)
        
        # Update processing status
        ai_result, created = AIProcessingResult.objects.get_or_create(
            invoice=invoice,
            defaults={'processing_status': 'processing', 'processing_started_at': timezone.now()}
        )
        
        if not created:
            ai_result.processing_status = 'processing'
            ai_result.processing_started_at = timezone.now()
            ai_result.save()
        
        # Run complete AI pipeline
        processing_result = WorkflowAutomationService.process_new_invoice(invoice)
        
        # Update AI result
        ai_result.processing_status = 'completed'
        ai_result.processing_completed_at = timezone.now()
        ai_result.ai_recommendations = processing_result.get('recommendations', [])
        ai_result.suggested_actions = processing_result.get('next_actions', [])
        ai_result.save()
        
        # Update invoice with AI results
        invoice.ai_processing_status = 'completed'
        if 'priority_score' in processing_result:
            invoice.ai_priority_score = processing_result['priority_score']
        if 'risk_score' in processing_result:
            invoice.ai_risk_score = processing_result['risk_score']
        invoice.save()
        
        logger.info(f"AI pipeline completed for invoice {invoice_id}")
        return {
            "success": True,
            "processing_result": processing_result,
            "ai_result_id": ai_result.id
        }
        
    except Invoice.DoesNotExist:
        logger.error(f"Invoice {invoice_id} not found for AI processing")
        return {"success": False, "error": "Invoice not found"}
    except Exception as e:
        logger.error(f"AI pipeline failed for invoice {invoice_id}: {e}")
        
        # Update status to failed
        try:
            ai_result = AIProcessingResult.objects.get(invoice_id=invoice_id)
            ai_result.processing_status = 'failed'
            ai_result.error_message = str(e)
            ai_result.save()
        except:
            pass
        
        return {"success": False, "error": str(e)}


@shared_task
def detect_anomalies() -> dict:
    """Run periodic anomaly detection over invoices."""
    try:
        anomalies = []
        
        # Check for duplicate invoices
        duplicates = Invoice.objects.values('vendor_name', 'number').annotate(
            count=Count('id')
        ).filter(count__gt=1)
        
        for dup in duplicates:
            anomalies.append({
                "type": "duplicate_invoice",
                "vendor_name": dup['supplier'],
                "number": dup['number'],
                "count": dup['count']
            })
        
        # Check for unusually high amounts
        avg_amount = Invoice.objects.aggregate(avg=Avg('total_amount'))['avg'] or 0
        high_threshold = avg_amount * 3  # 3x average
        
        high_amount_invoices = Invoice.objects.filter(
            amount__gt=high_threshold,
            status__in=[Invoice.Status.PENDING, Invoice.Status.APPROVED]
        )
        
        for invoice in high_amount_invoices:
            anomalies.append({
                "type": "high_amount",
                "id": invoice.id,
                "total_amount": float(invoice.amount),
                "threshold": float(high_threshold)
            })
        
        logger.info(f"Anomaly detection completed. Found {len(anomalies)} anomalies")
        return {"success": True, "anomalies": anomalies}
        
    except Exception as e:
        logger.error(f"Anomaly detection failed: {e}")
        return {"success": False, "error": str(e)}
