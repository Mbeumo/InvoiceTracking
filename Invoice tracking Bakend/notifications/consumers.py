import json
import logging
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from django.contrib.auth import get_user_model
from rest_framework_simplejwt.tokens import UntypedToken
from rest_framework_simplejwt.exceptions import InvalidToken, TokenError
from django.contrib.auth.models import AnonymousUser

logger = logging.getLogger(__name__)
User = get_user_model()


class BaseAuthenticatedConsumer(AsyncWebsocketConsumer):
    """Base consumer with JWT authentication"""
    
    async def connect(self):
        # Get token from query string
        token = self.scope['query_string'].decode().split('token=')[-1] if 'token=' in self.scope['query_string'].decode() else None
        
        if token:
            try:
                # Validate JWT token
                UntypedToken(token)
                # Get user from token (simplified - in production, decode properly)
                self.user = await self.get_user_from_token(token)
                if self.user and not isinstance(self.user, AnonymousUser):
                    await self.accept()
                    await self.join_user_group()
                    return
            except (InvalidToken, TokenError):
                pass
        
        # Reject connection if authentication fails
        await self.close()
    
    async def disconnect(self, close_code):
        # Leave user group
        if hasattr(self, 'user') and self.user:
            await self.leave_user_group()
    
    @database_sync_to_async
    def get_user_from_token(self, token):
        """Get user from JWT token - simplified implementation"""
        try:
            # In production, properly decode JWT and get user
            # For now, return first active user (development only)
            return User.objects.filter(is_active=True).first()
        except:
            return AnonymousUser()
    
    async def join_user_group(self):
        """Join user-specific group"""
        if hasattr(self, 'user') and self.user:
            await self.channel_layer.group_add(
                f"user_{self.user.id}",
                self.channel_name
            )
    
    async def leave_user_group(self):
        """Leave user-specific group"""
        if hasattr(self, 'user') and self.user:
            await self.channel_layer.group_discard(
                f"user_{self.user.id}",
                self.channel_name
            )

class NotificationConsumer(BaseAuthenticatedConsumer):
    """WebSocket consumer for real-time notifications"""
    
    async def connect(self):
        await super().connect()
        
        # Join notifications group
        await self.channel_layer.group_add(
            "notifications",
            self.channel_name
        )
    
    async def disconnect(self, close_code):
        await super().disconnect(close_code)
        
        # Leave notifications group
        await self.channel_layer.group_discard(
            "notifications",
            self.channel_name
        )
    
    # Event handlers
    async def new_notification(self, event):
        """Handle new notification events"""
        # Only send to the intended user
        if hasattr(self, 'user') and self.user and str(self.user.id) == event.get('user_id'):
            await self.send(text_data=json.dumps({
                'type': 'new_notification',
                'notification': event['notification'],
                'timestamp': event.get('timestamp')
            }))
    
    async def notification_read(self, event):
        """Handle notification read events"""
        if hasattr(self, 'user') and self.user and str(self.user.id) == event.get('user_id'):
            await self.send(text_data=json.dumps({
                'type': 'notification_read',
                'notification_id': event['notification_id'],
                'timestamp': event.get('timestamp')
            }))
