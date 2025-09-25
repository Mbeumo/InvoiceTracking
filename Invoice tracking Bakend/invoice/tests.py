import uuid
from decimal import Decimal
import pytest
from .models import Invoice

import uuid
from django.urls import reverse
from django.core.files.uploadedfile import SimpleUploadedFile

@pytest.mark.django_db
def test_create_invoice():
    invoice = Invoice.objects.create(
        vendor_name="Test Vendor",
        invoice_date="2025-09-24",
        due_date="2025-10-24",
        total_amount=Decimal("150.75"),
        currency="USD",
        number="INV-001",
        ocr_confidence={"overall": 0.9},
        raw_text="This is a test."
    )
    assert invoice.vendor_name == "Test Vendor"
    assert invoice.total_amount == Decimal("150.75")
    assert isinstance(invoice.id, uuid.UUID)


@pytest.fixture
def image_file():
    content = (
        b'\x89PNG\r\n\x1a\n\x00\x00\x00\rIHDR\x00\x00\x00\x01\x00\x00\x00\x01\x08\x06\x00\x00\x00\x1f\x15\xc4\x89'
        b'\x00\x00\x00\x0cIDATx\xda\xed\xc1\x01\x01\x00\x00\x00\xc2\xa0\xf7Om\x00\x00\x00\x00IEND\xaeB`\x82'
    )
    return SimpleUploadedFile("test_invoice.png", content, content_type="image/png")

@pytest.mark.django_db
def test_ocr_upload_new_invoice(client, image_file, mocker):
    url = reverse("invoice-ocr-upload")
    mocker.patch("invoice_app.views.get_image_from_uploaded_file", return_value=None)
    mocker.patch("invoice_app.views.perform_ocr_and_extract_data", return_value=(
        {
            "vendor_name": "Mock Vendor",
            "invoice_date": "2025-01-15",
            "due_date": "2025-02-15",
            "total_amount": 100.50,
            "currency": "EUR",
            "number": "MOCK-INV-001",
        },
        "Mock raw text from OCR",
        {"overall": 0.99, "vendor_name": 0.95}
    ))

    response = client.post(url, {"file": image_file}, format="multipart")
    assert response.status_code == 201
    invoice = Invoice.objects.first()
    assert invoice.vendor_name == "Mock Vendor"
    assert str(invoice.invoice_date) == "2025-01-15"
    assert str(invoice.due_date) == "2025-02-15"
    assert invoice.total_amount == Decimal("100.50")
    assert invoice.currency == "EUR"
    assert invoice.number == "MOCK-INV-001"
    assert invoice.raw_text == "Mock raw text from OCR"
    assert "overall" in invoice.ocr_confidence
    assert "vendor_name" in invoice.ocr_confidence

@pytest.mark.django_db
def test_ocr_upload_update_existing_invoice(client, image_file, mocker):
    url = reverse("invoice-ocr-upload")
    existing_invoice = Invoice.objects.create(
        vendor_name="Old Vendor",
        invoice_date="2024-01-01",
        due_date="2024-02-01",
        total_amount=Decimal("50.00"),
        currency="USD",
        number="OLD-INV-001",
        ocr_confidence={"overall": 0.5},
        raw_text="Old raw text"
    )

    mocker.patch("invoice_app.views.get_image_from_uploaded_file", return_value=None)
    mocker.patch("invoice_app.views.perform_ocr_and_extract_data", return_value=(
        {
            "vendor_name": "Updated Vendor",
            "invoice_date": "2025-03-20",
            "due_date": "2025-04-20",
            "total_amount": 200.75,
            "currency": "GBP",
            "number": "UPDATED-INV-002",
        },
        "Updated raw text from OCR",
        {"overall": 0.98, "vendor_name": 0.90}
    ))

    response = client.post(url, {"file": image_file, "invoice_id": str(existing_invoice.id)}, format="multipart")
    assert response.status_code == 200
    existing_invoice.refresh_from_db()
    assert existing_invoice.vendor_name == "Updated Vendor"
    assert str(existing_invoice.invoice_date) == "2025-03-20"
    assert str(existing_invoice.due_date) == "2025-04-20"
    assert existing_invoice.total_amount == Decimal("200.75")
    assert existing_invoice.currency == "GBP"
    assert existing_invoice.number == "UPDATED-INV-002"
    assert existing_invoice.raw_text == "Updated raw text from OCR"
    assert "overall" in existing_invoice.ocr_confidence

@pytest.mark.django_db
def test_ocr_upload_no_file(client):
    url = reverse("invoice-ocr-upload")
    response = client.post(url, {}, format="multipart")
    assert response.status_code == 400
    assert "error" in response.data
    assert response.data["error"] == "No file provided."

@pytest.mark.django_db
def test_ocr_upload_manual_override(client, image_file, mocker):
    url = reverse("invoice-ocr-upload")
    mocker.patch("invoice_app.views.get_image_from_uploaded_file", return_value=None)
    mocker.patch("invoice_app.views.perform_ocr_and_extract_data", return_value=(
        {
            "vendor_name": "OCR Vendor",
            "invoice_date": "2025-01-01",
            "total_amount": 10.00,
        },
        "OCR raw text",
        {"overall": 0.8}
    ))

    override_data = {
        "file": image_file,
        "vendor_name": "Manual Vendor",
        "total_amount": 99.99,
        "currency": "JPY",
    }

    response = client.post(url, override_data, format="multipart")
    assert response.status_code == 201
    invoice = Invoice.objects.first()
    assert invoice.vendor_name == "Manual Vendor"
    assert invoice.total_amount == Decimal("99.99")
    assert invoice.currency == "JPY"
    assert str(invoice.invoice_date) == "2025-01-01"

@pytest.mark.django_db
def test_ocr_upload_invalid_invoice_id(client, image_file, mocker):
    url = reverse("invoices/ocr-upload")
    mocker.patch("invoice_app.views.get_image_from_uploaded_file", return_value=None)
    mocker.patch("invoice_app.views.perform_ocr_and_extract_data", return_value=(
        {
            "vendor_name": "Mock Vendor",
            "invoice_date": "2025-01-15",
            "total_amount": 100.50,
        },
        "Mock raw text",
        {"overall": 0.99}
    ))

    invalid_uuid = uuid.uuid4()
    response = client.post(url, {"file": image_file, "invoice_id": str(invalid_uuid)}, format="multipart")
    assert response.status_code == 404
    assert Invoice.objects.count() == 0