import pytest
from unittest.mock import patch
from datetime import datetime
from decimal import Decimal

from django.core.files.uploadedfile import SimpleUploadedFile
from django.contrib.auth import get_user_model
from django.contrib.auth.models import Group, Permission
from django.contrib.contenttypes.models import ContentType

from rest_framework.test import APIClient

from invoice.models import Invoice, InvoiceTemplate
from users.serializers import UserSerializer

# Create your tests here.

# ---------------------------------------------------------------------
# Global fixture: disable all DRF permission checks during testing
# ---------------------------------------------------------------------
@pytest.fixture(autouse=True)
def disable_permissions(monkeypatch):
    monkeypatch.setattr("rest_framework.permissions.IsAuthenticated.has_permission", lambda *a, **kw: True)
    monkeypatch.setattr("rest_framework.permissions.BasePermission.has_permission", lambda *a, **kw: True)


# ---------------------------------------------------------------------
# Serializer + Permission test
# ---------------------------------------------------------------------
@pytest.mark.django_db
def test_user_serializer_permissions():
    """Ensure that UserSerializer.get_permissions() returns codenames from group → permission linkage."""
    User = get_user_model()

    # 1. Create a permission tied to Invoice
    invoice_ct = ContentType.objects.get_for_model(Invoice)
    view_inv = Permission.objects.get_or_create(
        codename="view_invoice",
        content_type=invoice_ct,
    )

    # 2. Create a group and assign the permission
    manager_group = Group.objects.get_or_create(name="manager")
    manager_group.permissions.add(view_inv)

    # 3. Create a user with role matching group
    user = User.objects.create_user(
        username="bob",
        email="bob@example.com",
        password="secret",
        role="manager"
    )


    # 4. Serialize user
    serialized = UserSerializer(user).data

    # 5. Assert the permission shows up
    perms = serialized["permissions"]
    assert any(p["codename"] == "view_invoice" for p in perms)

