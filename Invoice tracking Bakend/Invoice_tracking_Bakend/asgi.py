import os

from channels.auth import AuthMiddlewareStack
from channels.routing import ProtocolTypeRouter, URLRouter
from django.core.asgi import get_asgi_application

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "Invoice_tracking_Backend.settings")

django_asgi_app = get_asgi_application()

try:
    from . import routing  # type: ignore
    websocket_urlpatterns = routing.websocket_urlpatterns
except Exception:
    websocket_urlpatterns = []

application = ProtocolTypeRouter(
    {
        "http": django_asgi_app,
        "websocket": AuthMiddlewareStack(
            URLRouter(websocket_urlpatterns)
        ),
    }
) 