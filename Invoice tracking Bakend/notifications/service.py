import logging
import json
from typing import Dict, List, Optional, Tuple, Any
from decimal import Decimal
from datetime import datetime, timedelta
from django.conf import settings
from django.core.cache import cache
from django.db.models import Q, Avg, Count, Sum
from django.utils import timezone
import cv2
import numpy as np
import pytesseract
from PIL import Image
import requests
from sklearn.ensemble import IsolationForest
from sklearn.preprocessing import StandardScaler
import joblib
import os

from invoice.models import Invoice, InvoiceTemplate
from django.contrib.auth import get_user_model


logger = logging.getLogger(__name__)
User = get_user_model()


class NotificationService:
    """Advanced notification service with multiple channels"""
    
    def __init__(self):
        self.channels = ['email', 'in_app']  # Add 'sms' when configured
    
    def send_due_date_reminder(self, invoice: Invoice, days_before: int = 3):
        """Send due date reminder notification"""
        try:
            # Check if reminder already sent
            cache_key = f"reminder_sent_{invoice.id}_{days_before}"
            if cache.get(cache_key):
                return
            
            # Get users to notify
            users_to_notify = self._get_notification_recipients(invoice)
            
            for user in users_to_notify:
                self._send_notification(
                    user=user,
                    title=f"Invoice Due in {days_before} Days",
                    message=f"Invoice {invoice.number} from {invoice.vendor_name} "
                           f"(€{invoice.total_amount:,.2f}) is due on {invoice.due_date}",
                    notification_type='reminder',
                    related_invoice=invoice,
                    priority='medium' if days_before > 1 else 'high'
                )
            
            # Mark reminder as sent
            cache.set(cache_key, True, timeout=86400)  # 24 hours
            
        except Exception as e:
            logger.error(f"Failed to send due date reminder for invoice {invoice.id}: {e}")
    
    def send_anomaly_alert(self, invoice: Invoice, anomalies: list[Dict[str, Any]]):
        """Send anomaly detection alert"""
        try:
            # Get managers and admins
            managers = User.objects.filter(
                role__in=['admin', 'manager'],
                is_active=True
            )
            
            high_risk_anomalies = [a for a in anomalies if a.get('severity') == 'high']
            
            if high_risk_anomalies:
                for manager in managers:
                    self._send_notification(
                        user=manager,
                        title=f"High Risk Invoice Detected",
                        message=f"Invoice {invoice.number} has {len(high_risk_anomalies)} "
                               f"high-risk anomalies requiring review",
                        notification_type='warning',
                        related_invoice=invoice,
                        priority='high'
                    )
                    
        except Exception as e:
            logger.error(f"Failed to send anomaly alert for invoice {invoice.id}: {e}")
    
    def send_approval_request(self, invoice: Invoice, approver: User):
        """Send approval request notification"""
        try:
            self._send_notification(
                user=approver,
                title="Invoice Approval Required",
                message=f"Invoice {invoice.number} from {invoice.vendor_name} "
                       f"(€{invoice.total_amount:,.2f}) requires your approval",
                notification_type='info',
                related_invoice=invoice,
                priority='medium'
            )
        except Exception as e:
            logger.error(f"Failed to send approval request for invoice {invoice.id}: {e}")
    
    def _get_notification_recipients(self, invoice: Invoice) -> List[User]:
        """Get list of users who should receive notifications for this invoice"""
        recipients = []
        
        # Invoice creator
        if invoice.created_by:
            try:
                creator = User.objects.get(id=invoice.created_by)
                recipients.append(creator)
            except User.DoesNotExist:
                pass
        
        # Assigned user
        if invoice.assigned_to:
            try:
                assignee = User.objects.get(id=invoice.assigned_to)
                recipients.append(assignee)
            except User.DoesNotExist:
                pass
        
        # Service managers
        service_managers = User.objects.filter(
            service_id=invoice.current_service,
            role__in=['manager', 'admin'],
            is_active=True
        )
        recipients.extend(service_managers)
        
        return list(set(recipients))  # Remove duplicates
    
    def _send_notification(self, user: User, title: str, message: str, 
                          notification_type: str, related_invoice: Invoice = None,
                          priority: str = 'medium'):
        """Send notification through configured channels"""
        from .models import Notification
        
        # Create in-app notification
        notification = Notification.objects.create(
            user=user,
            type=notification_type,
            title=title,
            message=message,
            related_entity_type='invoice',
            related_entity_id=related_invoice.id if related_invoice else None,
            priority=priority
        )
        
        # Send email if configured
        if 'email' in self.channels:
            self._send_email_notification(user, title, message, related_invoice)
        
        # TODO: Add SMS notification when configured
        # if 'sms' in self.channels:
        #     self._send_sms_notification(user, title, message)
        
        return notification
    
    def _send_email_notification(self, user: User, title: str, message: str, invoice: Invoice = None):
        """Send email notification"""
        try:
            from django.core.mail import send_mail
            from django.template.loader import render_to_string
            
            context = {
                'user': user,
                'title': title,
                'message': message,
                'invoice': invoice,
                'app_url': getattr(settings, 'FRONTEND_URL', 'https://default-frontend-url.com')
            }
            
            html_message = render_to_string('emails/notification.html', context)
            
            send_mail(
                subject=title,
                message=message,
                from_email=settings.DEFAULT_FROM_EMAIL,
                recipient_list=[user.email],
                html_message=html_message,
                fail_silently=True
            )
            
        except Exception as e:
            logger.error(f"Failed to send email notification to {user.email}: {e}")

notification_service = NotificationService()
