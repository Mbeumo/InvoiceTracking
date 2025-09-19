from django.shortcuts import render
from django.contrib.auth import get_user_model
from httpx import request
from rest_framework import generics, permissions,status,viewsets
from rest_framework.response import Response
from rest_framework.views import APIView
from django.http import JsonResponse
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework.decorators import api_view, permission_classes
from django.shortcuts import get_object_or_404
from auditlog.context import set_actor

from django.contrib.auth.tokens import default_token_generator
from django.utils.http import urlsafe_base64_encode,urlsafe_base64_decode
from django.utils.encoding import force_bytes
from django.core.mail import send_mail
from django.conf import settings
from django.template.loader import render_to_string
from django.utils import timezone
from .models import SystemConfiguration
from .serializers import RegisterSerializer, UserSerializer, SystemConfigurationSerializer, SettingsResponseSerializer
# Create your views here.
User = get_user_model()
class IsSuperuserOrManager(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user.is_superuser or request.user.has_perm('manage_users')

class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated, IsSuperuserOrManager]

    def get_queryset(self):
        user = self.request.user
        if user.is_superuser or user.has_perm('view_users'):
            return User.objects.all()
        return User.objects.filter(serviceId=user.serviceId)

    def perform_update(self, serializer):
        set_actor(self.request.user)
        serializer.save()

    def perform_destroy(self, instance):
        set_actor(self.request.user)
        instance.delete()

class RegisterView(generics.CreateAPIView):
    # User = get_user_model()
    queryset = User.objects.all()
    serializer_class = RegisterSerializer
    permission_classes = [permissions.AllowAny]

    def perform_create(self, serializer):
        actor = self.request.user if self.request.user.is_authenticated else None
        set_actor(actor)
        serializer.save()
        return Response({"message": "User registered successfully"}, status=status.HTTP_201_CREATED)

class MeView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        return Response(UserSerializer(request.user).data) 

"""class CurrentUserView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        serializer = UserSerializer(request.user)
        return Response(serializer.data)
"""
class LogoutView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        try:
            refresh_token = request.data.get("refresh")
            if not refresh_token:
                return Response({"detail": "Refresh token required."}, status=status.HTTP_400_BAD_REQUEST)

            token = RefreshToken(refresh_token)
            token.blacklist()

            return Response({"detail": "Logout successful."}, status=status.HTTP_205_RESET_CONTENT)
        except Exception as e:
            return Response({"detail": "Invalid token."}, status=status.HTTP_400_BAD_REQUEST)
from auditlog.context import set_actor

@api_view(['POST'])
@permission_classes([permissions.IsAdminUser])
def update_user_role(request, user_id):
    user = get_object_or_404(User, pk=user_id)
    set_actor(request.user)  # This links the audit entry to the admin
    user.role = request.data.get('role')
    user.save()
    return Response({'status': 'updated'})

@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def change_password(request):
    user = request.user
    set_actor(user)

    old_password = request.data.get('old_password')
    new_password = request.data.get('new_password')

    if not user.check_password(old_password):
        return Response({'detail': 'Old password is incorrect'}, status=status.HTTP_400_BAD_REQUEST)

    user.set_password(new_password)
    user.password_changed_at = timezone.now()
    user.require_password_change = False
    user.save()

    return Response({'detail': 'Password updated successfully'})



@api_view(['POST'])
@permission_classes([permissions.IsAdminUser])
def verify_email(request, user_id):
    user = get_object_or_404(User, pk=user_id)
    set_actor(request.user)

    # Generate token and UID
    token = default_token_generator.make_token(user)
    uid = urlsafe_base64_encode(force_bytes(user.pk))

    # Build verification URL
    domain = request.get_host()
    verify_url = f"http://localhost/api/verify/{uid}/{token}/"

    # Render email content
    subject = "Verify your email address"
    message = render_to_string('emails/verifyemail.html', {
        'user': user,
        'verify_url': verify_url,
    })

    # Send email
    send_mail(
        subject,
        message,
        settings.DEFAULT_FROM_EMAIL,
        [user.email],
        fail_silently=False,
    )

    return Response({'detail': f'Verification email sent to {user.email}'})

@api_view(['GET'])
def activate_email(request, uidb64, token):
    try:
        uid = force_bytes(urlsafe_base64_decode(uidb64))
        user = User.objects.get(pk=uid)
    except Exception:
        return Response({'detail': 'Invalid link'}, status=400)

    if default_token_generator.check_token(user, token):
        user.email_verified = True
        user.save()
        return Response({'detail': 'Email verified successfully'})
    else:
        return Response({'detail': 'Invalid or expired token'}, status=400)

class SettingsView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        user_data = UserSerializer(request.user).data
        system_configs = SystemConfiguration.objects.all()
        system_data = SystemConfigurationSerializer(system_configs, many=True).data

        payload = {
            "user": user_data,
            "system": system_data
        }
        serializer = SettingsResponseSerializer(payload)
        return Response(serializer.data)

class SystemConfigurationUpdateView(APIView):
    permission_classes = [permissions.IsAuthenticated, IsSuperuserOrManager]

    def post(self, request):
        updates = request.data  # { "key1": value1, "key2": value2 }
        for key, value in updates.items():
            try:
                conf = SystemConfiguration.objects.get(pk=key)
                conf.value = str(value)
                conf.save(update_fields=["value", "updated_at"])
            except SystemConfiguration.DoesNotExist:
                continue
        return Response({"status": "ok"})
