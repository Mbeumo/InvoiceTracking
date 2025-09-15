"""
Management command to run AI tasks manually for testing and maintenance
"""
from django.core.management.base import BaseCommand
from django.utils import timezone
from invoice.tasks import (
    send_automated_reminders,
    run_workflow_automation,
    generate_predictive_insights,
    cleanup_old_data
)


class Command(BaseCommand):
    help = 'Run AI tasks manually for testing and maintenance'

    def add_arguments(self, parser):
        parser.add_argument(
            '--task',
            type=str,
            choices=['reminders', 'workflow', 'insights', 'cleanup', 'all'],
            default='all',
            help='Specific task to run'
        )

    def handle(self, *args, **options):
        task = options['task']
        
        self.stdout.write(f'Running AI task: {task}')
        start_time = timezone.now()
        
        if task == 'reminders' or task == 'all':
            self.stdout.write('Running automated reminders...')
            result = send_automated_reminders()
            self.stdout.write(f'Reminders result: {result}')
        
        if task == 'workflow' or task == 'all':
            self.stdout.write('Running workflow automation...')
            result = run_workflow_automation()
            self.stdout.write(f'Workflow result: {result}')
        
        if task == 'insights' or task == 'all':
            self.stdout.write('Generating predictive insights...')
            result = generate_predictive_insights()
            self.stdout.write(f'Insights result: {result}')
        
        if task == 'cleanup' or task == 'all':
            self.stdout.write('Running data cleanup...')
            result = cleanup_old_data()
            self.stdout.write(f'Cleanup result: {result}')
        
        duration = timezone.now() - start_time
        self.stdout.write(
            self.style.SUCCESS(f'AI tasks completed in {duration.total_seconds():.2f} seconds')
        )