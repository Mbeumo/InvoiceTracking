from django.urls import include, path
from rest_framework.routers import DefaultRouter

from .views import (
    InvoiceViewSet, InvoiceTemplateViewSet, WorkflowRuleViewSet
)
#, NotificationViewSet,AIAnalyticsViewSet,
router = DefaultRouter()
router.register(r"invoices", InvoiceViewSet, basename="invoice")
router.register(r"templates", InvoiceTemplateViewSet, basename="template")
#router.register(r"notifications", NotificationViewSet, basename="notification")
#router.register(r"ai-analytics", AIAnalyticsViewSet, basename="ai-analytics")
router.register(r"workflow-rules", WorkflowRuleViewSet, basename="workflow-rule")

urlpatterns = [
    path("", include(router.urls)),
    # Real-time endpoints
    path("realtime/invoice-updates/", include("invoice.realtime_urls")),
]