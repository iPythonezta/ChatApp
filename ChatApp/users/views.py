from rest_framework.response import Response
from .models import CustomUser
from .serializers import CustomUserSerializers
from rest_framework import generics, permissions, serializers, status

class UserRegistrationView(generics.CreateAPIView):
    queryset = CustomUser.objects.all()
    serializer_class = CustomUserSerializers
    permission_classes = [permissions.AllowAny]
