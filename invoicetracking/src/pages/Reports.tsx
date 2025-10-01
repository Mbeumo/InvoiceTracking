import React, { useState, useEffect } from 'react';
import { Download, FileText, Calendar, Filter, Search } from 'lucide-react';
import Card from '../components/Card';
import LoadingSpinner from '../components/LoadingSpinner';

interface Report {
  id: string;
  name: string;
  description: string;
  type: 'invoice' | 'revenue' | 'user' | 'analytics';
  format: 'pdf' | 'excel' | 'csv';
  createdAt: string;
  size: string;
  downloadUrl?: string;
}

export const Reports: React.FC = () => {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState<string | null>(null);
  const [filters, setFilters] = useState({
    type: 'all',
    dateRange: {
      start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      end: new Date().toISOString().split('T')[0]
    }
  });

  useEffect(() => {
    loadReports();
  }, []);

  const loadReports = async () => {
    try {
      setLoading(true);
      
      // Mock data - replace with actual API call
      const mockReports: Report[] = [
        {
          id: '1',
          name: 'Monthly Invoice Report',
          description: 'Complete invoice summary for the current month',
          type: 'invoice',
          format: 'pdf',
          createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          size: '2.4 MB'
        },
        {
          id: '2',
          name: 'Revenue Analytics',
          description: 'Revenue trends and projections',
          type: 'revenue',
          format: 'excel',
          createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
          size: '1.8 MB'
        },
        {
          id: '3',
          name: 'User Activity Report',
          description: 'User engagement and activity metrics',
          type: 'user',
          format: 'csv',
          createdAt: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(),
          size: '856 KB'
        }
      ];

      setReports(mockReports);
    } catch (error) {
      console.error('Failed to load reports:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateReport = async (type: string, format: string) => {
    try {
      setGenerating(`${type}-${format}`);
      
      // Simulate report generation
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      // TODO: Replace with actual API call
      // const report = await ReportService.generate({ type, format, ...filters });
      
      // Add new report to list
      const newReport: Report = {
        id: Date.now().toString(),
        name: `${type.charAt(0).toUpperCase() + type.slice(1)} Report`,
        description: `Generated ${type} report`,
        type: type as any,
        format: format as any,
        createdAt: new Date().toISOString(),
        size: '1.2 MB'
      };
      
      setReports(prev => [newReport, ...prev]);
    } catch (error) {
      console.error('Failed to generate report:', error);
    } finally {
      setGenerating(null);
    }
  };

  const downloadReport = async (report: Report) => {
    // TODO: Implement actual download
    console.log('Downloading report:', report.name);
    
    // Simulate download
    const link = document.createElement('a');
    link.href = '#';
    link.download = `${report.name}.${report.format}`;
    link.click();
  };

  const reportTypes = [
    { value: 'invoice', label: 'Invoice Reports', description: 'Invoice summaries and details' },
    { value: 'revenue', label: 'Revenue Reports', description: 'Financial performance and trends' },
    { value: 'user', label: 'User Reports', description: 'User activity and engagement' },
    { value: 'analytics', label: 'Analytics Reports', description: 'Comprehensive business analytics' }
  ];

  const formatTypes = ['pdf', 'excel', 'csv'];

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'invoice': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'revenue': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'user': return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
      case 'analytics': return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Reports</h1>
        
        {/* Filters */}
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <Calendar className="w-4 h-4 text-gray-500" />
            <input
              type="date"
              value={filters.dateRange.start}
              onChange={(e) => setFilters(prev => ({
                ...prev,
                dateRange: { ...prev.dateRange, start: e.target.value }
              }))}
              className="px-3 py-1 border border-gray-300 rounded-md text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100"
            />
            <span className="text-gray-500">to</span>
            <input
              type="date"
              value={filters.dateRange.end}
              onChange={(e) => setFilters(prev => ({
                ...prev,
                dateRange: { ...prev.dateRange, end: e.target.value }
              }))}
              className="px-3 py-1 border border-gray-300 rounded-md text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100"
            />
          </div>
        </div>
      </div>

      {/* Generate Reports */}
      <Card title="Generate New Report">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {reportTypes.map((type) => (
            <div key={type.value} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
              <h3 className="font-medium text-gray-900 dark:text-gray-100 mb-2">{type.label}</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">{type.description}</p>
              
              <div className="space-y-2">
                {formatTypes.map((format) => (
                  <button
                    key={format}
                    onClick={() => generateReport(type.value, format)}
                    disabled={generating === `${type.value}-${format}`}
                    className="w-full px-3 py-2 text-sm bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {generating === `${type.value}-${format}` ? (
                      <div className="flex items-center justify-center">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600 mr-2"></div>
                        Generating...
                      </div>
                    ) : (
                      `Generate ${format.toUpperCase()}`
                    )}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Generated Reports */}
      <Card title="Generated Reports">
        {loading ? (
          <LoadingSpinner />
        ) : reports.length === 0 ? (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            No reports generated yet
          </div>
        ) : (
          <div className="space-y-4">
            {reports.map((report) => (
              <div
                key={report.id}
                className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                <div className="flex items-center space-x-4">
                  <FileText className="w-8 h-8 text-gray-400" />
                  <div>
                    <h3 className="font-medium text-gray-900 dark:text-gray-100">{report.name}</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{report.description}</p>
                    <div className="flex items-center space-x-4 mt-1">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(report.type)}`}>
                        {report.type}
                      </span>
                      <span className="text-xs text-gray-500">{report.format.toUpperCase()}</span>
                      <span className="text-xs text-gray-500">{report.size}</span>
                      <span className="text-xs text-gray-500">{formatTime(report.createdAt)}</span>
                    </div>
                  </div>
                </div>
                
                <button
                  onClick={() => downloadReport(report)}
                  className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download
                </button>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
};

export default Reports;
