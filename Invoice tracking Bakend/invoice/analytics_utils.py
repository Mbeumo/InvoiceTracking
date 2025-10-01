# invoices/analytics_utils.py
from django.db.models import Sum, Value, F
from django.db.models.functions import Coalesce, TruncMonth
from django.utils import timezone
from datetime import timedelta, date
from decimal import Decimal

from .models import Invoice

def upcoming_cashflow_total(days=30):
    today = timezone.localdate()
    end = today + timedelta(days=days)
    qs = Invoice.objects.filter(due_date__range=(today, end)).exclude(status=Invoice.Status.PAID)
    qs = qs.annotate(value=Coalesce('base_currency_amount', 'total_amount'))
    total = qs.aggregate(total_due=Coalesce(Sum('value'), Decimal('0')))['total_due'] or Decimal('0')
    return float(total)

def monthly_totals_last_n_months(months=6):
    """
    Returns list of {'month': '2025-09', 'total': 1234.5}
    """
    today = timezone.localdate()
    start_month = (today.replace(day=1) - timedelta(days=30*(months-1))).replace(day=1)
    qs = Invoice.objects.filter(invoice_date__gte=start_month)
    qs = qs.annotate(month=TruncMonth('invoice_date')).annotate(value=Coalesce('base_currency_amount', 'total_amount'))
    monthly = (qs.values('month')
                 .annotate(total=Coalesce(Sum('value'), 0))
                 .order_by('month'))
    # Convert to list of dicts
    result = []
    for row in monthly:
        m = row['month']
        total = row['total'] or 0
        result.append({'month': m.strftime('%Y-%m'), 'total': float(total)})
    return result

def monthly_growth_percentage(monthly_list):
    """
    Given monthly_list from monthly_totals_last_n_months (ordered oldest->newest),
    return list with growth% for each month compared to previous.
    """
    growth = []
    prev = None
    for entry in monthly_list:
        cur = entry['total']
        if prev is None:
            pct = None
        else:
            if prev == 0:
                pct = None
            else:
                pct = ((cur - prev) / prev) * 100
        growth.append({'month': entry['month'], 'total': entry['total'], 'growth_pct': pct})
        prev = cur
    return growth

def top_vendors(limit=5):
    qs = Invoice.objects.all().annotate(value=Coalesce('base_currency_amount', 'total_amount'))
    vendors = (qs.values('vendor_name')
               .annotate(total=Coalesce(Sum('value'), 0))
               .order_by('-total')[:limit])
    return [{'vendor_name': v['vendor_name'], 'total': float(v['total'] or 0)} for v in vendors]

def risk_alerts(threshold=0.8, limit=20):
    """
    returns invoices with ai_risk_score >= threshold, sorted desc
    """
    qs = Invoice.objects.filter(ai_risk_score__gte=threshold).order_by('-ai_risk_score')[:limit]
    # Return minimal fields for alerting
    return [
        {
            'id': inv.id,
            'vendor_name': inv.vendor_name,
            'number': inv.number,
            'total_amount': float((inv.base_currency_amount or inv.total_amount) or 0),
            'ai_risk_score': float(inv.ai_risk_score or 0),
            'due_date': inv.due_date.isoformat() if inv.due_date else None,
            'status': inv.status
        }
        for inv in qs
    ]
