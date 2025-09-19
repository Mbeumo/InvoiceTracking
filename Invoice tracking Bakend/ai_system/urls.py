from django.urls import include, path
from rest_framework.routers import DefaultRouter

from .views import  AIAnalyticsViewSet

router = DefaultRouter()
router.register(r"ai-analytics", AIAnalyticsViewSet, basename="ai-analytics")

urlpatterns = [
    path("", include(router.urls)),
    
]