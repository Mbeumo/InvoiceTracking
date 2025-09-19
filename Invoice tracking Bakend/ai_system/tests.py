import pytest
from unittest.mock import patch
from datetime import datetime
from decimal import Decimal
from rest_framework.test import APIClient
from django.core.files.uploadedfile import SimpleUploadedFile
from django.contrib.auth import get_user_model

from invoice.models import Invoice, InvoiceTemplate
from .models import AIProcessingResult
from .tasks import (
    process_invoice_ocr,
    process_invoice_ai_pipeline,
    detect_anomalies,
)

User = get_user_model()


# ---------------------------------------------------------------------
# Global fixture: disable all DRF permission checks during testing
# ---------------------------------------------------------------------
@pytest.fixture(autouse=True)
def disable_permissions(monkeypatch):
    monkeypatch.setattr(
        "rest_framework.permissions.IsAuthenticated.has_permission",
        lambda *a, **kw: True,
    )
    monkeypatch.setattr(
        "rest_framework.permissions.BasePermission.has_permission",
        lambda *a, **kw: True,
    )


# ---------------------------------------------------------------------
# Shared fixtures
# ---------------------------------------------------------------------
@pytest.fixture
def default_user(db):
    return User.objects.create_user(
        email="test@example.com",
        password="secret",
        role="manager",
    )


@pytest.fixture
def base_invoice(default_user):
    """Return a minimal valid Invoice instance."""
    return Invoice.objects.create(
        vendor_name="Acme Corp",
        subtotal=Decimal("0.00"),
        tax_amount=Decimal("0.00"),
        total_amount=Decimal("0.00"),
        currency="USD",
        invoice_date=datetime(2025, 1, 1).date(),
        issue_date=datetime(2025, 1, 1).date(),
        due_date=datetime(2025, 2, 1).date(),
        current_service="OCR",
        file=SimpleUploadedFile("invoice.png", b"fake-bytes"),
        created_by=default_user,
    )


# ---------------------------------------------------------------------
# Task‐level tests
# ---------------------------------------------------------------------
@pytest.mark.django_db
@patch("ai_system.ocr.engine")  # adjust to your real module path
def test_process_invoice_ocr_success(mock_run, base_invoice):
    """Simulate OCR result via patching and verify invoice updates."""
    # Create a template for matching
    template = InvoiceTemplate.objects.create(
        name="Test Template",
        detection_keywords=["Invoice", "Total"],
        rois={"invoice_number": [0, 0, 100, 50]},
        enabled=True,
    )

    # Fake OCR output
    mock_run.return_value.raw_text = "Invoice #123"
    mock_run.return_value.confidence = 0.95
    mock_run.return_value.template_id = template.id
    mock_run.return_value.fields = {
        "invoice_number": "123",
        "subtotal": "1500.00",
        "tax_amount": "0.00",
        "total_amount": "1500.00",
        "date": "09/01/2025",
    }

    # Execute
    result = process_invoice_ocr(base_invoice.id)
    base_invoice.refresh_from_db()

    # Verify
    assert result["success"]
    assert base_invoice.number == "123"
    assert base_invoice.subtotal == Decimal("1500.00")
    assert base_invoice.tax_amount == Decimal("0.00")
    assert base_invoice.total_amount == Decimal("1500.00")
    assert base_invoice.matched_template == template.id
    assert base_invoice.issue_date == datetime(2025, 9, 1).date()


@pytest.mark.django_db
@patch("ai_system.service.OCRService.extract_invoice_data")  # adjust path
def test_ai_pipeline_success(mock_process, base_invoice):
    """Mock AI pipeline and verify processing result and model updates."""
    mock_process.return_value = {
        "priority_score": 0.85,
        "risk_score": 0.2,
        "recommendations": ["Flag for review"],
        "next_actions": ["Notify manager"],
    }

    result = process_invoice_ai_pipeline(base_invoice.id)

    # Verify pipeline result
    assert result["success"]
    assert result["processing_result"]["priority_score"] == 0.85

    # Verify AIProcessingResult record
    ai_result = AIProcessingResult.objects.get(invoice=base_invoice)
    assert ai_result.processing_status == "completed"
    assert ai_result.ai_recommendations == ["Flag for review"]
    assert ai_result.suggested_actions == ["Notify manager"]

    # Verify invoice fields
    base_invoice.refresh_from_db()
    assert base_invoice.ai_priority_score == 0.85
    assert base_invoice.ai_risk_score == 0.2


@pytest.mark.django_db
def test_detect_anomalies(base_invoice):
    """Seed invoices and ensure anomalies are detected correctly."""
    # Duplicate invoices
    #for _ in range(3):
    Invoice.objects.create(
        vendor_name="Acme Corp",
        number="DUP-001",
        subtotal=Decimal("100"),
        tax_amount=Decimal("0.00"),
        total_amount=Decimal("100"),
        currency="USD",
        invoice_date=base_invoice.invoice_date,
        issue_date=base_invoice.issue_date,
        due_date=base_invoice.due_date,
        current_service="ANOM",
        file=base_invoice.file,
        created_by=base_invoice.created_by,
    )

    # Normal invoices
    #for _ in range(5):
    Invoice.objects.create(
        vendor_name="Acme Corp",
        number="OK",
        subtotal=Decimal("100"),
        tax_amount=Decimal("0.00"),
        total_amount=Decimal("100"),
        currency="USD",
        invoice_date=base_invoice.invoice_date,
        issue_date=base_invoice.issue_date,
        due_date=base_invoice.due_date,
        current_service="ANOM",
        file=base_invoice.file,
        created_by=base_invoice.created_by,
    )

    # One high‐amount invoice
    Invoice.objects.create(
        vendor_name ="Acme Corp",
        number="HIGH",
        subtotal=Decimal("1000"),
        tax_amount=Decimal("0.00"),
        total_amount=Decimal("1000"),
        currency="USD",
        invoice_date=base_invoice.invoice_date,
        issue_date=base_invoice.issue_date,
        due_date=base_invoice.due_date,
        current_service="ANOM",
        file=base_invoice.file,
        created_by=base_invoice.created_by,
    )

    result = detect_anomalies()
    assert result["success"]

    anomalies = result["anomalies"]
    dup = next((a for a in anomalies if a["type"] == "duplicate_invoice"), None)
    high = next((a for a in anomalies if a["type"] == "high_amount"), None)

    assert dup and dup["number"] == "DUP-001" and dup["count"] == 3
    assert high and high["amount"] > high["threshold"]


# ---------------------------------------------------------------------
# Example integration test (API-level)
# ---------------------------------------------------------------------
"""@pytest.mark.django_db
def test_api_integration_with_permissions_disabled(default_user):
    client = APIClient()
    client.force_authenticate(user=default_user)
    resp = client.get("/api/invoices/")  # adjust to your real endpoint
    assert resp.status_code in (200, 204)"""