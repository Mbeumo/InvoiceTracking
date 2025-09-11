import React, { useState, useEffect } from 'react';
import { Copy, AlertTriangle, CheckCircle, Eye, Search, Filter } from 'lucide-react';
import { FraudDetectionService, DuplicateDetectionResult } from '../services/aiService';
import Card from './Card';

interface AIDuplicateDetectorProps {
  invoiceData?: any;
  onDuplicatesFound?: (duplicates: DuplicateDetectionResult) => void;
}

const AIDuplicateDetector: React.FC<AIDuplicateDetectorProps> = ({ 
  invoiceData, 
  onDuplicatesFound 
}) => {
  const [scanning, setScanning] = useState(false);
  const [results, setResults] = useState<DuplicateDetectionResult | null>(null);
  const [selectedDuplicate, setSelectedDuplicate] = useState<any | null>(null);
  const [filterLevel, setFilterLevel] = useState<'all' | 'high' | 'medium'>('all');

  useEffect(() => {
    if (invoiceData) {
      scanForDuplicates();
    }
  }, [invoiceData]);

  const scanForDuplicates = async () => {
    try {
      setScanning(true);
      const duplicateResults = await FraudDetectionService.detectDuplicates(invoiceData);
      setResults(duplicateResults);
      onDuplicatesFound?.(duplicateResults);
    } catch (error) {
      console.error('Failed to scan for duplicates:', error);
    } finally {
      setScanning(false);
    }
  };

  const getSimilarityColor = (similarity: number) => {
    if (similarity >= 90) return 'text-red-600 bg-red-100 dark:bg-red-900';
    if (similarity >= 70) return 'text-orange-600 bg-orange-100 dark:bg-orange-900';
    if (similarity >= 50) return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900';
    return 'text-green-600 bg-green-100 dark:bg-green-900';
  };

  const getRiskLevel = (similarity: number) => {
    if (similarity >= 90) return 'high';
    if (similarity >= 70) return 'medium';
    return 'low';
  };

  const filteredDuplicates = results?.potentialDuplicates?.filter(duplicate => {
    if (filterLevel === 'all') return true;
    const riskLevel = getRiskLevel(duplicate.similarityScore);
    return riskLevel === filterLevel;
  }) || [];

  return (
    <Card title="AI Duplicate Detection">
      <div className="space-y-6">
        {/* Scan Status */}
        {scanning && (
          <div className="bg-blue-50 dark:bg-blue-900 rounded-lg p-4">
            <div className="flex items-center space-x-3">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
              <div>
                <h4 className="font-medium text-blue-900 dark:text-blue-100">
                  AI Scanning for Duplicates
                </h4>
                <p className="text-sm text-blue-700 dark:text-blue-300">
                  Analyzing invoice against historical data using advanced similarity algorithms...
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Results Overview */}
        {results && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
              <div className="flex items-center space-x-3">
                <Search className="w-6 h-6 text-blue-600" />
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-gray-100">Invoices Scanned</h4>
                  <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                    {results.totalScanned || 0}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-orange-50 dark:bg-orange-900 rounded-lg p-4">
              <div className="flex items-center space-x-3">
                <Copy className="w-6 h-6 text-orange-600" />
                <div>
                  <h4 className="font-medium text-orange-900 dark:text-orange-100">Potential Duplicates</h4>
                  <p className="text-2xl font-bold text-orange-900 dark:text-orange-100">
                    {results.potentialDuplicates?.length || 0}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-red-50 dark:bg-red-900 rounded-lg p-4">
              <div className="flex items-center space-x-3">
                <AlertTriangle className="w-6 h-6 text-red-600" />
                <div>
                  <h4 className="font-medium text-red-900 dark:text-red-100">High Risk</h4>
                  <p className="text-2xl font-bold text-red-900 dark:text-red-100">
                    {results.potentialDuplicates?.filter(d => d.similarityScore >= 90).length || 0}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Filter Controls */}
        {results && results.potentialDuplicates && results.potentialDuplicates.length > 0 && (
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Filter className="w-4 h-4 text-gray-600 dark:text-gray-400" />
              <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Filter by risk:</span>
            </div>
            <div className="flex space-x-2">
              {[
                { id: 'all', label: 'All', count: results.potentialDuplicates.length },
                { id: 'high', label: 'High Risk', count: results.potentialDuplicates.filter(d => d.similarityScore >= 90).length },
                { id: 'medium', label: 'Medium Risk', count: results.potentialDuplicates.filter(d => d.similarityScore >= 70 && d.similarityScore < 90).length }
              ].map((filter) => (
                <button
                  key={filter.id}
                  onClick={() => setFilterLevel(filter.id as any)}
                  className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                    filterLevel === filter.id
                      ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-200'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-400 dark:hover:bg-gray-600'
                  }`}
                >
                  {filter.label} ({filter.count})
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Duplicate Results */}
        {filteredDuplicates.length > 0 ? (
          <div className="space-y-3">
            <h4 className="font-medium text-gray-900 dark:text-gray-100">
              Potential Duplicates Found
            </h4>
            {filteredDuplicates.map((duplicate, index) => (
              <div
                key={index}
                className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:border-orange-300 transition-colors cursor-pointer"
                onClick={() => setSelectedDuplicate(selectedDuplicate?.id === duplicate.id ? null : duplicate)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Copy className="w-5 h-5 text-orange-600" />
                    <div>
                      <h5 className="font-medium text-gray-900 dark:text-gray-100">
                        Invoice #{duplicate.invoiceNumber}
                      </h5>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {duplicate.vendor} • {duplicate.date} • ${duplicate.amount?.toLocaleString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className={`px-3 py-1 rounded-full text-sm font-medium ${getSimilarityColor(duplicate.similarityScore)}`}>
                      {duplicate.similarityScore}% Match
                    </div>
                    <Eye className="w-4 h-4 text-gray-400" />
                  </div>
                </div>

                {/* Expanded Details */}
                {selectedDuplicate?.id === duplicate.id && (
                  <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Current Invoice */}
                      <div className="bg-blue-50 dark:bg-blue-900 rounded-lg p-3">
                        <h6 className="font-medium text-blue-900 dark:text-blue-100 mb-2">Current Invoice</h6>
                        <div className="space-y-1 text-sm">
                          <div className="flex justify-between">
                            <span className="text-blue-700 dark:text-blue-300">Number:</span>
                            <span className="font-medium text-blue-900 dark:text-blue-100">{invoiceData?.invoiceNumber}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-blue-700 dark:text-blue-300">Vendor:</span>
                            <span className="font-medium text-blue-900 dark:text-blue-100">{invoiceData?.vendor}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-blue-700 dark:text-blue-300">Amount:</span>
                            <span className="font-medium text-blue-900 dark:text-blue-100">${invoiceData?.amount?.toLocaleString()}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-blue-700 dark:text-blue-300">Date:</span>
                            <span className="font-medium text-blue-900 dark:text-blue-100">{invoiceData?.date}</span>
                          </div>
                        </div>
                      </div>

                      {/* Potential Duplicate */}
                      <div className="bg-orange-50 dark:bg-orange-900 rounded-lg p-3">
                        <h6 className="font-medium text-orange-900 dark:text-orange-100 mb-2">Potential Duplicate</h6>
                        <div className="space-y-1 text-sm">
                          <div className="flex justify-between">
                            <span className="text-orange-700 dark:text-orange-300">Number:</span>
                            <span className="font-medium text-orange-900 dark:text-orange-100">{duplicate.invoiceNumber}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-orange-700 dark:text-orange-300">Vendor:</span>
                            <span className="font-medium text-orange-900 dark:text-orange-100">{duplicate.vendor}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-orange-700 dark:text-orange-300">Amount:</span>
                            <span className="font-medium text-orange-900 dark:text-orange-100">${duplicate.amount?.toLocaleString()}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-orange-700 dark:text-orange-300">Date:</span>
                            <span className="font-medium text-orange-900 dark:text-orange-100">{duplicate.date}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Similarity Breakdown */}
                    <div className="mt-4 bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
                      <h6 className="font-medium text-gray-900 dark:text-gray-100 mb-3">Similarity Analysis</h6>
                      <div className="space-y-2">
                        {duplicate.matchingFields?.map((field: any, fieldIndex: number) => (
                          <div key={fieldIndex} className="flex items-center justify-between">
                            <span className="text-sm text-gray-600 dark:text-gray-400">{field.field}:</span>
                            <div className="flex items-center space-x-2">
                              <div className="w-16 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                                <div 
                                  className="bg-orange-500 h-2 rounded-full"
                                  style={{ width: `${field.similarity}%` }}
                                />
                              </div>
                              <span className="text-sm font-medium text-gray-900 dark:text-gray-100 w-12 text-right">
                                {field.similarity}%
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="mt-4 flex space-x-3">
                      <button className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm">
                        Mark as Duplicate
                      </button>
                      <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm">
                        Not a Duplicate
                      </button>
                      <button className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors text-sm">
                        Review Later
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : results && results.potentialDuplicates ? (
          <div className="text-center py-8">
            <CheckCircle className="w-12 h-12 text-green-600 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
              No Duplicates Found
            </h3>
            <p className="text-gray-500 dark:text-gray-400 mt-2">
              This invoice appears to be unique in your system
            </p>
          </div>
        ) : !scanning && (
          <div className="text-center py-8">
            <Copy className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
              Ready to Scan
            </h3>
            <p className="text-gray-500 dark:text-gray-400 mt-2">
              Upload or select an invoice to scan for potential duplicates
            </p>
            <button 
              onClick={scanForDuplicates}
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Start Duplicate Scan
            </button>
          </div>
        )}

        {/* Scan Settings */}
        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
          <h5 className="font-medium text-gray-900 dark:text-gray-100 mb-3">Detection Settings</h5>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div>
              <span className="text-gray-600 dark:text-gray-400">Similarity Threshold:</span>
              <span className="font-medium text-gray-900 dark:text-gray-100 ml-2">70%</span>
            </div>
            <div>
              <span className="text-gray-600 dark:text-gray-400">Time Window:</span>
              <span className="font-medium text-gray-900 dark:text-gray-100 ml-2">90 days</span>
            </div>
            <div>
              <span className="text-gray-600 dark:text-gray-400">Fields Analyzed:</span>
              <span className="font-medium text-gray-900 dark:text-gray-100 ml-2">Vendor, Amount, Date</span>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default AIDuplicateDetector;
