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
from rest_framework.decorators import action

from django.contrib.auth.tokens import default_token_generator
from django.utils.http import urlsafe_base64_encode,urlsafe_base64_decode
from django.utils.encoding import force_bytes
from django.core.mail import send_mail
from django.conf import settings
from django.template.loader import render_to_string
from django.utils import timezone
from .models import SystemConfiguration
from .serializers import (
    RegisterSerializer, UserSerializer, SystemConfigurationSerializer, SettingsResponseSerializer,
    PermissionSerializer, GroupSerializer, UserPermissionUpdateSerializer, UserGroupUpdateSerializer,
    GroupPermissionUpdateSerializer
)
from django.contrib.auth.models import Group, Permission
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

    # User-level permission management
    def get_permissions(self):
        # Ensure only admins/managers can mutate
        if self.action in ["assign_permissions", "assign_groups", "revoke_permissions", "revoke_groups"]:
            return [permissions.IsAuthenticated(), IsSuperuserOrManager()]
        return super().get_permissions()

    @action(detail=True, methods=["post"], url_path="permissions")
    def assign_permissions(self, request, pk=None):
        user = self.get_object()
        serializer = UserPermissionUpdateSerializer(data=request.data, context={"user": user})
        serializer.is_valid(raise_exception=True)
        set_actor(request.user)
        serializer.save()
        return Response(UserSerializer(user).data)

    @action(detail=True, methods=["post"], url_path="groups")
    def assign_groups(self, request, pk=None):
        user = self.get_object()
        serializer = UserGroupUpdateSerializer(data=request.data, context={"user": user})
        serializer.is_valid(raise_exception=True)
        set_actor(request.user)
        serializer.save()
        return Response(UserSerializer(user).data)

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


class GroupViewSet(viewsets.ModelViewSet):
    queryset = Group.objects.all()
    serializer_class = GroupSerializer
    permission_classes = [permissions.IsAuthenticated, IsSuperuserOrManager]

    @action(detail=True, methods=["post"], url_path="permissions")
    def set_permissions(self, request, pk=None):
        group = self.get_object()
        serializer = GroupPermissionUpdateSerializer(data=request.data, context={"group": group})
        serializer.is_valid(raise_exception=True)
        set_actor(request.user)
        serializer.save()
        return Response(GroupSerializer(group).data)


class PermissionListView(APIView):
    permission_classes = [permissions.IsAuthenticated, IsSuperuserOrManager]

    def get(self, request):
        perms = Permission.objects.select_related("content_type").order_by("content_type__app_label", "codename")
        return Response(PermissionSerializer(perms, many=True).data)

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
        #user_data = UserSerializer(request.user).data
        system_configs = SystemConfiguration.objects.all()
        serializer = SystemConfigurationSerializer(system_configs, many=True)

        
        return Response(serializer.data)

class SystemConfigurationUpdateView(APIView):
    permission_classes = [permissions.IsAuthenticated, IsSuperuserOrManager]

    def put(self, request):
        updates = request.data  # expect a list of {key: "appearance.theme", value: "dark"}
        for item in updates:
            key = item.get("key")
            value = item.get("value")
            type_ = item.get("type")
            category = item.get("category")
            is_editable = item.get("isEditable")
            updated_by = request.user or item.get("updated_by")

            if not key:
                continue
            try:
                conf = SystemConfiguration.objects.get(key=key)
                conf.value = str(value)
                if type_:
                    conf.type = type_
                if category:
                    conf.category = category
                if is_editable is not None:
                    conf.is_editable = is_editable
                conf.updated_by = updated_by
                conf.save()
            except SystemConfiguration.DoesNotExist:
                continue

        return Response({"status": "ok"})
