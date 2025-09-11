from asgiref.sync import async_to_sync
from channels.layers import get_channel_layer
from django.db.models.signals import post_save
from django.dispatch import receiver

from .models import Invoice


@receiver(post_save, sender=Invoice)
def broadcast_invoice_change(sender, instance: Invoice, created: bool, **kwargs):
    channel_layer = get_channel_layer()
    event = {
        "type": "invoice_update",
        "data": {
            "id": instance.id,
            "number": instance.number,
            "status": instance.status,
            "amount": str(instance.amount),
            "supplier": str(instance.supplier),
            "created": created,
        },
    }
    async_to_sync(channel_layer.group_send)("invoices", event) 