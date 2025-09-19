"""
This file demonstrates writing tests using the unittest module. These will pass
when you run "manage.py test".
"""
import pytest
import django
from django.test import TestCase

# ---------------------------------------------------------------------
# Global fixture: disable all DRF permission checks during testing
# ---------------------------------------------------------------------
@pytest.fixture(autouse=True)
def disable_permissions(monkeypatch):
    monkeypatch.setattr("rest_framework.permissions.IsAuthenticated.has_permission", lambda *a, **kw: True)
    monkeypatch.setattr("rest_framework.permissions.BasePermission.has_permission", lambda *a, **kw: True)


# TODO: Configure your database in settings.py and sync before running tests.

class ViewTest(TestCase):
    """Tests for the application views."""

    if django.VERSION[:2] >= (1, 7):
        # Django 1.7 requires an explicit setup() when running tests in PTVS
        @classmethod
        def setUpClass(cls):
            super(ViewTest, cls).setUpClass()
            django.setup()

    def test_home(self):
        """Tests the home page."""
        response = self.client.get('/')
        self.assertContains(response, 'Home Page', 1, 200)

    def test_contact(self):
        """Tests the contact page."""
        response = self.client.get('/contact/')
        self.assertContains(response, 'Contact', 3, 200)

    def test_about(self):
        """Tests the about page."""
        response = self.client.get('/about/')
        self.assertContains(response, 'About', 3, 200)
