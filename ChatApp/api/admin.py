from django.contrib import admin
from .models import Room, Membership, Message
# Register your models here.

admin.site.register(Room)
admin.site.register(Membership)
admin.site.register(Message)