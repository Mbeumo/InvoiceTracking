import os

from celery import Celery
from django.conf import settings

app = Celery("Invoice_tracking_Backend")
app.config_from_object("django.conf:settings", namespace="CELERY")
app.autodiscover_tasks() 

# Configure Celery Beat for scheduled tasks
app.conf.beat_schedule = {
    'send-automated-reminders': {
        'task': 'invoice.tasks.send_automated_reminders',
        'schedule': 60.0 * 60.0 * 24.0,  # Daily
    },
    'run-workflow-automation': {
        'task': 'invoice.tasks.run_workflow_automation',
        'schedule': 60.0 * 15.0,  # Every 15 minutes
    },
    'generate-predictive-insights': {
        'task': 'invoice.tasks.generate_predictive_insights',
        'schedule': 60.0 * 60.0 * 6.0,  # Every 6 hours
    },
}

app.conf.timezone = 'UTC'