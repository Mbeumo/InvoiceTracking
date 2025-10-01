import pytesseract
from PIL import Image
import re
import io
from pdf2image import convert_from_bytes

def perform_ocr_and_extract_data(image_file):
    try:
        # Open the image using Pillow
        image = Image.open(image_file)

        # Perform OCR
        raw_text = pytesseract.image_to_string(image)
        # Get OCR data including confidence scores
        ocr_data = pytesseract.image_to_data(image, output_type=pytesseract.Output.DICT)

        # Initialize extracted data and confidence
        extracted_data = {
            'vendor_name': None,
            'invoice_date': None,
            'due_date': None,
            'total_amount': None,
            'currency': None,
            'number': None,
        }
        ocr_confidence = {}

        # Simple parsing logic (can be enhanced with more sophisticated NLP/regex)
        # Vendor Name (very basic, usually requires more context or a list of known vendors)
        # For now, let's try to find a line that looks like a company name
        lines = raw_text.split('\n')
        if lines:
            # Heuristic: first non-empty line might be vendor name
            for line in lines:
                if line.strip():
                    extracted_data['vendor_name'] = line.strip()
                    break

        # Invoice Date (DD/MM/YYYY, MM/DD/YYYY, YYYY-MM-DD)
        date_patterns = [
            r'\b\d{1,2}[-/.]\d{1,2}[-/.]\d{2,4}\b',  # DD/MM/YYYY or MM/DD/YYYY
            r'\b\d{4}[-/.]\d{1,2}[-/.]\d{1,2}\b'   # YYYY-MM-DD
        ]
        for pattern in date_patterns:
            match = re.search(pattern, raw_text)
            if match:
                extracted_data['invoice_date'] = match.group(0)
                break

        # Total Amount (look for patterns like $123.45, 123.45 EUR, TOTAL: 123.45)
        # First, try to find a total amount with a clear keyword prefix
        total_amount_pattern_with_keyword = r'(?:TOTAL|AMOUNT DUE|BALANCE DUE|GRAND TOTAL|Total Amount)[\s:]*(?:([A-Z]{2,4})\s*)?(\$?\d{1,3}(?:[.,]\d{3})*(?:[.,]\d{2}))\b'
        total_amount_pattern_generic = r'(\$?\d{1,3}(?:[.,]\d{3})*(?:[.,]\d{2}))\s*(?:([A-Z]{2,4}))?\b'

        amount_str = None
        currency_str = None

        # Try with keyword first
        match = re.search(total_amount_pattern_with_keyword, raw_text, re.IGNORECASE)
        if match:
            currency_str = match.group(1) if match.group(1) else None
            amount_str = match.group(2)
        else:
            # If not found with keyword, try generic pattern
            match = re.search(total_amount_pattern_generic, raw_text, re.IGNORECASE)
            if match:
                amount_str = match.group(1)
                currency_str = match.group(2) if match.group(2) else None

        if amount_str:
            amount_str = amount_str.replace("$", "").replace(",", "") # Remove dollar sign and thousands comma
            try:
                extracted_data["total_amount"] = float(amount_str)
                if currency_str and len(currency_str) <= 4: # Basic currency validation
                    extracted_data["currency"] = currency_str.upper()
                elif "USD" in raw_text.upper(): # Heuristic: if USD is present, assume USD
                    extracted_data["currency"] = "USD"
                elif "EUR" in raw_text.upper():
                    extracted_data["currency"] = "EUR"
            except ValueError:
                extracted_data["total_amount"] = None
                extracted_data["currency"] = None

        # Invoice Number
        number_patterns = [
            r'Invoice Number: ([A-Z0-9-]+)', # Prioritize exact match for 'Invoice Number: INV-2025-001'
            r'\bINV-(\d{4}-\d{3})\b', # Specific pattern for INV-YYYY-NNN
            r'\b([A-Z]{3}-\d{4}-\d{3})\b', # Catching INV-YYYY-NNN format more generally
            r'(?:Invoice|INV|Ref|Number)[\s#:]*([A-Z0-9]{2,}-\d{4,})\b', # INV-XXXX-YYYY or similar
            r'\b([A-Z0-9]{4,}-[A-Z0-9]{4,})\b', # Common invoice number format like XXXX-YYYY
            r'\b(\d{6,})\b' # Catching long numbers that might be invoice numbers
        ]
        for pattern in number_patterns:
            match = re.search(pattern, raw_text, re.IGNORECASE)
            if match:
                extracted_data["number"] = match.group(1)
                break

        # Due Date (similar to invoice date)
        for pattern in date_patterns:
            match = re.search(pattern, raw_text.replace('Invoice Date', ''), re.IGNORECASE) # Avoid matching invoice date again
            if match:
                extracted_data['due_date'] = match.group(0)
                break

        # Calculate average confidence for the whole document
        # pytesseract.image_to_data returns confidence per word
        conf_scores = [int(c) for c in ocr_data['conf'] if int(c) != -1]
        if conf_scores:
            overall_confidence = sum(conf_scores) / len(conf_scores) / 100.0 # Normalize to 0-1
        else:
            overall_confidence = 0.0

        ocr_confidence['overall'] = overall_confidence
        # For specific field confidence, a more advanced approach would be needed
        # For now, we'll just use the overall confidence as a proxy or set a default
        for key in extracted_data:
            if extracted_data[key] is not None and key != 'currency': # Currency is often part of amount
                ocr_confidence[key] = overall_confidence
            elif extracted_data[key] is None:
                ocr_confidence[key] = 0.0 # No extraction means no confidence

        return extracted_data, raw_text, ocr_confidence

    except Exception as e:
        print(f"Error during OCR or data extraction: {e}")
        return {}, "", {}


# Helper function to convert Django InMemoryUploadedFile to a format Pillow can open
def get_image_from_uploaded_file(uploaded_file):
    if uploaded_file.content_type.startswith("image"):
        # For image files, return the uploaded file directly as Pillow can handle it.
        # Ensure the file pointer is at the beginning.
        uploaded_file.seek(0)
        return uploaded_file
    elif uploaded_file.content_type == "application/pdf":
        # Convert PDF to a list of images
        # Read the content of the PDF file
        pdf_content = uploaded_file.read()
        images = convert_from_bytes(pdf_content)
        if images:
            # For simplicity, take the first page. More complex logic might process all pages.
            img_byte_arr = io.BytesIO()
            images[0].save(img_byte_arr, format="PNG") # Save as PNG to BytesIO
            img_byte_arr.seek(0)
            return img_byte_arr
        else:
            raise ValueError("Could not convert PDF to image.")
    else:
        raise ValueError(f"Unsupported file type: {uploaded_file.content_type}")

