from django.urls import re_path
from invoice.consumers import InvoiceConsumer, NotificationConsumer, AIInsightsConsumer

websocket_urlpatterns = [
    re_path(r"ws/invoices/$", InvoiceConsumer.as_asgi()),
    re_path(r"ws/notifications/$", NotificationConsumer.as_asgi()),
    re_path(r"ws/ai-insights/$", AIInsightsConsumer.as_asgi()),
] 