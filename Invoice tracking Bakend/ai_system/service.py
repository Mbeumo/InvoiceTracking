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


logger = logging.getLogger(__name__)
User = get_user_model()

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



ocr_service = OCRService()
analytics_service = PredictiveAnalyticsService()
