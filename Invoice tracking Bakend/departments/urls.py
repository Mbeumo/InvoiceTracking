from django.urls import path,include
from rest_framework.routers import DefaultRouter
from .views import DepartmentViewSet, DepartmentsByUserView, DepartmentsByServiceView
router = DefaultRouter()
router.register(r'services', DepartmentViewSet, basename='services')

urlpatterns = [
    path('', include(router.urls)),
    path('api/departments/user/<uuid:user_id>/', DepartmentsByUserView.as_view()),
    path('api/departments/service/<str:service_id>/', DepartmentsByServiceView.as_view()),

]
