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
from .ai_services import workflow_service, notification_service, analytics_service
from .models import Notification, AIProcessingResult, WorkflowRule

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
        processing_result = workflow_service.process_new_invoice(invoice)
        
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


@shared_task
def send_automated_reminders() -> dict:
    """Send automated reminders for due invoices with configurable timing"""
    try:
        sent_count = 0
        
        # Get reminder configuration from system settings
        from .models import SystemConfiguration
        
        try:
            reminder_days = SystemConfiguration.objects.get(key='reminder_days_before').get_typed_value()
        except SystemConfiguration.DoesNotExist:
            reminder_days = [7, 3, 1]  # Default: 7, 3, and 1 day before
        
        for days_before in reminder_days:
            target_date = timezone.now().date() + timedelta(days=days_before)
            
            # Find invoices due on target date
            upcoming_invoices = Invoice.objects.filter(
                due_date=target_date,
                status__in=['pending_approval', 'approved'],
                ai_processing_status='completed'
            ).select_related('vendor', 'assigned_to')
            
            for invoice in upcoming_invoices:
                notification_service.send_due_date_reminder(invoice, days_before)
                sent_count += 1
        
        # Send overdue notifications
        overdue_invoices = Invoice.objects.filter(
            due_date__lt=timezone.now().date(),
            status__in=['pending_approval', 'approved']
        ).select_related('vendor', 'assigned_to')
        
        for invoice in overdue_invoices:
            days_overdue = (timezone.now().date() - invoice.due_date).days
            
            # Send escalating notifications
            if days_overdue in [1, 3, 7, 14, 30]:  # Escalation schedule
                notification_service.send_due_date_reminder(invoice, -days_overdue)
                sent_count += 1
        
        logger.info(f"Sent {sent_count} automated reminders")
        return {
            "success": True,
            "reminders_sent": sent_count,
            "upcoming_count": upcoming_invoices.count(),
            "overdue_count": overdue_invoices.count()
        }
        
    except Exception as e:
        logger.error(f"Automated reminders task failed: {e}")
        return {"success": False, "error": str(e)}


@shared_task
def run_workflow_automation() -> dict:
    """Execute workflow automation rules"""
    try:
        processed_count = 0
        
        # Get pending invoices for workflow processing
        pending_invoices = Invoice.objects.filter(
            ai_processing_status='completed',
            status='draft'
        ).select_related('vendor', 'current_service')
        
        # Get active workflow rules
        active_rules = WorkflowRule.objects.filter(is_active=True).order_by('priority')
        
        for invoice in pending_invoices:
            invoice_data = {
                'id': invoice.id,
                'total_amount': float(invoice.total_amount),
                'vendor_name': invoice.vendor_name,
                'current_service': invoice.current_service.id,
                'priority': invoice.priority,
                'ai_risk_score': invoice.ai_risk_score or 0,
                'ai_priority_score': invoice.ai_priority_score or 50
            }
            
            # Apply workflow rules
            for rule in active_rules:
                if rule.evaluate(invoice_data):
                    success = apply_workflow_action(invoice, rule)
                    if success:
                        processed_count += 1
                        break  # Only apply first matching rule
        
        logger.info(f"Workflow automation processed {processed_count} invoices")
        return {
            "success": True,
            "processed_count": processed_count,
            "rules_evaluated": active_rules.count()
        }
        
    except Exception as e:
        logger.error(f"Workflow automation failed: {e}")
        return {"success": False, "error": str(e)}


def apply_workflow_action(invoice: Invoice, rule: WorkflowRule) -> bool:
    """Apply workflow rule action to invoice"""
    try:
        action_params = rule.action_parameters
        
        if rule.action_type == 'auto_approve':
            invoice.status = 'approved'
            invoice.approved_at = timezone.now()
            invoice.save()
            
            # Log the auto-approval
            InvoiceHistory.objects.create(
                invoice=invoice,
                action=f"Auto-approved by workflow rule: {rule.name}",
                action_type='approval',
                to_status='approved',
                user_name='System',
                user_email='system@company.com'
            )
            
        elif rule.action_type == 'assign_user':
            user_id = action_params.get('user_id')
            if user_id:
                try:
                    user = User.objects.get(id=user_id)
                    invoice.assigned_to = user
                    invoice.save()
                    
                    # Send notification to assigned user
                    notification_service.send_approval_request(invoice, user)
                    
                except User.DoesNotExist:
                    return False
        
        elif rule.action_type == 'set_priority':
            new_priority = action_params.get('priority', 'medium')
            invoice.priority = new_priority
            invoice.save()
        
        elif rule.action_type == 'require_approval':
            invoice.status = 'pending_approval'
            invoice.save()
        
        return True
        
    except Exception as e:
        logger.error(f"Failed to apply workflow action for rule {rule.id}: {e}")
        return False


@shared_task
def generate_predictive_insights() -> dict:
    """Generate predictive insights for cash flow and expenses"""
    try:
        insights_generated = 0
        
        # Cash flow prediction
        upcoming_payments = Invoice.objects.filter(
            status='approved',
            due_date__range=[
                timezone.now().date(),
                timezone.now().date() + timedelta(days=30)
            ]
        ).aggregate(
            total_amount=Sum('total_amount'),
            count=Count('id')
        )
        
        # Expense pattern analysis
        monthly_expenses = Invoice.objects.filter(
            status='paid',
            payment_date__gte=timezone.now().date() - timedelta(days=90)
        ).extra(
            select={'month': "DATE_FORMAT(payment_date, '%%Y-%%m')"}
        ).values('month').annotate(
            total=Sum('total_amount'),
            count=Count('id')
        ).order_by('month')
        
        # Generate insights
        insights = []
        
        if upcoming_payments['total_amount']:
            insights.append({
                'type': 'cash_flow',
                'title': 'Upcoming Payment Obligations',
                'description': f"€{upcoming_payments['total_amount']:,.2f} in payments due in next 30 days",
                'impact': 'high' if upcoming_payments['total_amount'] > 100000 else 'medium',
                'recommendations': [
                    'Ensure sufficient cash reserves',
                    'Consider payment scheduling optimization'
                ]
            })
            insights_generated += 1
        
        # Expense trend analysis
        if len(monthly_expenses) >= 2:
            latest_month = monthly_expenses[-1]['total']
            previous_month = monthly_expenses[-2]['total']
            change_percent = ((latest_month - previous_month) / previous_month) * 100
            
            if abs(change_percent) > 20:
                insights.append({
                    'type': 'expense_trend',
                    'title': f"Significant Expense Change: {change_percent:+.1f}%",
                    'description': f"Monthly expenses changed by {change_percent:+.1f}% compared to previous month",
                    'impact': 'high' if abs(change_percent) > 50 else 'medium',
                    'recommendations': [
                        'Review expense categories for unusual patterns',
                        'Investigate significant changes in vendor spending'
                    ]
                })
                insights_generated += 1
        
        # Store insights for dashboard
        cache.set('predictive_insights', insights, timeout=3600)  # Cache for 1 hour
        
        logger.info(f"Generated {insights_generated} predictive insights")
        return {
            "success": True,
            "insights_generated": insights_generated,
            "insights": insights
        }
        
    except Exception as e:
        logger.error(f"Predictive insights generation failed: {e}")
        return {"success": False, "error": str(e)}


@shared_task
def cleanup_old_data() -> dict:
    """Clean up old data and maintain system performance"""
    try:
        cleanup_stats = {
            'old_notifications': 0,
            'old_audit_logs': 0,
            'expired_sessions': 0
        }
        
        # Clean up old notifications (older than 90 days)
        old_notifications = Notification.objects.filter(
            created_at__lt=timezone.now() - timedelta(days=90),
            is_archived=True
        )
        cleanup_stats['old_notifications'] = old_notifications.count()
        old_notifications.delete()
        
        # Clean up old audit logs (older than 1 year)
        from .models import SecurityAuditLog
        old_audit_logs = SecurityAuditLog.objects.filter(
            timestamp__lt=timezone.now() - timedelta(days=365)
        )
        cleanup_stats['old_audit_logs'] = old_audit_logs.count()
        old_audit_logs.delete()
        
        # Clean up old AI processing results (keep for 6 months)
        old_ai_results = AIProcessingResult.objects.filter(
            created_at__lt=timezone.now() - timedelta(days=180),
            processing_status='completed'
        )
        old_ai_results.delete()
        
        logger.info(f"Cleanup completed: {cleanup_stats}")
        return {
            "success": True,
            "cleanup_stats": cleanup_stats
        }
        
    except Exception as e:
        logger.error(f"Data cleanup failed: {e}")
        return {"success": False, "error": str(e)}