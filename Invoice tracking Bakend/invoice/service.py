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
from notifications.service import NotificationService
from django.contrib.auth import get_user_model

from ai_system.service import OCRService,PredictiveAnalyticsService
from notifications.service import NotificationService

logger = logging.getLogger(__name__)
User = get_user_model()
class WorkflowAutomationService:
    """Intelligent workflow automation and routing"""
    
    def __init__(self):
        self.ocr_service = OCRService()
        self.analytics_service = PredictiveAnalyticsService()
        self.notification_service = NotificationService()
    
    def process_new_invoice(self, invoice: Invoice) -> Dict[str, Any]:
        """Complete AI processing pipeline for new invoices"""
        try:
            results = {
                'invoice_id': invoice.id,
                'processing_steps': [],
                'recommendations': [],
                'next_actions': []
            }
            
            # Step 1: OCR Processing (if file attached)
            if invoice.file:
                ocr_result = WorkflowAutomationService.process_new_invoice(invoice.file)
                results['processing_steps'].append({
                    'step': 'ocr_processing',
                    'status': 'completed',
                    'confidence': ocr_result.get('confidence', 0),
                    'data_extracted': bool(ocr_result.get('extracted_data'))
                })
                
                # Update invoice with extracted data if confidence is high
                if ocr_result.get('confidence', 0) > 0.8:
                    self._update_invoice_from_ocr(invoice, ocr_result['extracted_data'])
            
            # Step 2: Anomaly Detection
            invoice_data = self._invoice_to_dict(invoice)
            anomaly_result = self.analytics_service.detect_anomalies(invoice_data)
            results['processing_steps'].append({
                'step': 'anomaly_detection',
                'status': 'completed',
                'anomalies_found': len(anomaly_result.get('anomalies', [])),
                'risk_score': anomaly_result.get('risk_score', 0)
            })
            
            # Step 3: Priority Scoring
            priority_result = self.analytics_service.calculate_priority_score(invoice_data)
            results['processing_steps'].append({
                'step': 'priority_scoring',
                'status': 'completed',
                'priority_score': priority_result.get('priority_score', 50),
                'priority_level': priority_result.get('priority_level', 'medium')
            })
            
            # Update invoice priority
            invoice.priority = priority_result.get('priority_level', 'medium')
            invoice.save()
            
            # Step 4: Workflow Routing
            routing_result = self._determine_approval_workflow(invoice, priority_result, anomaly_result)
            results['processing_steps'].append({
                'step': 'workflow_routing',
                'status': 'completed',
                'assigned_to': routing_result.get('assigned_to'),
                'approval_required': routing_result.get('approval_required', True)
            })
            
            # Step 5: Notifications
            if anomaly_result.get('requires_review', False):
                self.notification_service.send_anomaly_alert(invoice, anomaly_result.get('anomalies', []))
            
            if routing_result.get('assigned_to'):
                try:
                    approver = User.objects.get(id=routing_result['assigned_to'])
                    self.notification_service.send_approval_request(invoice, approver)
                except User.DoesNotExist:
                    pass
            
            # Compile recommendations
            results['recommendations'].extend(priority_result.get('recommendations', []))
            results['recommendations'].extend(anomaly_result.get('recommendations', []))
            
            # Determine next actions
            if anomaly_result.get('requires_review', False):
                results['next_actions'].append('Manual review required due to anomalies')
            
            if priority_result.get('priority_level') in ['high', 'critical']:
                results['next_actions'].append('Expedited processing recommended')
            
            results['overall_status'] = 'completed'
            return results
            
        except Exception as e:
            logger.error(f"AI processing failed for invoice {invoice.id}: {e}")
            return {
                'invoice_id': invoice.id,
                'overall_status': 'failed',
                'error': str(e),
                'processing_steps': [],
                'recommendations': ['Manual processing required'],
                'next_actions': ['Review and process manually']
            }
    
    def _update_invoice_from_ocr(self, invoice: Invoice, extracted_data: Dict[str, Any]):
        """Update invoice fields from OCR extracted data"""
        try:
            updated = False
            
            # Update invoice number if not set
            if not invoice.number and extracted_data.get('invoice_number'):
                invoice.number = extracted_data['invoice_number']
                updated = True
            
            # Update amount if not set
            if not invoice.total_amount and extracted_data.get('total_amount'):
                try:
                    amount_str = extracted_data['total_amount'].replace(',', '')
                    invoice.total_amount = Decimal(amount_str)
                    updated = True
                except (ValueError, TypeError):
                    pass
            
            # Update dates if not set
            if not invoice.invoice_date and extracted_data.get('date'):
                try:
                    invoice.invoice_date = datetime.strptime(extracted_data['date'], '%m/%d/%Y').date()
                    updated = True
                except ValueError:
                    pass
            
            if updated:
                invoice.save()
                
        except Exception as e:
            logger.error(f"Failed to update invoice from OCR data: {e}")
    
    def _determine_approval_workflow(self, invoice: Invoice, priority_result: Dict, anomaly_result: Dict) -> Dict[str, Any]:
        """Determine appropriate approval workflow"""
        try:
            # Get service configuration
            from .models import Service
            try:
                service = Service.objects.get(id=invoice.current_service)
            except Service.DoesNotExist:
                service = None
            
            # Determine if auto-approval is possible
            can_auto_approve = (
                service and 
                service.can_approve_invoices and
                invoice.total_amount <= (service.approval_threshold or 0) and
                anomaly_result.get('risk_score', 0) < 30 and
                priority_result.get('priority_level') in ['low', 'medium']
            )
            
            if can_auto_approve:
                # Auto-approve
                invoice.status = 'approved'
                invoice.approved_at = timezone.now()
                invoice.save()
                
                return {
                    'auto_approved': True,
                    'approval_required': False,
                    'reasoning': 'Low risk, within service threshold'
                }
            
            # Find appropriate approver
            approver = self._find_best_approver(invoice, priority_result)
            
            if approver:
                invoice.assigned_to = approver.id
                invoice.save()
                
                return {
                    'auto_approved': False,
                    'approval_required': True,
                    'assigned_to': approver.id,
                    'approver_name': approver.name,
                    'reasoning': 'Manual approval required'
                }
            
            return {
                'auto_approved': False,
                'approval_required': True,
                'assigned_to': None,
                'reasoning': 'No suitable approver found'
            }
            
        except Exception as e:
            logger.error(f"Workflow determination failed: {e}")
            return {
                'auto_approved': False,
                'approval_required': True,
                'assigned_to': None,
                'error': str(e)
            }
    
    def _find_best_approver(self, invoice: Invoice, priority_result: Dict) -> Optional[User]:
        """Find the best approver for an invoice"""
        try:
            # For high priority or high amounts, assign to managers
            if (priority_result.get('priority_level') in ['high', 'critical'] or 
                invoice.total_amount > 5000):
                
                managers = User.objects.filter(
                    role__in=['manager', 'admin'],
                    service_id=invoice.current_service,
                    is_active=True
                ).order_by('last_login')
                
                if managers.exists():
                    return managers.first()
            
            # For regular invoices, assign to any approver in the service
            approvers = User.objects.filter(
                service_id=invoice.current_service,
                role__in=['manager', 'admin', 'approver'],
                is_active=True
            ).order_by('last_login')
            
            return approvers.first() if approvers.exists() else None
            
        except Exception as e:
            logger.error(f"Failed to find approver: {e}")
            return None
    
    def _invoice_to_dict(self, invoice: Invoice) -> Dict[str, Any]:
        """Convert invoice model to dictionary for AI processing"""
        return {
            'id': invoice.id,
            'number': invoice.number,
            'vendor_name': invoice.vendor_name,
            'total_amount': float(invoice.total_amount),
            'currency': invoice.currency,
            'invoice_date': invoice.invoice_date.isoformat() if invoice.invoice_date else None,
            'due_date': invoice.due_date.isoformat() if invoice.due_date else None,
            'current_service': invoice.current_service,
            'status': invoice.status,
            'priority': invoice.priority,
            'created_at': invoice.created_at.isoformat()
        }

workflow_service = WorkflowAutomationService()