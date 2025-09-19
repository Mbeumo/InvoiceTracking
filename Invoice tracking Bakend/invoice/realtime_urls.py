"""
Real-time WebSocket URLs for invoice updates
"""
from django.urls import path
from .consumers import InvoiceConsumer

from notifications.consumers import NotificationConsumer
from ai_system.consumers import AIInsightsConsumer

urlpatterns = [
    path('ws/invoices/', InvoiceConsumer.as_asgi()),
    path('ws/notifications/', NotificationConsumer.as_asgi()),
    path('ws/ai-insights/', AIInsightsConsumer.as_asgi()),
]