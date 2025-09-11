import React, { useState, useEffect } from 'react';
import { BarChart3, TrendingUp, DollarSign, FileText, Users, Calendar } from 'lucide-react';
import { AnalyticsService } from '../services/apiService';
import Card from '../components/Card';
import { ErrorBoundary } from '../components/ErrorBoundary';
import LoadingSpinner from '../components/LoadingSpinner';

interface AnalyticsData {
  totalRevenue: number;
  totalInvoices: number;
  activeUsers: number;
  monthlyGrowth: number;
  revenueData: Array<{ month: string; revenue: number }>;
  invoiceStatusData: Array<{ status: string; count: number }>;
}

const Analytics: React.FC = () => {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dateRange, setDateRange] = useState({
    start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    end: new Date().toISOString().split('T')[0]
  });

  useEffect(() => {
    loadAnalytics();
  }, [dateRange]);

  const loadAnalytics = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Mock data for now - replace with actual API calls
      const mockData: AnalyticsData = {
        totalRevenue: 125000,
        totalInvoices: 342,
        activeUsers: 28,
        monthlyGrowth: 12.5,
        revenueData: [
          { month: 'Jan', revenue: 15000 },
          { month: 'Feb', revenue: 18000 },
          { month: 'Mar', revenue: 22000 },
          { month: 'Apr', revenue: 19000 },
          { month: 'May', revenue: 25000 },
          { month: 'Jun', revenue: 26000 }
        ],
        invoiceStatusData: [
          { status: 'Paid', count: 180 },
          { status: 'Pending', count: 95 },
          { status: 'Overdue', count: 42 },
          { status: 'Draft', count: 25 }
        ]
      };

      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // TODO: Replace with actual API call
      // const summary = await AnalyticsService.getSummary(dateRange);
      // const revenue = await AnalyticsService.getRevenue(dateRange);
      
      setData(mockData);
    } catch (err: any) {
      setError(err.message || 'Failed to load analytics');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <LoadingSpinner />;
  if (error) return (
    <div className="p-6 text-center">
      <div className="text-red-600 dark:text-red-400">{error}</div>
      <button 
        onClick={loadAnalytics}
        className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
      >
        Retry
      </button>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Analytics Dashboard</h1>
        
        {/* Date Range Selector */}
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <Calendar className="w-4 h-4 text-gray-500" />
            <input
              type="date"
              value={dateRange.start}
              onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
              className="px-3 py-1 border border-gray-300 rounded-md text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100"
            />
            <span className="text-gray-500">to</span>
            <input
              type="date"
              value={dateRange.end}
              onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
              className="px-3 py-1 border border-gray-300 rounded-md text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100"
            />
          </div>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card title="Total Revenue">
          <div className="flex items-center">
            <DollarSign className="w-8 h-8 text-green-600 mr-3" />
            <div>
              <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                ${data?.totalRevenue.toLocaleString()}
              </div>
              <div className="text-sm text-green-600 flex items-center">
                <TrendingUp className="w-4 h-4 mr-1" />
                +{data?.monthlyGrowth}% this month
              </div>
            </div>
          </div>
        </Card>

        <Card title="Total Invoices">
          <div className="flex items-center">
            <FileText className="w-8 h-8 text-blue-600 mr-3" />
            <div>
              <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                {data?.totalInvoices}
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400">
                All time
              </div>
            </div>
          </div>
        </Card>

        <Card title="Active Users">
          <div className="flex items-center">
            <Users className="w-8 h-8 text-purple-600 mr-3" />
            <div>
              <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                {data?.activeUsers}
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400">
                This month
              </div>
            </div>
          </div>
        </Card>

        <Card title="Growth Rate">
          <div className="flex items-center">
            <BarChart3 className="w-8 h-8 text-orange-600 mr-3" />
            <div>
              <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                +{data?.monthlyGrowth}%
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400">
                Monthly growth
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Chart */}
        <Card title="Revenue Trend">
          <div className="h-64 flex items-end justify-between space-x-2">
            {data?.revenueData.map((item, index) => (
              <div key={index} className="flex flex-col items-center flex-1">
                <div 
                  className="bg-blue-600 rounded-t w-full transition-all hover:bg-blue-700"
                  style={{ 
                    height: `${(item.revenue / Math.max(...data.revenueData.map(d => d.revenue))) * 200}px`,
                    minHeight: '20px'
                  }}
                  title={`${item.month}: $${item.revenue.toLocaleString()}`}
                />
                <div className="text-xs text-gray-500 mt-2">{item.month}</div>
              </div>
            ))}
          </div>
        </Card>

        {/* Invoice Status Chart */}
        <Card title="Invoice Status Distribution">
          <div className="space-y-4">
            {data?.invoiceStatusData.map((item, index) => {
              const total = data.invoiceStatusData.reduce((sum, d) => sum + d.count, 0);
              const percentage = (item.count / total) * 100;
              const colors = ['bg-green-500', 'bg-yellow-500', 'bg-red-500', 'bg-gray-500'];
              
              return (
                <div key={index} className="flex items-center">
                  <div className="w-20 text-sm text-gray-600 dark:text-gray-400">{item.status}</div>
                  <div className="flex-1 mx-4">
                    <div className="bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div 
                        className={`${colors[index]} h-2 rounded-full transition-all`}
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                  <div className="w-16 text-sm text-gray-900 dark:text-gray-100 text-right">
                    {item.count} ({percentage.toFixed(1)}%)
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      </div>

      {/* Export Options */}
      <Card title="Export Analytics">
        <div className="flex space-x-4">
          <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
            Export to Excel
          </button>
          <button className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors">
            Export to PDF
          </button>
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            Generate Report
          </button>
        </div>
      </Card>
    </div>
  );
};

export default Analytics;
