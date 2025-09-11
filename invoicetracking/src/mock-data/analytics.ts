export const mockAnalyticsMetrics = [
  {
    id: 'metric-1',
    metricName: 'total_invoices',
    metricValue: 1247,
    metricType: 'count',
    dimensionFilters: { service: 'all', period: 'monthly' },
    timePeriod: 'monthly',
    periodStart: '2024-01-01',
    periodEnd: '2024-01-31',
    calculatedAt: '2024-02-01T00:00:00Z'
  },
  {
    id: 'metric-2',
    metricName: 'total_amount',
    metricValue: 2456789.50,
    metricType: 'sum',
    dimensionFilters: { currency: 'EUR', period: 'monthly' },
    timePeriod: 'monthly',
    periodStart: '2024-01-01',
    periodEnd: '2024-01-31',
    calculatedAt: '2024-02-01T00:00:00Z'
  },
  {
    id: 'metric-3',
    metricName: 'avg_processing_time',
    metricValue: 3.2,
    metricType: 'average',
    dimensionFilters: { status: 'completed', period: 'monthly' },
    timePeriod: 'monthly',
    periodStart: '2024-01-01',
    periodEnd: '2024-01-31',
    calculatedAt: '2024-02-01T00:00:00Z'
  }
];

export const mockDashboardStats = {
  totalInvoices: 1247,
  pendingApproval: 23,
  overdue: 8,
  totalAmount: 2456789.50,
  avgProcessingTime: 3.2,
  fraudDetected: 2,
  automationRate: 87.5
};
