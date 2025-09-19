from django.shortcuts import render
from .models import Service
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework import generics,status,viewsets,filters,permissions
from .serializer import ServiceSerializer

# Create your views here.
class AllowFromRegistrationPageOrAuthenticated(permissions.BasePermission):
    def has_permission(self, request, view):
        referer = request.META.get('HTTP_REFERER', 'http://localhost:60298/register')
        if 'http://localhost:60298/register' in referer:
            return True
        return request.user and request.user.is_authenticated

class DepartmentViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Service.objects.all()
    serializer_class = ServiceSerializer
    permission_classes = [permissions.AllowAny]

    def list(self, request, *args, **kwargs):
        departments = self.get_queryset()
        data = [{"name": dept.name, "service_id": str(dept.id)} for dept in departments]
        return Response(data)

class DepartmentsByUserView(generics.ListAPIView):
    serializer_class = ServiceSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user_id = self.kwargs['user_id']
        return Service.objects.filter(users__id=user_id)

class DepartmentsByServiceView(generics.ListAPIView):
    serializer_class = ServiceSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        service_id = self.kwargs['service_id']
        return Service.objects.filter(service__id=service_id)


