from rest_framework import serializers
from .models import Room, Membership, Message, Requests, MessageImages, MessageVoice, Notification
from django.contrib.auth import get_user_model

class UserSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)
    notification_count = serializers.SerializerMethodField('get_total_notifications')
    class Meta:
        model = get_user_model()
        fields = "__all__"
    def get_total_notifications(self, obj):
        return Notification.objects.filter(user=obj, read=False).count()

class RoomSerializer(serializers.ModelSerializer):
    members = UserSerializer(many=True, read_only=True)

    class Meta:
        model = Room
        fields = ['id', 'name', 'members']

class MembershipSerializer(serializers.ModelSerializer):
    user = UserSerializer()

    class Meta:
        model = Membership
        fields = ['user', 'room', 'is_admin']

class ImagesSerializer(serializers.ModelSerializer):
    class Meta:
        model = MessageImages
        fields = ['id', 'image']

class VoiceSerializer(serializers.ModelSerializer):
    class Meta:
        model = MessageVoice
        fields = ['id', 'voice']

class MessageSerializer(serializers.ModelSerializer):
    sender = UserSerializer()
    images = ImagesSerializer(many=True, read_only=True)
    voice = VoiceSerializer(many=True, read_only=True)
    class Meta:
        model = Message
        fields = '__all__'

class RequestSerializer(serializers.ModelSerializer):
    requester = UserSerializer()
    
    class Meta:
        model = Requests
        fields = ['id', 'requester', 'room', 'request_message', 'declined', 'request_type', 'sentdate', 'accepted']

class NotificationSerializer(serializers.ModelSerializer):
    user = UserSerializer()
    total_notifications = serializers.SerializerMethodField(method_name="get_total_notifications")
    class Meta:
        model = Notification
        fields = ['id','user', 'message', 'sentdate', 'read', 'total_notifications', 'link']

    def get_total_notifications(self, obj):
        return Notification.objects.filter(user=obj.user).count()