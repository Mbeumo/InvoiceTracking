from celery import shared_task
from django.db import transaction, models
from django.db.models import Count, Avg
from django.core.mail import send_mail
from django.conf import settings
from django.utils import timezone
from datetime import datetime, timedelta
from decimal import Decimal, InvalidOperation
import logging

from invoice.models import Invoice

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
                logging.error(f"Failed to send reminder for invoice {invoice.id}: {e}")
        
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
                logging.error(f"Failed to send overdue notice for invoice {invoice.id}: {e}")
        
        logging.info(f"Sent {sent_count} due date reminders")
        return {
            "success": True,
            "upcoming_count": upcoming_invoices.count(),
            "overdue_count": overdue_invoices.count(),
            "sent_count": sent_count
        }
        
    except Exception as e:
        logging.error(f"Due reminder task failed: {e}")
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
                #TODO Check 
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
                #TODO Check
                notification_service.send_due_date_reminder(invoice, -days_overdue)
                sent_count += 1
        
        logging.info(f"Sent {sent_count} automated reminders")
        return {
            "success": True,
            "reminders_sent": sent_count,
            "upcoming_count": upcoming_invoices.count(),
            "overdue_count": overdue_invoices.count()
        }
        
    except Exception as e:
        logging.error(f"Automated reminders task failed: {e}")
        return {"success": False, "error": str(e)}
