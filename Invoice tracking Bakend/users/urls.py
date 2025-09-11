from django.urls import path,include
from rest_framework.routers import DefaultRouter

from .views import (
    RegisterView, MeView, LogoutView, update_user_role, change_password,
    verify_email, activate_email, UserViewSet
)

router = DefaultRouter()
router.register(r'users', UserViewSet, basename='user')

urlpatterns = [
    path('register/', RegisterView.as_view(), name='register'),
    path('me/', MeView.as_view(), name='me'),
    path('logout/', LogoutView.as_view(), name='logout'),
    path('users/<uuid:user_id>/update-role/', update_user_role, name='update-user-role'),
    path('change-password/', change_password, name='change-password'),
    path('verify-email/<uuid:user_id>/', verify_email, name='verify-email'),
    path('activate/<uidb64>/<token>/', activate_email, name='activate-email'),
    path('', include(router.urls)),

]
