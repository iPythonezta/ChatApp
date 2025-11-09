from django.urls import path
from .import views
urlpatterns = [
    path('groups/',views.list_groups,name='groups'),
    path('create_group/', views.create_group, name='create_group'),
    path('delete_group/<int:room_id>/', views.delete_group, name='delete_group'),
    path('add_member/<int:room_id>/', views.add_member, name='add_member'),
    path('members/<int:id>/', views.group_members,name='members'),
    path('join_group/',views.join_group,name='join_group'),
    path('user_details/',views.get_user_details, name="user"),
    path('messages/',views.get_group_messages,name='messages'),
    path('request-join/',views.request_group_membership,name='request_join'),
    path('requests/',views.get_room_requests,name='requests'),
    path('accept_decline_request/',views.accept_or_decline_request, name='accept_decline_request'),
    path('delete-group/<int:room_id>/',views.delete_group,name='delete_group'),
    path('leave-group/<int:room_id>/',views.leave_group,name='leave_group'),
    path('remove-message/<int:message_id>/',views.remove_message,name='remove_message'),
    path('room-details/<int:id>/', views.get_group_details, name='room_details'),
    path('remove-member/', views.remove_member, name='remove_member'),
    path('make-admin/', views.make_admin, name='make_admin'),
    path('get-notifications/', views.get_notifications, name='get_notifications'),
    path('update-notification-status/', views.update_notification_status, name='update_notification_status'),
]