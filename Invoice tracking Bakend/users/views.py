from django.shortcuts import render
from django.contrib.auth import get_user_model
from httpx import request
from rest_framework import generics, permissions,status
from rest_framework.response import Response
from rest_framework.views import APIView
from django.http import JsonResponse
from .serializers import RegisterSerializer, UserSerializer
# Create your views here.

class RegisterView(generics.CreateAPIView):
    # User = get_user_model()
    queryset = get_user_model().objects.all()
    serializer_class = RegisterSerializer
    permission_classes = [permissions.AllowAny]
    # def post(self, request):
        # Your registration logic here
        # return Response({"message": "User registered successfully"}, status=status.HTTP_201_CREATED)

class MeView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        return Response(UserSerializer(request.user).data) 