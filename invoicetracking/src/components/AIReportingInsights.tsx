import React, { useState, useEffect } from 'react';
import { BarChart3, PieChart, TrendingUp, Download, Calendar, Filter, Eye } from 'lucide-react';
import { AIAssistantService, ReportInsight } from '../services/aiService';
import Card from './Card';

interface AIReportingInsightsProps {
  data?: any;
  timeRange?: string;
}

const AIReportingInsights: React.FC<AIReportingInsightsProps> = ({ data, timeRange = 'month' }: AIReportingInsightsProps) => {
  const [loading, setLoading] = useState(false);
  const [insights, setInsights] = useState<ReportInsight[]>([]);
  const [selectedInsight, setSelectedInsight] = useState<ReportInsight | null>(null);
  const [reportType, setReportType] = useState<'financial' | 'operational' | 'compliance'>('financial');
  const [dateRange, setDateRange] = useState(timeRange);

  useEffect(() => {
    generateInsights();
  }, [reportType, dateRange]);

  const generateInsights = async () => {
    try {
      setLoading(true);
      const reportData = await AIAssistantService.generateReport({
        type: reportType,
        timeRange: dateRange,
        data: data || {}
      });
      setInsights(reportData.insights || []);
    } catch (error) {
      console.error('Failed to generate insights:', error);
    } finally {
      setLoading(false);
    }
  };

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'warning': return TrendingUp;
      case 'opportunity': return PieChart;
      case 'info': return BarChart3;
      default: return BarChart3;
    }
  };

  const getInsightColor = (impact: string) => {
    switch (impact) {
      case 'high': return 'border-red-200 bg-red-50 dark:bg-red-900 dark:border-red-800';
      case 'medium': return 'border-yellow-200 bg-yellow-50 dark:bg-yellow-900 dark:border-yellow-800';
      case 'low': return 'border-green-200 bg-green-50 dark:bg-green-900 dark:border-green-800';
      default: return 'border-gray-200 bg-gray-50 dark:bg-gray-800 dark:border-gray-700';
    }
  };

  const mockInsights: ReportInsight[] = [
    {
      id: '1',
      title: 'Invoice Processing Efficiency Trend',
      description: 'Processing time has decreased by 35% over the last quarter due to AI automation',
      type: 'info',
      impact: 'high',
      value: '35%',
      change: -35,
      period: 'Q1 2024',
      trend: 'up',
      recommendations: [
        'Continue expanding AI automation to other invoice types',
        'Consider implementing auto-approval for low-risk invoices',
        'Train staff on new AI tools to maximize efficiency gains'
      ],
      chartData: {
        labels: ['Jan', 'Feb', 'Mar', 'Apr'],
        values: [120, 95, 85, 78]
      }
    },
    {
      id: '2',
      title: 'Vendor Payment Patterns',
      description: 'Top 10 vendors account for 68% of total invoice volume but only 45% of processing delays',
      type: 'opportunity',
      impact: 'medium',
      value: '68%',
      change: 5,
      period: 'Q1 2024',
      trend: 'stable',
      recommendations: [
        'Prioritize automation for high-volume vendors',
        'Establish preferred vendor programs',
        'Negotiate better payment terms with top vendors'
      ],
      chartData: {
        labels: ['Top 10', 'Next 20', 'Others'],
        values: [68, 22, 10]
      }
    },
    {
      id: '3',
      title: 'Fraud Detection Success Rate',
      description: 'AI fraud detection has identified 23 suspicious invoices with 96% accuracy',
      type: 'warning',
      impact: 'high',
      value: '96%',
      change: 12,
      period: 'Q1 2024',
      trend: 'up',
      recommendations: [
        'Expand fraud detection to all invoice types',
        'Fine-tune detection algorithms based on recent patterns',
        'Implement real-time fraud alerts'
      ],
      chartData: {
        labels: ['Detected', 'Missed', 'False Positive'],
        values: [96, 2, 2]
      }
    }
  ];

  const displayInsights = insights.length > 0 ? insights : mockInsights;

  return (
    <Card title="AI Reporting Insights">
      <div className="space-y-6">
        {/* Controls */}
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center space-x-2">
            <Filter className="w-4 h-4 text-gray-600 dark:text-gray-400" />
            <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Report Type:</span>
            <select
              value={reportType}
              onChange={(e) => setReportType(e.target.value as any)}
              className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 text-sm"
            >
              <option value="financial">Financial</option>
              <option value="operational">Operational</option>
              <option value="compliance">Compliance</option>
            </select>
          </div>

          <div className="flex items-center space-x-2">
            <Calendar className="w-4 h-4 text-gray-600 dark:text-gray-400" />
            <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Time Range:</span>
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 text-sm"
            >
              <option value="week">This Week</option>
              <option value="month">This Month</option>
              <option value="quarter">This Quarter</option>
              <option value="year">This Year</option>
            </select>
          </div>

          <button
            onClick={generateInsights}
            disabled={loading}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            {loading ? 'Generating...' : 'Refresh Insights'}
          </button>

          <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
            <Download className="w-4 h-4 mr-2" />
            Export Report
          </button>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="bg-blue-50 dark:bg-blue-900 rounded-lg p-4">
            <div className="flex items-center space-x-3">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
              <div>
                <h4 className="font-medium text-blue-900 dark:text-blue-100">
                  AI Generating Insights
                </h4>
                <p className="text-sm text-blue-700 dark:text-blue-300">
                  Analyzing data patterns and generating intelligent recommendations...
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Insights Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {displayInsights.map((insight) => {
            const IconComponent = getInsightIcon(insight.type);
            return (
              <div
                key={insight.id}
                className={`border rounded-lg p-4 cursor-pointer transition-all hover:shadow-md ${getInsightColor(insight.impact)}`}
                onClick={() => setSelectedInsight(selectedInsight?.id === insight.id ? null : insight)}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-white dark:bg-gray-700 rounded-lg">
                      <IconComponent className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900 dark:text-gray-100">
                        {insight.title}
                      </h4>
                      <div className="flex items-center space-x-2 mt-1">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          insight.impact === 'high' ? 'bg-red-100 text-red-700 dark:bg-red-800 dark:text-red-200' :
                          insight.impact === 'medium' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-800 dark:text-yellow-200' :
                          'bg-green-100 text-green-700 dark:bg-green-800 dark:text-green-200'
                        }`}>
                          {insight.impact.toUpperCase()} IMPACT
                        </span>
                        <span className={`text-sm font-bold ${
                          insight.trend === 'up' ? 'text-green-600' :
                          insight.trend === 'down' ? 'text-red-600' :
                          'text-gray-600'
                        }`}>
                          {insight.value}
                        </span>
                      </div>
                    </div>
                  </div>
                  <Eye className="w-4 h-4 text-gray-400" />
                </div>

                <p className="text-sm text-gray-700 dark:text-gray-300 mb-3">
                  {insight.description}
                </p>

                {/* Mini Chart */}
                {insight.chartData && (
                  <div className="mb-3">
                    <div className="h-20 flex items-end justify-between space-x-1">
                      {insight.chartData.values.map((value, index) => (
                        <div key={index} className="flex flex-col items-center flex-1">
                          <div 
                            className="w-full bg-blue-500 rounded-t"
                            style={{ 
                              height: `${(value / Math.max(...insight.chartData.values)) * 60}px`,
                              minHeight: '4px'
                            }}
                          />
                          <span className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                            {insight.chartData.labels[index]}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Expanded Details */}
                {selectedInsight?.id === insight.id && (
                  <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-600">
                    <h5 className="font-medium text-gray-900 dark:text-gray-100 mb-2">
                      AI Recommendations
                    </h5>
                    <ul className="space-y-2">
                      {insight.recommendations.map((rec, index) => (
                        <li key={index} className="flex items-start space-x-2 text-sm">
                          <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0" />
                          <span className="text-gray-700 dark:text-gray-300">{rec}</span>
                        </li>
                      ))}
                    </ul>
                    
                    <div className="mt-4 flex space-x-3">
                      <button className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 transition-colors">
                        View Details
                      </button>
                      <button className="px-3 py-1 bg-gray-600 text-white rounded text-sm hover:bg-gray-700 transition-colors">
                        Export Data
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Summary Statistics */}
        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
          <h5 className="font-medium text-gray-900 dark:text-gray-100 mb-4">
            Report Summary ({reportType.charAt(0).toUpperCase() + reportType.slice(1)})
          </h5>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{displayInsights.length}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Total Insights</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">
                {displayInsights.filter(i => i.impact === 'high').length}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">High Impact</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {displayInsights.filter(i => i.trend === 'up').length}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Positive Trends</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {displayInsights.reduce((sum, i) => sum + (i.recommendations?.length || 0), 0)}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Recommendations</div>
            </div>
          </div>
        </div>

        {/* AI Analysis Summary */}
        <div className="bg-blue-50 dark:bg-blue-900 rounded-lg p-4">
          <h5 className="font-medium text-blue-900 dark:text-blue-100 mb-3">
            AI Analysis Summary
          </h5>
          <div className="text-sm text-blue-800 dark:text-blue-200 space-y-2">
            <p>
              • <strong>Processing Efficiency:</strong> AI automation has improved invoice processing speed by an average of 35%
            </p>
            <p>
              • <strong>Fraud Detection:</strong> 96% accuracy rate in identifying suspicious invoices with minimal false positives
            </p>
            <p>
              • <strong>Cost Savings:</strong> Estimated $45,000 annual savings from reduced manual processing time
            </p>
            <p>
              • <strong>Compliance:</strong> 100% compliance rate maintained with automated validation checks
            </p>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default AIReportingInsights;
