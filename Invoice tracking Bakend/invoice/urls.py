from django.urls import include, path
from rest_framework.routers import DefaultRouter

from .views import InvoiceViewSet, InvoiceTemplateViewSet

router = DefaultRouter()
router.register(r"invoices", InvoiceViewSet, basename="invoice")
#router.register(r"suppliers", SupplierViewSet, basename="supplier")
router.register(r"templates", InvoiceTemplateViewSet, basename="template")

urlpatterns = [
    path("", include(router.urls)),
]