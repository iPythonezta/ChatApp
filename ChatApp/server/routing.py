from django.urls import re_path

from . import consumers
from . import notifications_consumer

websocket_urlpatterns = [
    re_path(r"ws/chat/(?P<room_name>\w+)/$", consumers.ChatConsumer.as_asgi()),
    re_path(r'ws/notifications/(?P<username>\w+)/$', notifications_consumer.NotificationConsumer.as_asgi()),
]