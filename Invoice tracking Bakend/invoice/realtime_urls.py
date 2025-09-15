"""
Real-time WebSocket URLs for invoice updates
"""
from django.urls import path
from . import consumers

websocket_urlpatterns = [
    path('ws/invoices/', consumers.InvoiceConsumer.as_asgi()),
    path('ws/notifications/', consumers.NotificationConsumer.as_asgi()),
    path('ws/ai-insights/', consumers.AIInsightsConsumer.as_asgi()),
]