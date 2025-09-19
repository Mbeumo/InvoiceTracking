from celery import shared_task
from django.db import transaction, models
from django.db.models import Count, Avg
from django.core.mail import send_mail
from django.conf import settings
from django.utils import timezone
from datetime import datetime, timedelta
from decimal import Decimal, InvalidOperation
import logging
from django.contib.auth import get_user_model

from .models import Invoice, InvoiceTemplate
from notifications.service import notification_service
#analytic and workflow service
#from ai_system.service import PredictiveAnalyticsService

from .models import Notification, AIProcessingResult, WorkflowRule,InvoiceHistory


logger = logging.getLogger(__name__)
User = get_user_model()
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
            total=sum('total_amount'),
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