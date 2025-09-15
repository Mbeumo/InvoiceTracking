"""
Management command to set up AI system with default configurations
"""
from django.core.management.base import BaseCommand
from django.utils import timezone
from invoice.models import SystemConfiguration, WorkflowRule, Service
import uuid


class Command(BaseCommand):
    help = 'Set up AI system with default configurations and workflow rules'

    def handle(self, *args, **options):
        self.stdout.write('Setting up AI system...')
        
        # Create default system configurations
        self.create_system_configurations()
        
        # Create default services if they don't exist
        self.create_default_services()
        
        # Create default workflow rules
        self.create_workflow_rules()
        
        self.stdout.write(
            self.style.SUCCESS('AI system setup completed successfully!')
        )

    def create_system_configurations(self):
        """Create default system configurations"""
        configs = [
            {
                'key': 'ai_ocr_enabled',
                'value': 'true',
                'setting_type': 'boolean',
                'description': 'Enable AI-powered OCR processing',
                'category': 'ai'
            },
            {
                'key': 'ai_fraud_detection_enabled',
                'value': 'true',
                'setting_type': 'boolean',
                'description': 'Enable AI fraud detection',
                'category': 'ai'
            },
            {
                'key': 'ai_anomaly_threshold',
                'value': '70',
                'setting_type': 'integer',
                'description': 'Anomaly detection threshold (0-100)',
                'category': 'ai'
            },
            {
                'key': 'reminder_days_before',
                'value': '[7, 3, 1]',
                'setting_type': 'json',
                'description': 'Days before due date to send reminders',
                'category': 'notifications'
            },
            {
                'key': 'auto_approval_threshold',
                'value': '1000',
                'setting_type': 'float',
                'description': 'Maximum amount for auto-approval (EUR)',
                'category': 'workflow'
            },
            {
                'key': 'high_priority_threshold',
                'value': '5000',
                'setting_type': 'float',
                'description': 'Amount threshold for high priority (EUR)',
                'category': 'workflow'
            },
            {
                'key': 'notification_channels',
                'value': '["email", "in_app"]',
                'setting_type': 'json',
                'description': 'Enabled notification channels',
                'category': 'notifications'
            },
            {
                'key': 'backup_retention_days',
                'value': '90',
                'setting_type': 'integer',
                'description': 'Number of days to retain backups',
                'category': 'security'
            },
            {
                'key': 'audit_log_retention_days',
                'value': '365',
                'setting_type': 'integer',
                'description': 'Number of days to retain audit logs',
                'category': 'security'
            },
            {
                'key': 'encryption_enabled',
                'value': 'true',
                'setting_type': 'boolean',
                'description': 'Enable data encryption at rest',
                'category': 'security'
            }
        ]
        
        for config in configs:
            obj, created = SystemConfiguration.objects.get_or_create(
                key=config['key'],
                defaults=config
            )
            if created:
                self.stdout.write(f'Created configuration: {config["key"]}')
            else:
                self.stdout.write(f'Configuration exists: {config["key"]}')

    def create_default_services(self):
        """Create default services if they don't exist"""
        services = [
            {
                'id': 'accounting',
                'name': 'Comptabilité',
                'code': 'ACC',
                'description': 'Service de comptabilité et finances',
                'color': '#3b82f6',
                'icon': 'calculator',
                'can_create_invoices': True,
                'can_approve_invoices': True,
                'approval_threshold': 5000.00,
                'requires_manager_approval': False,
                'default_currency': 'EUR',
                'payment_terms': 30,
                'cost_center': 'CC001'
            },
            {
                'id': 'purchasing',
                'name': 'Achats',
                'code': 'PUR',
                'description': 'Service des achats et approvisionnements',
                'color': '#10b981',
                'icon': 'shopping-cart',
                'can_create_invoices': True,
                'can_approve_invoices': False,
                'approval_threshold': 1000.00,
                'requires_manager_approval': True,
                'default_currency': 'EUR',
                'payment_terms': 30,
                'cost_center': 'CC002'
            },
            {
                'id': 'finance',
                'name': 'Finance',
                'code': 'FIN',
                'description': 'Service financier et trésorerie',
                'color': '#f59e0b',
                'icon': 'trending-up',
                'can_create_invoices': True,
                'can_approve_invoices': True,
                'approval_threshold': 10000.00,
                'requires_manager_approval': False,
                'default_currency': 'EUR',
                'payment_terms': 30,
                'cost_center': 'CC003'
            }
        ]
        
        for service_data in services:
            obj, created = Service.objects.get_or_create(
                id=service_data['id'],
                defaults=service_data
            )
            if created:
                self.stdout.write(f'Created service: {service_data["name"]}')
            else:
                self.stdout.write(f'Service exists: {service_data["name"]}')

    def create_workflow_rules(self):
        """Create default workflow automation rules"""
        rules = [
            {
                'name': 'Auto-approve low amounts',
                'description': 'Automatically approve invoices under €1000 from known vendors',
                'trigger_type': 'amount_threshold',
                'trigger_conditions': {
                    'threshold': 1000,
                    'operator': 'lte'
                },
                'action_type': 'auto_approve',
                'action_parameters': {
                    'require_known_vendor': True
                },
                'priority': 1
            },
            {
                'name': 'High priority for large amounts',
                'description': 'Set high priority for invoices over €5000',
                'trigger_type': 'amount_threshold',
                'trigger_conditions': {
                    'threshold': 5000,
                    'operator': 'gte'
                },
                'action_type': 'set_priority',
                'action_parameters': {
                    'priority': 'high'
                },
                'priority': 2
            },
            {
                'name': 'Manager approval for anomalies',
                'description': 'Require manager approval for invoices with anomalies',
                'trigger_type': 'anomaly_detected',
                'trigger_conditions': {
                    'risk_threshold': 50
                },
                'action_type': 'require_approval',
                'action_parameters': {
                    'approval_level': 'manager'
                },
                'priority': 3
            }
        ]
        
        for rule_data in rules:
            rule_data['id'] = str(uuid.uuid4())
            
            obj, created = WorkflowRule.objects.get_or_create(
                name=rule_data['name'],
                defaults=rule_data
            )
            if created:
                self.stdout.write(f'Created workflow rule: {rule_data["name"]}')
            else:
                self.stdout.write(f'Workflow rule exists: {rule_data["name"]}')