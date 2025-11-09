from django.db import models
from django.contrib.auth import get_user_model

class Room(models.Model):
    name = models.CharField(max_length=255)
    members = models.ManyToManyField(get_user_model(), through='Membership')

    def __str__(self):
        return self.name


class Membership(models.Model):
    user = models.ForeignKey(get_user_model(), on_delete=models.CASCADE)
    room = models.ForeignKey(Room, on_delete=models.CASCADE)
    is_admin = models.BooleanField(default=False)

    def __str__(self):
        return f'{self.user.username} in {self.room.name}'

class Message(models.Model):
    sender = models.ForeignKey(get_user_model(), on_delete=models.CASCADE)
    room = models.ForeignKey(Room, on_delete=models.CASCADE, related_name='messages')
    message = models.TextField()
    message_type = models.CharField(max_length=30, default='text')
    sentdate = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f'{self.sender.username} in {self.room.name}: {self.message}'


class Requests(models.Model):
    requester = models.ForeignKey(get_user_model(), on_delete=models.CASCADE)
    room = models.ForeignKey(Room, on_delete=models.CASCADE)
    request_message = models.TextField()
    declined = models.BooleanField(default=False)
    request_type = models.CharField(max_length=30)
    sentdate = models.DateTimeField(auto_now_add=True)
    accepted = models.BooleanField(default=False)

# Separate model for images to allow for multiple images per message
class MessageImages(models.Model):
    message = models.ForeignKey(Message, on_delete=models.CASCADE, related_name='images')
    image = models.ImageField(upload_to='images/')

#Separate model to store voice message files
class MessageVoice(models.Model):
    message = models.ForeignKey(Message, on_delete=models.CASCADE, related_name='voice')
    voice = models.FileField(upload_to='voices/')

#Notifications Model
class Notification(models.Model):
    user = models.ForeignKey(get_user_model(), on_delete=models.CASCADE)
    message = models.TextField()
    sentdate = models.DateTimeField(auto_now_add=True)
    read = models.BooleanField(default=False)
    link = models.URLField(max_length=300, default='')