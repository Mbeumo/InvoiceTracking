from __future__ import annotations

import re
from dataclasses import dataclass
from typing import Dict, List, Optional, Tuple
from decimal import Decimal
from datetime import datetime
import cv2
import numpy as np
import pytesseract
from PIL import Image
import logging

from .types import OcrResult

logger = logging.getLogger(__name__)


@dataclass
class TemplateHint:
    template_id: int
    name: str
    detection_keywords: List[str]
    rois: Dict[str, Dict[str, float]]  # { field: {x,y,w,h} in 0..1 }


class OcrEngine:
    def __init__(self):
        """Initialize OCR engine with Tesseract configuration."""
        self.tesseract_config = r'--oem 3 --psm 6'
        
    def preprocess_image(self, image_path: str) -> np.ndarray:
        """Preprocess image for better OCR accuracy."""
        try:
            # Load image
            img = cv2.imread(image_path)
            if img is None:
                raise ValueError(f"Could not load image: {image_path}")
            
            # Convert to grayscale
            gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
            
            # Apply denoising
            denoised = cv2.fastNlMeansDenoising(gray)
            
            # Apply adaptive thresholding
            thresh = cv2.adaptiveThreshold(
                denoised, 255, cv2.ADAPTIVE_THRESH_GAUSSIAN_C, cv2.THRESH_BINARY, 11, 2
            )
            
            return thresh
        except Exception as e:
            logger.error(f"Error preprocessing image {image_path}: {e}")
            raise

    def extract_text_from_image(self, image_path: str) -> Tuple[str, float]:
        """Extract text from image using OCR."""
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
            
            # Extract text
            text = pytesseract.image_to_string(pil_img, config=self.tesseract_config)
            
            return text.strip(), avg_confidence / 100.0  # Convert to 0-1 range
            
        except Exception as e:
            logger.error(f"Error extracting text from {image_path}: {e}")
            return "", 0.0

    def detect_template(self, full_text: str, candidates: List[TemplateHint]) -> Optional[TemplateHint]:
        """Detect the best matching template based on keywords."""
        best = None
        best_score = 0
        lowered = full_text.lower()
        
        for template in candidates:
            score = 0
            for keyword in template.detection_keywords:
                if keyword.lower() in lowered:
                    # Weight longer keywords more heavily
                    score += len(keyword.split())
            
            if score > best_score:
                best = template
                best_score = score
                
        return best if best_score > 0 else None

    def extract_fields_from_rois(self, image_path: str, rois: Dict[str, Dict[str, float]]) -> Dict[str, str]:
        """Extract specific fields from regions of interest in the image."""
        try:
            img = cv2.imread(image_path)
            if img is None:
                return {field: "" for field in rois.keys()}
            
            height, width = img.shape[:2]
            extracted_fields = {}
            
            for field_name, roi in rois.items():
                try:
                    # Convert percentage-based ROI to pixel coordinates
                    x = int(roi['x'] * width)
                    y = int(roi['y'] * height)
                    w = int(roi['w'] * width)
                    h = int(roi['h'] * height)
                    
                    # Crop the ROI
                    cropped = img[y:y+h, x:x+w]
                    
                    # Preprocess the cropped region
                    gray = cv2.cvtColor(cropped, cv2.COLOR_BGR2GRAY)
                    thresh = cv2.adaptiveThreshold(gray, 255, cv2.ADAPTIVE_THRESH_GAUSSIAN_C, cv2.THRESH_BINARY, 11, 2)
                    
                    # Extract text from ROI
                    pil_crop = Image.fromarray(thresh)
                    text = pytesseract.image_to_string(pil_crop, config=self.tesseract_config).strip()
                    
                    extracted_fields[field_name] = text
                    
                except Exception as e:
                    logger.warning(f"Error extracting field {field_name}: {e}")
                    extracted_fields[field_name] = ""
            
            return extracted_fields
            
        except Exception as e:
            logger.error(f"Error processing ROIs for {image_path}: {e}")
            return {field: "" for field in rois.keys()}

    def extract_invoice_data(self, text: str) -> Dict[str, str]:
        """Extract common invoice fields using regex patterns."""
        patterns = {
            'invoice_number': [
                r'invoice\s*#?\s*:?\s*([A-Z0-9\-]+)',
                r'inv\s*#?\s*:?\s*([A-Z0-9\-]+)',
                r'#\s*([A-Z0-9\-]+)'
            ],
            'amount': [
                r'total\s*:?\s*\$?([0-9,]+\.?[0-9]*)',
                r'amount\s*:?\s*\$?([0-9,]+\.?[0-9]*)',
                r'\$([0-9,]+\.?[0-9]*)'
            ],
            'date': [
                r'date\s*:?\s*([0-9]{1,2}[\/\-][0-9]{1,2}[\/\-][0-9]{2,4})',
                r'([0-9]{1,2}[\/\-][0-9]{1,2}[\/\-][0-9]{2,4})'
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

    def run(self, image_path: str, templates: List[TemplateHint]) -> OcrResult:
        """Main OCR processing pipeline."""
        try:
            # Extract text from image
            full_text, confidence = self.extract_text_from_image(image_path)
            
            if not full_text:
                return OcrResult(template_id=None, fields={}, confidence=0.0, raw_text="")
            
            # Try template matching
            matched_template = self.detect_template(full_text, templates)
            
            fields = {}
            if matched_template and matched_template.rois:
                # Use template ROIs for field extraction
                fields = self.extract_fields_from_rois(image_path, matched_template.rois)
            else:
                # Fallback to regex-based extraction
                fields = self.extract_invoice_data(full_text)
            
            return OcrResult(
                template_id=matched_template.template_id if matched_template else None,
                fields=fields,
                confidence=confidence,
                raw_text=full_text
            )
            
        except Exception as e:
            logger.error(f"OCR processing failed for {image_path}: {e}")
            return OcrResult(template_id=None, fields={}, confidence=0.0, raw_text="")