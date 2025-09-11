import React from 'react';
import { TrendingUp, TrendingDown, Minus, BarChart3, PieChart, Activity } from 'lucide-react';

interface AnalyticsMetric {
  id: string;
  name: string;
  value: string | number;
  change?: number;
  trend?: 'up' | 'down' | 'stable';
  type: 'currency' | 'percentage' | 'count' | 'time';
  period?: string;
}

interface AnalyticsWidgetProps {
  metrics: AnalyticsMetric[];
  title?: string;
  showChart?: boolean;
  chartType?: 'bar' | 'pie' | 'line';
  compact?: boolean;
}

export const AnalyticsWidget: React.FC<AnalyticsWidgetProps> = ({
  metrics,
  title = 'Analytics',
  showChart = false,
  chartType = 'bar',
  compact = false
}) => {
  const formatValue = (value: string | number, type: string) => {
    if (typeof value === 'number') {
      switch (type) {
        case 'currency':
          return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'EUR'
          }).format(value);
        case 'percentage':
          return `${value.toFixed(1)}%`;
        case 'count':
          return value.toLocaleString();
        case 'time':
          return `${value} days`;
        default:
          return value.toString();
      }
    }
    return value;
  };

  const getTrendIcon = (trend?: string) => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="w-4 h-4 text-green-600" />;
      case 'down':
        return <TrendingDown className="w-4 h-4 text-red-600" />;
      case 'stable':
        return <Minus className="w-4 h-4 text-gray-600" />;
      default:
        return null;
    }
  };

  const getTrendColor = (trend?: string) => {
    switch (trend) {
      case 'up':
        return 'text-green-600';
      case 'down':
        return 'text-red-600';
      case 'stable':
        return 'text-gray-600';
      default:
        return 'text-gray-900';
    }
  };

  const getChartIcon = () => {
    switch (chartType) {
      case 'bar':
        return <BarChart3 className="w-5 h-5 text-gray-400" />;
      case 'pie':
        return <PieChart className="w-5 h-5 text-gray-400" />;
      case 'line':
        return <Activity className="w-5 h-5 text-gray-400" />;
      default:
        return <BarChart3 className="w-5 h-5 text-gray-400" />;
    }
  };

  if (compact) {
    return (
      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <h3 className="text-sm font-medium text-gray-900 mb-3">{title}</h3>
        <div className="grid grid-cols-2 gap-3">
          {metrics.slice(0, 4).map((metric) => (
            <div key={metric.id} className="text-center">
              <p className="text-lg font-semibold text-gray-900">
                {formatValue(metric.value, metric.type)}
              </p>
              <p className="text-xs text-gray-500">{metric.name}</p>
              {metric.change !== undefined && (
                <div className={`flex items-center justify-center space-x-1 text-xs ${getTrendColor(metric.trend)}`}>
                  {getTrendIcon(metric.trend)}
                  <span>{metric.change > 0 ? '+' : ''}{metric.change}%</span>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-sm">
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
          {showChart && (
            <div className="flex items-center space-x-2">
              {getChartIcon()}
              <span className="text-sm text-gray-500 capitalize">{chartType} Chart</span>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {metrics.map((metric) => (
            <div key={metric.id} className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-start justify-between mb-2">
                <h4 className="text-sm font-medium text-gray-700">{metric.name}</h4>
                {getTrendIcon(metric.trend)}
              </div>
              
              <div className="mb-2">
                <p className="text-2xl font-bold text-gray-900">
                  {formatValue(metric.value, metric.type)}
                </p>
                {metric.period && (
                  <p className="text-xs text-gray-500">{metric.period}</p>
                )}
              </div>

              {metric.change !== undefined && (
                <div className={`flex items-center space-x-1 text-sm ${getTrendColor(metric.trend)}`}>
                  <span>
                    {metric.change > 0 ? '+' : ''}{metric.change}% from last period
                  </span>
                </div>
              )}
            </div>
          ))}
        </div>

        {showChart && (
          <div className="mt-6 pt-6 border-t border-gray-100">
            <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
              <div className="text-center">
                {getChartIcon()}
                <p className="text-sm text-gray-500 mt-2">
                  {chartType.charAt(0).toUpperCase() + chartType.slice(1)} chart visualization
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  Chart component integration needed
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
