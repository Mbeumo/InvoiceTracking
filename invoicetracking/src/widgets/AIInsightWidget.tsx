import React from 'react';
import { Brain, TrendingUp, TrendingDown, AlertTriangle, Info, Lightbulb, BarChart3 } from 'lucide-react';
import { ReportInsight } from '../services/aiService';

interface AIInsightWidgetProps {
  insights: ReportInsight[];
  onInsightClick?: (insight: ReportInsight) => void;
  showRecommendations?: boolean;
  compact?: boolean;
  maxItems?: number;
}

export const AIInsightWidget: React.FC<AIInsightWidgetProps> = ({
  insights,
  onInsightClick,
  showRecommendations = true,
  compact = false,
  maxItems = 3
}) => {
  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-yellow-600" />;
      case 'opportunity':
        return <Lightbulb className="w-5 h-5 text-green-600" />;
      case 'info':
        return <Info className="w-5 h-5 text-blue-600" />;
      default:
        return <Brain className="w-5 h-5 text-purple-600" />;
    }
  };

  const getInsightColor = (type: string) => {
    switch (type) {
      case 'warning':
        return 'bg-yellow-50 border-yellow-200';
      case 'opportunity':
        return 'bg-green-50 border-green-200';
      case 'info':
        return 'bg-blue-50 border-blue-200';
      default:
        return 'bg-purple-50 border-purple-200';
    }
  };

  const getImpactBadge = (impact?: string) => {
    switch (impact) {
      case 'high':
        return 'bg-red-100 text-red-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'low':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getTrendIcon = (trend?: string) => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="w-4 h-4 text-green-600" />;
      case 'down':
        return <TrendingDown className="w-4 h-4 text-red-600" />;
      default:
        return null;
    }
  };

  const displayInsights = insights.slice(0, maxItems);

  if (compact) {
    return (
      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <div className="flex items-center space-x-2 mb-3">
          <Brain className="w-5 h-5 text-purple-600" />
          <h3 className="text-sm font-medium text-gray-900">AI Insights</h3>
        </div>
        <div className="space-y-2">
          {displayInsights.map((insight) => (
            <div
              key={insight.id}
              className={`p-3 rounded-lg border cursor-pointer hover:shadow-sm transition-shadow ${getInsightColor(insight.type)}`}
              onClick={() => onInsightClick?.(insight)}
            >
              <div className="flex items-start space-x-2">
                {getInsightIcon(insight.type)}
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-medium text-gray-900 line-clamp-1">
                    {insight.title}
                  </h4>
                  <p className="text-xs text-gray-600 line-clamp-2 mt-1">
                    {insight.description}
                  </p>
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-sm font-semibold text-gray-900">
                      {insight.value}
                    </span>
                    <div className="flex items-center space-x-1">
                      {getTrendIcon(insight.trend)}
                      {insight.impact && (
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getImpactBadge(insight.impact)}`}>
                          {insight.impact}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-sm">
      <div className="p-6">
        <div className="flex items-center space-x-2 mb-6">
          <Brain className="w-6 h-6 text-purple-600" />
          <h3 className="text-lg font-semibold text-gray-900">AI Insights</h3>
          <span className="text-sm text-gray-500">({insights.length} insights)</span>
        </div>

        <div className="space-y-6">
          {displayInsights.map((insight) => (
            <div
              key={insight.id}
              className={`p-5 rounded-lg border cursor-pointer hover:shadow-md transition-shadow ${getInsightColor(insight.type)}`}
              onClick={() => onInsightClick?.(insight)}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-start space-x-3">
                  {getInsightIcon(insight.type)}
                  <div>
                    <h4 className="text-lg font-medium text-gray-900">
                      {insight.title}
                    </h4>
                    <p className="text-sm text-gray-600 mt-1">
                      {insight.period}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  {insight.impact && (
                    <span className={`px-3 py-1 text-sm font-medium rounded-full ${getImpactBadge(insight.impact)}`}>
                      {insight.impact} impact
                    </span>
                  )}
                  <div className="text-right">
                    <div className="flex items-center space-x-1">
                      <span className="text-2xl font-bold text-gray-900">
                        {insight.value}
                      </span>
                      {getTrendIcon(insight.trend)}
                    </div>
                    {insight.change !== undefined && (
                      <span className={`text-sm font-medium ${
                        insight.change > 0 ? 'text-green-600' : insight.change < 0 ? 'text-red-600' : 'text-gray-600'
                      }`}>
                        {insight.change > 0 ? '+' : ''}{insight.change}%
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <p className="text-gray-700 mb-4">
                {insight.description}
              </p>

              {insight.chartData && (
                <div className="mb-4">
                  <div className="h-32 bg-gray-100 rounded-lg flex items-center justify-center">
                    <div className="text-center">
                      <BarChart3 className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                      <p className="text-sm text-gray-500">Chart visualization</p>
                      <p className="text-xs text-gray-400">
                        {insight.chartData.labels.length} data points
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {showRecommendations && insight.recommendations.length > 0 && (
                <div className="border-t border-gray-200 pt-4">
                  <h5 className="text-sm font-medium text-gray-900 mb-2 flex items-center">
                    <Lightbulb className="w-4 h-4 text-yellow-500 mr-1" />
                    Recommendations
                  </h5>
                  <ul className="space-y-1">
                    {insight.recommendations.slice(0, 3).map((recommendation, index) => (
                      <li key={index} className="text-sm text-gray-600 flex items-start">
                        <span className="text-gray-400 mr-2">•</span>
                        {recommendation}
                      </li>
                    ))}
                  </ul>
                  {insight.recommendations.length > 3 && (
                    <p className="text-xs text-gray-500 mt-2">
                      +{insight.recommendations.length - 3} more recommendations
                    </p>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>

        {insights.length > maxItems && (
          <div className="mt-6 text-center">
            <button className="text-sm text-blue-600 hover:text-blue-800 font-medium">
              View all {insights.length} insights
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
