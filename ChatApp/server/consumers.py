import json

from channels.generic.websocket import AsyncWebsocketConsumer
from api.models import Message, Room, Membership, MessageImages, MessageVoice
from users.models import CustomUser
from asgiref.sync import sync_to_async
from channels.auth import get_user
import base64
from django.core.files.base import ContentFile
import os
from django.conf import settings

class ChatConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.room_name = self.scope["url_route"]["kwargs"]["room_name"]
        self.room_group_name = f"chat_{self.room_name}"

        await self.channel_layer.group_add(self.room_group_name, self.channel_name)

        await self.accept()

    async def disconnect(self, close_code):
        await self.channel_layer.group_discard(self.room_group_name, self.channel_name)

    async def receive(self, text_data):
        text_data_json = json.loads(text_data)
        sender = await sync_to_async(CustomUser.objects.get)(username=text_data_json["sender"]['username'])
        try:
            room = await sync_to_async(Room.objects.get)(id=text_data_json["room"])
        except:
            await self.send(text_data=json.dumps({"message": "Room with this id does not exist"}))
            print("LOG: Room with this id does not exist")
            return
        membership = await sync_to_async(lambda: Membership.objects.filter(user=sender, room=room).first())()
        if not membership:
            await self.send(text_data=json.dumps({"message": "You are not a member of the group"}))
            print("LOG: You are not a member of the group")
            return
        message = await sync_to_async(Message.objects.create)(
            sender=sender,
            message=text_data_json["message"],
            room=room,
        )

        text_data_json["id"] = message.id
        images = text_data_json.get("images", [])
        print("imgs")
        print(images)
        image_instances = []
        for image in images:
            format, imgstr = image.split(';base64,')
            ext = format.split('/')[-1] 
            image_data = await sync_to_async(ContentFile)(base64.b64decode(imgstr), name=f'image.{ext}')
            img = await sync_to_async(MessageImages.objects.create)(message=message, image=image_data)
            image_instances.append(img)
        
        text_data_json["images"] = [{"id": img.id, "image": img.image.url} for img in image_instances]
        voice = text_data_json.get("voice")
        voice_instance = None
        if voice:
            audio_data = base64.b64decode(voice)
            voice_instance = await sync_to_async(MessageVoice.objects.create)(message=message, voice=ContentFile(audio_data, name=f'voice.webm'))
            text_data_json["voice"] = [{"id": voice_instance.id, "voice": voice_instance.voice.url}]
        await self.send(text_data=json.dumps(text_data_json))
        await self.channel_layer.group_send(
            self.room_group_name, {"type": "chat.message", "message": text_data_json}
        )
    async def chat_message(self, event):
        message = event["message"]

        await self.send(text_data=json.dumps({"message": message}))

    async def message_delete(self, event):
        message_id = event["message_id"]
        await self.send(text_data=json.dumps({"message_id": message_id, "type": "delete"}))
    
    async def message_remove(self, event):
        message_id = event['message_id']
        message = event['message']

        await self.send(text_data=json.dumps({
            'type': 'member_remove',
            'message_id': message_id,
            'message': message,
            "deleted_guy": event['deleted_guy']
            
        }))

    async def message_join(self, event):
        await self.send(text_data=json.dumps({
            'type': 'join',
            'message': event['message'],
            'message_id': event['message_id'],
        }))

    async def message_leave(self, event):
        await self.send(text_data=json.dumps({
            'type': 'leave',
            'message': event['message'],
            'message_id': event['message_id'],
        }))

    async def message_admin(self, event):
        await self.send(text_data=json.dumps({
            'type': 'admin',
            'message': event['message'],
            'message_id': event['message_id'],
        }))
    
    async def join_request(self, event):
        print('Got a request!')
        await self.send(text_data=json.dumps({
            'type': 'join_request',
            'request': event['request'],
        }))

    async def message_decline(self, event):
        await self.send(text_data=json.dumps({
            'type': 'decline',
            'message': event['message'],
            'message_id': event['message_id'],
        }))