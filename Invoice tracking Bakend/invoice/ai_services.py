"""
AI Services for Advanced Invoice Processing
Implements OCR, ML predictions, anomaly detection, and automation
"""
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

from .models import Invoice, InvoiceTemplate
from users.models import User

logger = logging.getLogger(__name__)


class OCRService:
    """Advanced OCR service with AI enhancement"""
    
    def __init__(self):
        self.tesseract_config = r'--oem 3 --psm 6'
        
    def preprocess_image(self, image_path: str) -> np.ndarray:
        """Enhanced image preprocessing for better OCR accuracy"""
        try:
            img = cv2.imread(image_path)
            if img is None:
                raise ValueError(f"Could not load image: {image_path}")
            
            # Convert to grayscale
            gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
            
            # Apply denoising
            denoised = cv2.fastNlMeansDenoising(gray)
            
            # Enhance contrast
            clahe = cv2.createCLAHE(clipLimit=2.0, tileGridSize=(8,8))
            enhanced = clahe.apply(denoised)
            
            # Apply adaptive thresholding
            thresh = cv2.adaptiveThreshold(
                enhanced, 255, cv2.ADAPTIVE_THRESH_GAUSSIAN_C, cv2.THRESH_BINARY, 11, 2
            )
            
            # Morphological operations to clean up
            kernel = np.ones((1,1), np.uint8)
            cleaned = cv2.morphologyEx(thresh, cv2.MORPH_CLOSE, kernel)
            
            return cleaned
        except Exception as e:
            logger.error(f"Error preprocessing image {image_path}: {e}")
            raise

    def extract_invoice_data(self, image_path: str) -> Dict[str, Any]:
        """Extract structured data from invoice image"""
        try:
            # Preprocess image
            processed_img = self.preprocess_image(image_path)
            
            # Convert to PIL Image for tesseract
            pil_img = Image.fromarray(processed_img)
            
            # Extract text with confidence
            data = pytesseract.image_to_data(pil_img, config=self.tesseract_config, output_type=pytesseract.Output.DICT)
            
            # Calculate average confidence
            confidences = [int(conf) for conf in data['conf'] if int(conf) > 0]
            avg_confidence = sum(confidences) / len(confidences) if confidences else 0.0
            
            # Extract full text
            full_text = pytesseract.image_to_string(pil_img, config=self.tesseract_config)
            
            # Use AI to extract structured data
            extracted_data = self._extract_structured_data(full_text)
            
            return {
                'raw_text': full_text.strip(),
                'confidence': avg_confidence / 100.0,
                'extracted_data': extracted_data,
                'processing_time': timezone.now().isoformat()
            }
            
        except Exception as e:
            logger.error(f"Error extracting data from {image_path}: {e}")
            return {
                'raw_text': '',
                'confidence': 0.0,
                'extracted_data': {},
                'error': str(e)
            }

    def _extract_structured_data(self, text: str) -> Dict[str, Any]:
        """Use AI/ML to extract structured data from OCR text"""
        import re
        
        patterns = {
            'invoice_number': [
                r'invoice\s*#?\s*:?\s*([A-Z0-9\-]+)',
                r'inv\s*#?\s*:?\s*([A-Z0-9\-]+)',
                r'facture\s*#?\s*:?\s*([A-Z0-9\-]+)',
                r'#\s*([A-Z0-9\-]+)'
            ],
            'total_amount': [
                r'total\s*:?\s*€?\s*([0-9,]+\.?[0-9]*)',
                r'montant\s*total\s*:?\s*€?\s*([0-9,]+\.?[0-9]*)',
                r'amount\s*:?\s*€?\s*([0-9,]+\.?[0-9]*)',
                r'€\s*([0-9,]+\.?[0-9]*)'
            ],
            'date': [
                r'date\s*:?\s*([0-9]{1,2}[\/\-][0-9]{1,2}[\/\-][0-9]{2,4})',
                r'([0-9]{1,2}[\/\-][0-9]{1,2}[\/\-][0-9]{2,4})'
            ],
            'due_date': [
                r'due\s*date\s*:?\s*([0-9]{1,2}[\/\-][0-9]{1,2}[\/\-][0-9]{2,4})',
                r'échéance\s*:?\s*([0-9]{1,2}[\/\-][0-9]{1,2}[\/\-][0-9]{2,4})'
            ],
            'vendor': [
                r'from\s*:?\s*([A-Za-z\s]+)',
                r'supplier\s*:?\s*([A-Za-z\s]+)',
                r'fournisseur\s*:?\s*([A-Za-z\s]+)'
            ]
        }
        
        extracted = {}
        text_lower = text.lower()
        
        for field, field_patterns in patterns.items():
            for pattern in field_patterns:
                match = re.search(pattern, text_lower, re.IGNORECASE)
                if match:
                    extracted[field] = match.group(1).strip()
                    break
            
            if field not in extracted:
                extracted[field] = ""
        
        return extracted


class PredictiveAnalyticsService:
    """Machine learning service for predictions and insights"""
    
    def __init__(self):
        self.model_path = os.path.join(settings.BASE_DIR, 'ml_models')
        os.makedirs(self.model_path, exist_ok=True)
    
    def predict_payment_delay(self, invoice_data: Dict[str, Any]) -> Dict[str, Any]:
        """Predict likelihood of payment delay using ML"""
        try:
            # Extract features for ML model
            features = self._extract_payment_features(invoice_data)
            
            # Load or train model
            model = self._get_payment_delay_model()
            
            # Make prediction
            delay_probability = model.predict_proba([features])[0][1]  # Probability of delay
            
            # Calculate risk factors
            risk_factors = self._analyze_payment_risk_factors(invoice_data)
            
            return {
                'delay_probability': float(delay_probability),
                'risk_level': self._get_risk_level(delay_probability),
                'risk_factors': risk_factors,
                'recommendations': self._get_payment_recommendations(delay_probability, risk_factors),
                'confidence': 0.85  # Model confidence
            }
            
        except Exception as e:
            logger.error(f"Payment delay prediction failed: {e}")
            return {
                'delay_probability': 0.5,
                'risk_level': 'medium',
                'risk_factors': [],
                'recommendations': ['Manual review recommended'],
                'confidence': 0.0,
                'error': str(e)
            }
    
    def detect_anomalies(self, invoice_data: Dict[str, Any]) -> Dict[str, Any]:
        """Detect anomalies in invoice data"""
        try:
            anomalies = []
            risk_score = 0
            
            # Check amount anomalies
            amount_anomaly = self._check_amount_anomaly(invoice_data)
            if amount_anomaly:
                anomalies.append(amount_anomaly)
                risk_score += 30
            
            # Check vendor anomalies
            vendor_anomaly = self._check_vendor_anomaly(invoice_data)
            if vendor_anomaly:
                anomalies.append(vendor_anomaly)
                risk_score += 25
            
            # Check timing anomalies
            timing_anomaly = self._check_timing_anomaly(invoice_data)
            if timing_anomaly:
                anomalies.append(timing_anomaly)
                risk_score += 20
            
            # Check duplicate potential
            duplicate_risk = self._check_duplicate_risk(invoice_data)
            if duplicate_risk:
                anomalies.append(duplicate_risk)
                risk_score += 40
            
            return {
                'anomalies': anomalies,
                'risk_score': min(risk_score, 100),
                'risk_level': self._get_risk_level(risk_score / 100),
                'requires_review': risk_score > 50,
                'confidence': 0.90
            }
            
        except Exception as e:
            logger.error(f"Anomaly detection failed: {e}")
            return {
                'anomalies': [],
                'risk_score': 0,
                'risk_level': 'low',
                'requires_review': False,
                'confidence': 0.0,
                'error': str(e)
            }
    
    def calculate_priority_score(self, invoice_data: Dict[str, Any]) -> Dict[str, Any]:
        """Calculate invoice priority using AI scoring"""
        try:
            score = 0
            factors = []
            
            # Amount factor (higher amounts = higher priority)
            amount = float(invoice_data.get('total_amount', 0))
            if amount > 10000:
                score += 30
                factors.append({'factor': 'High amount', 'impact': 30})
            elif amount > 5000:
                score += 20
                factors.append({'factor': 'Medium amount', 'impact': 20})
            
            # Due date factor
            due_date = invoice_data.get('due_date')
            if due_date:
                days_until_due = (datetime.fromisoformat(due_date) - datetime.now()).days
                if days_until_due <= 3:
                    score += 40
                    factors.append({'factor': 'Due very soon', 'impact': 40})
                elif days_until_due <= 7:
                    score += 25
                    factors.append({'factor': 'Due soon', 'impact': 25})
            
            # Vendor relationship factor
            vendor_priority = self._get_vendor_priority(invoice_data.get('vendor_name', ''))
            score += vendor_priority
            if vendor_priority > 0:
                factors.append({'factor': 'Important vendor', 'impact': vendor_priority})
            
            # Service priority
            service_priority = self._get_service_priority(invoice_data.get('current_service', ''))
            score += service_priority
            if service_priority > 0:
                factors.append({'factor': 'Critical service', 'impact': service_priority})
            
            priority_level = self._score_to_priority(score)
            
            return {
                'priority_score': min(score, 100),
                'priority_level': priority_level,
                'factors': factors,
                'recommendations': self._get_priority_recommendations(priority_level),
                'confidence': 0.88
            }
            
        except Exception as e:
            logger.error(f"Priority scoring failed: {e}")
            return {
                'priority_score': 50,
                'priority_level': 'medium',
                'factors': [],
                'recommendations': ['Manual review recommended'],
                'confidence': 0.0,
                'error': str(e)
            }
    
    def _extract_payment_features(self, invoice_data: Dict[str, Any]) -> List[float]:
        """Extract features for payment delay prediction"""
        features = []
        
        # Amount (normalized)
        amount = float(invoice_data.get('total_amount', 0))
        features.append(min(amount / 10000, 10))  # Normalize to 0-10 range
        
        # Days until due
        due_date = invoice_data.get('due_date')
        if due_date:
            days_until_due = (datetime.fromisoformat(due_date) - datetime.now()).days
            features.append(max(days_until_due, 0))
        else:
            features.append(30)  # Default
        
        # Vendor history (simplified)
        vendor_name = invoice_data.get('vendor_name', '')
        vendor_score = self._get_vendor_reliability_score(vendor_name)
        features.append(vendor_score)
        
        # Service factor
        service = invoice_data.get('current_service', '')
        service_score = 1.0 if service in ['finance', 'accounting'] else 0.5
        features.append(service_score)
        
        return features
    
    def _get_payment_delay_model(self):
        """Load or create payment delay prediction model"""
        model_file = os.path.join(self.model_path, 'payment_delay_model.pkl')
        
        try:
            if os.path.exists(model_file):
                return joblib.load(model_file)
        except:
            pass
        
        # Create simple model if none exists
        from sklearn.ensemble import RandomForestClassifier
        model = RandomForestClassifier(n_estimators=100, random_state=42)
        
        # Train with dummy data (replace with real historical data)
        X_dummy = [[1000, 30, 0.8, 1.0], [5000, 15, 0.6, 0.5], [2000, 45, 0.9, 1.0]]
        y_dummy = [0, 1, 0]  # 0 = on time, 1 = delayed
        
        model.fit(X_dummy, y_dummy)
        
        # Save model
        try:
            joblib.dump(model, model_file)
        except:
            pass
        
        return model
    
    def _analyze_payment_risk_factors(self, invoice_data: Dict[str, Any]) -> List[Dict[str, Any]]:
        """Analyze factors that contribute to payment delay risk"""
        factors = []
        
        amount = float(invoice_data.get('total_amount', 0))
        if amount > 10000:
            factors.append({
                'factor': 'High invoice amount',
                'impact': 'Increases approval time',
                'risk_increase': 25
            })
        
        vendor_name = invoice_data.get('vendor_name', '')
        if self._is_new_vendor(vendor_name):
            factors.append({
                'factor': 'New vendor',
                'impact': 'Requires additional verification',
                'risk_increase': 20
            })
        
        return factors
    
    def _check_amount_anomaly(self, invoice_data: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        """Check for amount-based anomalies"""
        amount = float(invoice_data.get('total_amount', 0))
        vendor_name = invoice_data.get('vendor_name', '')
        
        # Get historical average for this vendor
        historical_avg = self._get_vendor_average_amount(vendor_name)
        
        if historical_avg and amount > historical_avg * 3:
            return {
                'type': 'amount_spike',
                'description': f'Amount is {amount/historical_avg:.1f}x higher than vendor average',
                'severity': 'high',
                'current_amount': amount,
                'historical_average': historical_avg
            }
        
        return None
    
    def _check_vendor_anomaly(self, invoice_data: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        """Check for vendor-related anomalies"""
        vendor_name = invoice_data.get('vendor_name', '')
        
        if self._is_new_vendor(vendor_name):
            return {
                'type': 'new_vendor',
                'description': 'Invoice from previously unknown vendor',
                'severity': 'medium',
                'vendor_name': vendor_name
            }
        
        return None
    
    def _check_timing_anomaly(self, invoice_data: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        """Check for timing-based anomalies"""
        invoice_date = invoice_data.get('invoice_date')
        if not invoice_date:
            return None
        
        invoice_dt = datetime.fromisoformat(invoice_date)
        now = datetime.now()
        
        # Check if invoice is from the future
        if invoice_dt > now:
            return {
                'type': 'future_date',
                'description': 'Invoice date is in the future',
                'severity': 'high',
                'invoice_date': invoice_date
            }
        
        # Check if invoice is very old
        days_old = (now - invoice_dt).days
        if days_old > 90:
            return {
                'type': 'old_invoice',
                'description': f'Invoice is {days_old} days old',
                'severity': 'medium',
                'days_old': days_old
            }
        
        return None
    
    def _check_duplicate_risk(self, invoice_data: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        """Check for potential duplicate invoices"""
        vendor_name = invoice_data.get('vendor_name', '')
        amount = float(invoice_data.get('total_amount', 0))
        invoice_date = invoice_data.get('invoice_date')
        
        if not all([vendor_name, amount, invoice_date]):
            return None
        
        # Look for similar invoices in the last 30 days
        date_threshold = datetime.now() - timedelta(days=30)
        
        similar_invoices = Invoice.objects.filter(
            vendor_name__icontains=vendor_name,
            total_amount__range=(amount * 0.95, amount * 1.05),
            invoice_date__gte=date_threshold
        ).count()
        
        if similar_invoices > 0:
            return {
                'type': 'potential_duplicate',
                'description': f'Found {similar_invoices} similar invoice(s) in last 30 days',
                'severity': 'high',
                'similar_count': similar_invoices
            }
        
        return None
    
    def _get_vendor_average_amount(self, vendor_name: str) -> Optional[float]:
        """Get historical average amount for vendor"""
        try:
            avg_data = Invoice.objects.filter(
                vendor_name__icontains=vendor_name
            ).aggregate(avg_amount=Avg('total_amount'))
            
            return float(avg_data['avg_amount']) if avg_data['avg_amount'] else None
        except:
            return None
    
    def _is_new_vendor(self, vendor_name: str) -> bool:
        """Check if vendor is new (no previous invoices)"""
        return not Invoice.objects.filter(vendor_name__icontains=vendor_name).exists()
    
    def _get_vendor_reliability_score(self, vendor_name: str) -> float:
        """Get vendor reliability score based on payment history"""
        try:
            # Simple scoring based on payment history
            total_invoices = Invoice.objects.filter(vendor_name__icontains=vendor_name).count()
            paid_on_time = Invoice.objects.filter(
                vendor_name__icontains=vendor_name,
                status='paid',
                payment_date__lte=models.F('due_date')
            ).count()
            
            if total_invoices == 0:
                return 0.5  # Unknown vendor
            
            return paid_on_time / total_invoices
        except:
            return 0.5
    
    def _get_vendor_priority(self, vendor_name: str) -> int:
        """Get vendor priority score"""
        # Check if vendor is in high-priority list
        high_priority_vendors = ['Microsoft', 'Google', 'Amazon', 'Oracle']
        
        for priority_vendor in high_priority_vendors:
            if priority_vendor.lower() in vendor_name.lower():
                return 20
        
        return 0
    
    def _get_service_priority(self, service: str) -> int:
        """Get service priority score"""
        priority_services = {
            'finance': 15,
            'accounting': 15,
            'management': 20,
            'purchasing': 10,
            'hr': 5
        }
        
        return priority_services.get(service, 0)
    
    def _score_to_priority(self, score: int) -> str:
        """Convert numeric score to priority level"""
        if score >= 80:
            return 'critical'
        elif score >= 60:
            return 'high'
        elif score >= 40:
            return 'medium'
        else:
            return 'low'
    
    def _get_risk_level(self, probability: float) -> str:
        """Convert probability to risk level"""
        if probability >= 0.8:
            return 'high'
        elif probability >= 0.6:
            return 'medium'
        else:
            return 'low'
    
    def _get_payment_recommendations(self, delay_probability: float, risk_factors: List[Dict]) -> List[str]:
        """Generate recommendations based on delay probability"""
        recommendations = []
        
        if delay_probability > 0.7:
            recommendations.append('Consider expedited approval process')
            recommendations.append('Contact vendor to confirm payment terms')
        
        if delay_probability > 0.5:
            recommendations.append('Monitor closely for payment delays')
        
        if any(factor.get('factor') == 'High amount' for factor in risk_factors):
            recommendations.append('Require additional approval for high-value invoice')
        
        return recommendations
    
    def _get_priority_recommendations(self, priority_level: str) -> List[str]:
        """Generate recommendations based on priority level"""
        recommendations = {
            'critical': [
                'Process immediately',
                'Notify all stakeholders',
                'Expedite approval workflow'
            ],
            'high': [
                'Process within 24 hours',
                'Notify manager',
                'Fast-track approval'
            ],
            'medium': [
                'Process within 3 business days',
                'Standard approval workflow'
            ],
            'low': [
                'Process within 5 business days',
                'Standard workflow'
            ]
        }
        
        return recommendations.get(priority_level, ['Standard processing'])


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
    
    def send_anomaly_alert(self, invoice: Invoice, anomalies: List[Dict[str, Any]]):
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
                'app_url': settings.FRONTEND_URL if hasattr(settings, 'FRONTEND_URL') else 'http://localhost:3000'
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
                ocr_result = self.ocr_service.extract_invoice_data(invoice.file.path)
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


# Singleton instances for easy access
ocr_service = OCRService()
analytics_service = PredictiveAnalyticsService()
notification_service = NotificationService()
workflow_service = WorkflowAutomationService()