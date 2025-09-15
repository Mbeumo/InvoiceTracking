"""
Django settings for Invoice_tracking_Bakend project.

Based on 'django-admin startproject' using Django 2.1.2.

For more information on this file, see
https://docs.djangoproject.com/en/2.1/topics/settings/

For the full list of settings and their values, see
https://docs.djangoproject.com/en/2.1/ref/settings/
"""

import os
import posixpath
from pathlib import Path
from datetime import timedelta

from environs import Env

env = Env()
env.read_env()
# Build paths inside the project like this: os.path.join(BASE_DIR, ...)
BASE_DIR = Path(__file__).resolve().parent.parent
# Quick-start development settings - unsuitable for production
# See https://docs.djangoproject.com/en/2.1/howto/deployment/checklist/

# SECURITY WARNING: keep the secret key used in production secret!
SECRET_KEY = env.str("SECRET_KEY")

# SECURITY WARNING: don't run with debug turned on in production!
DEBUG = env.bool("DEBUG")
ALLOWED_HOSTS = env.list("ALLOWED_HOSTS")

# Database
DB_NAME = env.str("DB_NAME")
DB_USER = env.str("DB_USER")
DB_PASSWORD = env.str("DB_PASSWORD")
DB_HOST = env.str("DB_HOST")
DB_PORT = env.str("DB_PORT")

# Redis
REDIS_URL = env.str("REDIS_URL")

# Email
EMAIL_HOST = env.str("EMAIL_HOST")
EMAIL_PORT = env.int("EMAIL_PORT")
EMAIL_HOST_USER = env.str("EMAIL_HOST_USER")
EMAIL_HOST_PASSWORD = env.str("EMAIL_HOST_PASSWORD")
EMAIL_USE_TLS = env.bool("EMAIL_USE_TLS")
DEFAULT_FROM_EMAIL = env.str("DEFAULT_FROM_EMAIL")
# https://docs.djangoproject.com/en/2.1/ref/settings/#std:setting-INSTALLED_APPS
INSTALLED_APPS = [
    'app',
    'rest_framework_simplejwt.token_blacklist',
    'django_celery_beat',
    'django_celery_results',
    # Add your apps here to enable them
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'auditlog',
    # Third-party
    'rest_framework',
    'rest_framework.authtoken',
    'corsheaders',
    'drf_spectacular',
    'django_filters',
    'channels',
    # Local apps
    'users',
    'invoice',
    # 'invoices',
    # 'notifications',
    # 'analytics',
    # 'integrations',
    
]

# Middleware framework
# https://docs.djangoproject.com/en/2.1/topics/http/middleware/
MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',  # ADD THIS LINE
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
    # 'auditlog.middleware.AuditLogMiddleware',

]

ROOT_URLCONF = 'Invoice_tracking_Bakend.urls'
# Template configuration
# https://docs.djangoproject.com/en/2.1/topics/templates/
TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [BASE_DIR / 'templates'],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

WSGI_APPLICATION = 'Invoice_tracking_Bakend.wsgi.application'
ASGI_APPLICATION = 'Invoice_tracking_Bakend.asgi.application'

# Database
# https://docs.djangoproject.com/en/2.1/ref/settings/#databases
DATABASES = {
     'default': {
        'ENGINE': 'django.db.backends.mysql',
        'NAME': DB_NAME,
        'USER': DB_USER,
        'PASSWORD': DB_PASSWORD,
        'HOST': DB_HOST,
        'PORT': DB_PORT,
        'OPTIONS': {
            'init_command': "SET sql_mode='STRICT_TRANS_TABLES'",
        },
        "ATOMIC_REQUESTS": True,
    },
    'Sqlite': {
        'ENGINE': 'django.db.backends.sqlite3',
        'NAME': os.path.join(BASE_DIR, 'db.sqlite3'),
    }
}
# Password validation
# https://docs.djangoproject.com/en/2.1/ref/settings/#auth-password-validators
AUTH_PASSWORD_VALIDATORS = [
    {
        'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator',
    },
]
AUTH_USER_MODEL = "users.User"
# APPEND_SLASH = False
# Internationalization
# https://docs.djangoproject.com/en/2.1/topics/i18n/
LANGUAGE_CODE = 'en-us'
TIME_ZONE = 'UTC'
USE_I18N = True
USE_L10N = True
USE_TZ = True

# Static files (CSS, JavaScript, Images)
# https://docs.djangoproject.com/en/2.1/howto/static-files/
STATIC_URL = '/static/'
STATIC_DIR = BASE_DIR / 'static'
STATICFILES_DIRS = [STATIC_DIR] if STATIC_DIR.exists() else []
STATIC_ROOT = posixpath.join(*(str(BASE_DIR).split(os.path.sep) + ['staticfiles']))

# Media files
MEDIA_URL = '/media/'
MEDIA_ROOT = BASE_DIR / 'media'

# DRF
REST_FRAMEWORK = {
    "DEFAULT_AUTHENTICATION_CLASSES": (
        "rest_framework_simplejwt.authentication.JWTAuthentication",
    ),
    "DEFAULT_PERMISSION_CLASSES": (
        "rest_framework.permissions.IsAuthenticated",
    ),
    "DEFAULT_SCHEMA_CLASS": "drf_spectacular.openapi.AutoSchema",
    "DEFAULT_FILTER_BACKENDS": (
        "django_filters.rest_framework.DjangoFilterBackend",
        "rest_framework.filters.SearchFilter",
        "rest_framework.filters.OrderingFilter",
    ),
}

SIMPLE_JWT = {
    "ACCESS_TOKEN_LIFETIME": timedelta(minutes=60),
    "REFRESH_TOKEN_LIFETIME": timedelta(days=7),
    "ROTATE_REFRESH_TOKENS": True,
    "BLACKLIST_AFTER_ROTATION": True,
    "AUTH_HEADER_TYPES": ("Bearer",),
}

# CORS / CSRF
TIME_ZONE = env.str("TIME_ZONE")
CORS_ALLOWED_ORIGINS = env.list("CORS_ALLOWED_ORIGINS")
CSRF_TRUSTED_ORIGINS = env.list("CSRF_TRUSTED_ORIGINS")
CORS_ALLOW_CREDENTIALS = True
# In development, allow any origin (use configured origins in production)
# if DEBUG:
    # CORS_ALLOW_ALL_ORIGINS = True

# Channels
CHANNEL_LAYERS = {
    "default": {
        "BACKEND": "channels.layers.InMemoryChannelLayer",
    }
}

# Celery
CELERY_BROKER_URL = REDIS_URL
CELERY_RESULT_BACKEND = REDIS_URL
CELERY_RESULT_BACKEND_DB = 'django-db'
CELERY_TIMEZONE = TIME_ZONE
CELERY_TASK_TRACK_STARTED = True
CELERY_TASK_TIME_LIMIT = 30 * 60
CELERY_BEAT_SCHEDULER = 'django_celery_beat.schedulers:DatabaseScheduler'

# Celery Beat Schedule for automated tasks
from celery.schedules import crontab
CELERY_BEAT_SCHEDULE = {
    'send-automated-reminders': {
        'task': 'invoice.tasks.send_automated_reminders',
        'schedule': crontab(hour=9, minute=0),  # Daily at 9 AM
    },
    'run-workflow-automation': {
        'task': 'invoice.tasks.run_workflow_automation',
        'schedule': crontab(minute='*/15'),  # Every 15 minutes
    },
    'generate-predictive-insights': {
        'task': 'invoice.tasks.generate_predictive_insights',
        'schedule': crontab(hour=6, minute=0),  # Daily at 6 AM
    },
    'cleanup-old-data': {
        'task': 'invoice.tasks.cleanup_old_data',
        'schedule': crontab(hour=2, minute=0, day_of_week=0),  # Weekly on Sunday at 2 AM
    },
}

# Email
EMAIL_BACKEND = "django.core.mail.backends.smtp.EmailBackend"
EMAIL_HOST = EMAIL_HOST
EMAIL_PORT = EMAIL_PORT
EMAIL_HOST_USER = EMAIL_HOST_USER
EMAIL_HOST_PASSWORD = EMAIL_HOST_PASSWORD
EMAIL_USE_TLS = EMAIL_USE_TLS
DEFAULT_FROM_EMAIL = EMAIL_HOST_USER # or "no-reply@invoicetracker.local"

# API Docs
SPECTACULAR_SETTINGS = {
    "TITLE": "InvoiceTracker API",
    "DESCRIPTION": "API for invoice tracking, OCR, reminders, analytics, and integrations.",
    "VERSION": "1.0.0",
    "SERVE_INCLUDE_SCHEMA": False,
}

# Security
SECURE_CONTENT_TYPE_NOSNIFF = True
SECURE_BROWSER_XSS_FILTER = True
SESSION_COOKIE_HTTPONLY = True
CSRF_COOKIE_HTTPONLY = False
X_FRAME_OPTIONS = "DENY"

DEFAULT_AUTO_FIELD = "django.db.models.BigAutoField" 

# AI and ML Configuration
AI_SETTINGS = {
    'OCR_ENABLED': env.bool('AI_OCR_ENABLED', True),
    'FRAUD_DETECTION_ENABLED': env.bool('AI_FRAUD_DETECTION_ENABLED', True),
    'ANOMALY_THRESHOLD': env.int('AI_ANOMALY_THRESHOLD', 70),
    'AUTO_APPROVAL_THRESHOLD': env.float('AI_AUTO_APPROVAL_THRESHOLD', 1000.0),
    'MODEL_UPDATE_INTERVAL': env.int('AI_MODEL_UPDATE_INTERVAL', 7),  # days
}

# Security Configuration
SECURITY_SETTINGS = {
    'AUDIT_LOG_RETENTION_DAYS': env.int('AUDIT_LOG_RETENTION_DAYS', 365),
    'FAILED_LOGIN_THRESHOLD': env.int('FAILED_LOGIN_THRESHOLD', 5),
    'ACCOUNT_LOCKOUT_DURATION': env.int('ACCOUNT_LOCKOUT_DURATION', 30),  # minutes
    'SESSION_TIMEOUT': env.int('SESSION_TIMEOUT', 30),  # minutes
    'REQUIRE_2FA_FOR_ADMIN': env.bool('REQUIRE_2FA_FOR_ADMIN', False),
}

# Notification Configuration
NOTIFICATION_SETTINGS = {
    'EMAIL_ENABLED': env.bool('NOTIFICATIONS_EMAIL_ENABLED', True),
    'SMS_ENABLED': env.bool('NOTIFICATIONS_SMS_ENABLED', False),
    'PUSH_ENABLED': env.bool('NOTIFICATIONS_PUSH_ENABLED', True),
    'REMINDER_DAYS_BEFORE': env.list('REMINDER_DAYS_BEFORE', default=[7, 3, 1]),
    'MAX_NOTIFICATIONS_PER_USER': env.int('MAX_NOTIFICATIONS_PER_USER', 100),
}

# Performance Configuration
CACHES = {
    'default': {
        'BACKEND': 'django_redis.cache.RedisCache',
        'LOCATION': REDIS_URL,
        'OPTIONS': {
            'CLIENT_CLASS': 'django_redis.client.DefaultClient',
        },
        'KEY_PREFIX': 'invoice_tracker',
        'TIMEOUT': 300,  # 5 minutes default
    }
}

# Frontend URL for email links
FRONTEND_URL = env.str('FRONTEND_URL', 'http://localhost:3000')

# File Upload Configuration
FILE_UPLOAD_MAX_MEMORY_SIZE = 10 * 1024 * 1024  # 10MB
DATA_UPLOAD_MAX_MEMORY_SIZE = 10 * 1024 * 1024  # 10MB

# Logging Configuration
LOGGING = {
    'version': 1,
    'disable_existing_loggers': False,
    'formatters': {
        'verbose': {
            'format': '{levelname} {asctime} {module} {process:d} {thread:d} {message}',
            'style': '{',
        },
        'simple': {
            'format': '{levelname} {message}',
            'style': '{',
        },
    },
    'handlers': {
        'file': {
            'level': 'INFO',
            'class': 'logging.FileHandler',
            'filename': os.path.join(BASE_DIR, 'logs', 'invoice_tracker.log'),
            'formatter': 'verbose',
        },
        'console': {
            'level': 'DEBUG',
            'class': 'logging.StreamHandler',
            'formatter': 'simple',
        },
    },
    'loggers': {
        'invoice': {
            'handlers': ['file', 'console'],
            'level': 'INFO',
            'propagate': True,
        },
        'users': {
            'handlers': ['file', 'console'],
            'level': 'INFO',
            'propagate': True,
        },
    },
}

# Create logs directory
os.makedirs(os.path.join(BASE_DIR, 'logs'), exist_ok=True)