from django.urls import include, path
from rest_framework.routers import DefaultRouter
from django.conf import settings
from django.conf.urls.static import static

from .views import (
    InvoiceViewSet, InvoiceTemplateViewSet, WorkflowRuleViewSet, AnalyticsAPIView
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
    #path('invoices/<uuid:pk>/upload/', InvoiceFileUploadView.as_view(), name='invoice-upload'),
    path('analytics/', AnalyticsAPIView.as_view(), name='analytics'),

    path("realtime/invoice-updates/", include("invoice.realtime_urls")),
] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)