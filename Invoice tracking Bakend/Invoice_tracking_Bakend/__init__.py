"""
Package for Invoice_tracking_Bakend.
"""
try:
    import pymysql  # type: ignore

    pymysql.install_as_MySQLdb()
except Exception:
    # PyMySQL not installed yet; ignore to allow project import
    pass

# Celery app autodiscovery when Django starts
from .celery import app as celery_app  # noqa: F401 