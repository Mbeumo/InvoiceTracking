import os

from celery import Celery

app = Celery("Invoice_tracking_Backend")
app.config_from_object("django.conf:settings", namespace="CELERY")
app.autodiscover_tasks() 