"""
WebSocket consumers for real-time updates
"""
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


class InvoiceConsumer(BaseAuthenticatedConsumer):
    """WebSocket consumer for real-time invoice updates"""
    
    async def connect(self):
        await super().connect()
        
        # Join invoice updates group
        await self.channel_layer.group_add(
            "invoice_updates",
            self.channel_name
        )
    
    async def disconnect(self, close_code):
        await super().disconnect(close_code)
        
        # Leave invoice updates group
        await self.channel_layer.group_discard(
            "invoice_updates",
            self.channel_name
        )
    
    async def receive(self, text_data):
        """Handle incoming WebSocket messages"""
        try:
            data = json.loads(text_data)
            message_type = data.get('type')
            
            if message_type == 'subscribe_invoice':
                invoice_id = data.get('invoice_id')
                if invoice_id:
                    await self.channel_layer.group_add(
                        f"invoice_{invoice_id}",
                        self.channel_name
                    )
                    await self.send(text_data=json.dumps({
                        'type': 'subscription_confirmed',
                        'invoice_id': invoice_id
                    }))
            
            elif message_type == 'unsubscribe_invoice':
                invoice_id = data.get('invoice_id')
                if invoice_id:
                    await self.channel_layer.group_discard(
                        f"invoice_{invoice_id}",
                        self.channel_name
                    )
        
        except json.JSONDecodeError:
            await self.send(text_data=json.dumps({
                'type': 'error',
                'message': 'Invalid JSON'
            }))
    
    # Event handlers
    async def invoice_updated(self, event):
        """Handle invoice update events"""
        await self.send(text_data=json.dumps({
            'type': 'invoice_updated',
            'invoice': event['invoice'],
            'changes': event.get('changes', {}),
            'timestamp': event.get('timestamp')
        }))
    
    async def invoice_status_changed(self, event):
        """Handle invoice status change events"""
        await self.send(text_data=json.dumps({
            'type': 'invoice_status_changed',
            'invoice_id': event['invoice_id'],
            'old_status': event['old_status'],
            'new_status': event['new_status'],
            'changed_by': event['changed_by'],
            'timestamp': event.get('timestamp')
        }))
    
    async def ai_processing_complete(self, event):
        """Handle AI processing completion events"""
        await self.send(text_data=json.dumps({
            'type': 'ai_processing_complete',
            'invoice_id': event['invoice_id'],
            'results': event['results'],
            'timestamp': event.get('timestamp')
        }))


