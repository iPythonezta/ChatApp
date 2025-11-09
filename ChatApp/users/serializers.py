from rest_framework import serializers
from .models import CustomUser

class CustomUserSerializers(serializers.ModelSerializer):
    
    class Meta:
        model = CustomUser
        fields = ['username', 'full_name', 'email', 'phone_number','password']
        extra_kwargs = {"password":{'write_only': True}}
    def create(self,validated_data):
        return CustomUser.objects.create_user(**validated_data)
