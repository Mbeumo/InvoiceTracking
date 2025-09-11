import React, { useState, useEffect } from 'react';
import { TrendingUp, Calendar, DollarSign, AlertTriangle, Target, BarChart3 } from 'lucide-react';
import { PredictiveAnalyticsService, PredictionResult } from '../services/aiService';
import Card from './Card';

interface AIPredictiveAnalyticsProps {
  invoiceData?: any;
}

const AIPredictiveAnalytics: React.FC<AIPredictiveAnalyticsProps> = ({ invoiceData }) => {
  const [loading, setLoading] = useState(false);
  const [predictions, setPredictions] = useState<{
    paymentDelay?: PredictionResult;
    cashFlow?: any;
    expenseForecast?: PredictionResult;
    budgetOptimization?: any;
  }>({});
  const [activeMetric, setActiveMetric] = useState<'payment' | 'cashflow' | 'expenses' | 'budget'>('payment');

  useEffect(() => {
    if (invoiceData) {
      loadPredictions();
    }
  }, [invoiceData]);

  const loadPredictions = async () => {
    try {
      setLoading(true);
      
      // Load multiple predictions in parallel
      const [paymentDelay, cashFlow, expenseForecast] = await Promise.all([
        PredictiveAnalyticsService.predictPaymentDelay(invoiceData),
        PredictiveAnalyticsService.forecastCashFlow({ timeframe: 'month' }),
        PredictiveAnalyticsService.forecastExpenses({ timeframe: 'quarter' })
      ]);

      setPredictions({
        paymentDelay,
        cashFlow,
        expenseForecast
      });
    } catch (error) {
      console.error('Failed to load predictions:', error);
    } finally {
      setLoading(false);
    }
  };

  const getDelayRiskColor = (riskLevel: number) => {
    if (riskLevel < 30) return 'text-green-600 bg-green-100 dark:bg-green-900';
    if (riskLevel < 70) return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900';
    return 'text-red-600 bg-red-100 dark:bg-red-900';
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  return (
    <Card title="AI Predictive Analytics">
      <div className="space-y-6">
        {/* Metric Selector */}
        <div className="flex flex-wrap gap-2">
          {[
            { id: 'payment', label: 'Payment Delays', icon: Calendar },
            { id: 'cashflow', label: 'Cash Flow', icon: DollarSign },
            { id: 'expenses', label: 'Expense Forecast', icon: TrendingUp },
            { id: 'budget', label: 'Budget Optimization', icon: Target }
          ].map((metric) => {
            const Icon = metric.icon;
            return (
              <button
                key={metric.id}
                onClick={() => setActiveMetric(metric.id as any)}
                className={`flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  activeMetric === metric.id
                    ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-200'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-400 dark:hover:bg-gray-600'
                }`}
              >
                <Icon className="w-4 h-4 mr-2" />
                {metric.label}
              </button>
            );
          })}
        </div>

        {loading && (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-3 text-gray-600 dark:text-gray-400">Generating AI predictions...</span>
          </div>
        )}

        {/* Payment Delay Prediction */}
        {activeMetric === 'payment' && predictions.paymentDelay && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className={`rounded-lg p-4 ${getDelayRiskColor(predictions.paymentDelay.prediction)}`}>
                <div className="flex items-center space-x-3">
                  <AlertTriangle className="w-6 h-6" />
                  <div>
                    <h4 className="font-medium">Delay Risk</h4>
                    <p className="text-2xl font-bold">{predictions.paymentDelay.prediction}%</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                <div className="flex items-center space-x-3">
                  <BarChart3 className="w-6 h-6 text-blue-600" />
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-gray-100">Confidence</h4>
                    <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                      {predictions.paymentDelay.confidence}%
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                <div className="flex items-center space-x-3">
                  <Calendar className="w-6 h-6 text-purple-600" />
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-gray-100">Est. Delay</h4>
                    <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                      {Math.round(predictions.paymentDelay.prediction / 10)} days
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Risk Factors */}
            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
              <h5 className="font-medium text-gray-900 dark:text-gray-100 mb-3">Risk Factors</h5>
              <div className="space-y-2">
                {predictions.paymentDelay.factors.map((factor, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">{factor.factor}</span>
                    <div className="flex items-center space-x-2">
                      <div className="w-20 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                        <div 
                          className="bg-blue-600 h-2 rounded-full"
                          style={{ width: `${Math.abs(factor.impact)}%` }}
                        />
                      </div>
                      <span className="text-sm font-medium w-12 text-right">
                        {factor.impact > 0 ? '+' : ''}{factor.impact}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Recommendations */}
            <div className="bg-blue-50 dark:bg-blue-900 rounded-lg p-4">
              <h5 className="font-medium text-blue-900 dark:text-blue-100 mb-3">AI Recommendations</h5>
              <ul className="space-y-2">
                {predictions.paymentDelay.recommendations.map((rec, index) => (
                  <li key={index} className="flex items-start space-x-2 text-sm">
                    <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0" />
                    <span className="text-blue-800 dark:text-blue-200">{rec}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {/* Cash Flow Forecast */}
        {activeMetric === 'cashflow' && predictions.cashFlow && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-green-50 dark:bg-green-900 rounded-lg p-4">
                <div className="flex items-center space-x-3">
                  <TrendingUp className="w-6 h-6 text-green-600" />
                  <div>
                    <h4 className="font-medium text-green-900 dark:text-green-100">Projected Inflow</h4>
                    <p className="text-xl font-bold text-green-900 dark:text-green-100">
                      {formatCurrency(predictions.cashFlow.forecast?.reduce((sum: number, item: any) => sum + item.inflow, 0) || 0)}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-red-50 dark:bg-red-900 rounded-lg p-4">
                <div className="flex items-center space-x-3">
                  <TrendingUp className="w-6 h-6 text-red-600 transform rotate-180" />
                  <div>
                    <h4 className="font-medium text-red-900 dark:text-red-100">Projected Outflow</h4>
                    <p className="text-xl font-bold text-red-900 dark:text-red-100">
                      {formatCurrency(predictions.cashFlow.forecast?.reduce((sum: number, item: any) => sum + item.outflow, 0) || 0)}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-blue-50 dark:bg-blue-900 rounded-lg p-4">
                <div className="flex items-center space-x-3">
                  <DollarSign className="w-6 h-6 text-blue-600" />
                  <div>
                    <h4 className="font-medium text-blue-900 dark:text-blue-100">Net Position</h4>
                    <p className="text-xl font-bold text-blue-900 dark:text-blue-100">
                      {formatCurrency(
                        (predictions.cashFlow.forecast?.reduce((sum: number, item: any) => sum + item.inflow - item.outflow, 0) || 0)
                      )}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Cash Flow Chart */}
            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
              <h5 className="font-medium text-gray-900 dark:text-gray-100 mb-4">30-Day Cash Flow Forecast</h5>
              <div className="h-48 flex items-end justify-between space-x-1">
                {predictions.cashFlow.forecast?.slice(0, 30).map((day: any, index: number) => (
                  <div key={index} className="flex flex-col items-center flex-1">
                    <div 
                      className={`w-full rounded-t ${day.balance >= 0 ? 'bg-green-500' : 'bg-red-500'}`}
                      style={{ 
                        height: `${Math.abs(day.balance) / 10000 * 100}px`,
                        minHeight: '4px'
                      }}
                      title={`${day.date}: ${formatCurrency(day.balance)}`}
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Insights */}
            <div className="bg-yellow-50 dark:bg-yellow-900 rounded-lg p-4">
              <h5 className="font-medium text-yellow-900 dark:text-yellow-100 mb-3">Key Insights</h5>
              <ul className="space-y-1">
                {predictions.cashFlow.insights?.map((insight: string, index: number) => (
                  <li key={index} className="text-sm text-yellow-800 dark:text-yellow-200">
                    • {insight}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {/* Expense Forecast */}
        {activeMetric === 'expenses' && predictions.expenseForecast && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-purple-50 dark:bg-purple-900 rounded-lg p-4">
                <div className="flex items-center space-x-3">
                  <TrendingUp className="w-6 h-6 text-purple-600" />
                  <div>
                    <h4 className="font-medium text-purple-900 dark:text-purple-100">Predicted Expenses</h4>
                    <p className="text-2xl font-bold text-purple-900 dark:text-purple-100">
                      {formatCurrency(predictions.expenseForecast.prediction)}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                <div className="flex items-center space-x-3">
                  <BarChart3 className="w-6 h-6 text-gray-600" />
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-gray-100">Confidence Level</h4>
                    <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                      {predictions.expenseForecast.confidence}%
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Expense Breakdown */}
            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
              <h5 className="font-medium text-gray-900 dark:text-gray-100 mb-3">Expense Drivers</h5>
              <div className="space-y-3">
                {predictions.expenseForecast.factors.map((factor, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div>
                      <span className="text-sm font-medium text-gray-900 dark:text-gray-100">{factor.factor}</span>
                      <p className="text-xs text-gray-500 dark:text-gray-400">{factor.description}</p>
                    </div>
                    <span className="text-sm font-bold text-purple-600">
                      {factor.impact > 0 ? '+' : ''}{factor.impact}%
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Budget Optimization */}
        {activeMetric === 'budget' && (
          <div className="text-center py-8">
            <Target className="w-12 h-12 text-orange-600 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
              AI Budget Optimization
            </h3>
            <p className="text-gray-500 dark:text-gray-400 mt-2">
              Analyze spending patterns and suggest budget optimizations
            </p>
            <button className="mt-4 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors">
              Optimize Budget
            </button>
          </div>
        )}
      </div>
    </Card>
  );
};

export default AIPredictiveAnalytics;
