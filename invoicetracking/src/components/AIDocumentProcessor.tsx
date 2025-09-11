import React, { useState } from 'react';
import { Upload, FileText, CheckCircle, AlertCircle, Brain, Zap } from 'lucide-react';
import { DocumentAIService, DocumentExtractionResult } from '../services/aiService';
import Card from './Card';

interface AIDocumentProcessorProps {
  onExtractionComplete?: (result: DocumentExtractionResult) => void;
}

const AIDocumentProcessor: React.FC<AIDocumentProcessorProps> = ({ onExtractionComplete }) => {
  const [processing, setProcessing] = useState(false);
  const [result, setResult] = useState<DocumentExtractionResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'extract' | 'validate' | 'enhance'>('extract');

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setProcessing(true);
      setError(null);
      
      const extractionResult = await DocumentAIService.extractData(file);
      setResult(extractionResult);
      onExtractionComplete?.(extractionResult);
    } catch (err: any) {
      setError(err.message || 'Document processing failed');
    } finally {
      setProcessing(false);
    }
  };

  const handleValidation = async () => {
    if (!result) return;

    try {
      setProcessing(true);
      const validationResult = await DocumentAIService.validateFields(result.extractedData);
      // Update result with validation info
      setResult(prev => prev ? {
        ...prev,
        validationResults: validationResult.validationResults
      } : null);
    } catch (err: any) {
      setError(err.message || 'Validation failed');
    } finally {
      setProcessing(false);
    }
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 90) return 'text-green-600';
    if (confidence >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <Card title="AI Document Processor">
      <div className="space-y-6">
        {/* Tab Navigation */}
        <div className="flex space-x-1 bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
          {[
            { id: 'extract', label: 'Extract Data', icon: Brain },
            { id: 'validate', label: 'Validate', icon: CheckCircle },
            { id: 'enhance', label: 'Enhance', icon: Zap }
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  activeTab === tab.id
                    ? 'bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-400 shadow-sm'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100'
                }`}
              >
                <Icon className="w-5 h-5 mr-2" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Extract Tab */}
        {activeTab === 'extract' && (
          <div className="space-y-4">
            {/* Upload Area */}
            <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center">
              <div className="flex flex-col items-center space-y-4">
                <div className="p-3 bg-purple-100 dark:bg-purple-900 rounded-full">
                  <Brain className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                  <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                    AI Data Extraction
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    Upload invoice to automatically extract all data fields
                  </p>
                </div>
                <label className="cursor-pointer">
                  <input
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={handleFileUpload}
                    disabled={processing}
                    className="hidden"
                  />
                  <span className="inline-flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50">
                    <FileText className="w-4 h-4 mr-2" />
                    {processing ? 'Processing...' : 'Upload Document'}
                  </span>
                </label>
              </div>
            </div>

            {/* Processing Status */}
            {processing && (
              <div className="bg-purple-50 dark:bg-purple-900 rounded-lg p-4">
                <div className="flex items-center space-x-3">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-purple-600"></div>
                  <div>
                    <h4 className="font-medium text-purple-900 dark:text-purple-100">
                      AI Processing Document
                    </h4>
                    <p className="text-sm text-purple-700 dark:text-purple-300">
                      Extracting invoice data, identifying fields, and validating information...
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Extraction Results */}
            {result && (
              <div className="space-y-4">
                {/* Confidence Score */}
                <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium text-gray-900 dark:text-gray-100">
                      Extraction Results
                    </h4>
                    <span className={`font-medium ${getConfidenceColor(result.confidence)}`}>
                      {result.confidence}% Confidence
                    </span>
                  </div>
                </div>

                {/* Extracted Data */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <h5 className="font-medium text-gray-900 dark:text-gray-100">Basic Information</h5>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600 dark:text-gray-400">Invoice Number:</span>
                        <span className="font-medium">{result.extractedData.invoiceNumber || 'N/A'}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600 dark:text-gray-400">Date:</span>
                        <span className="font-medium">{result.extractedData.date || 'N/A'}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600 dark:text-gray-400">Due Date:</span>
                        <span className="font-medium">{result.extractedData.dueDate || 'N/A'}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600 dark:text-gray-400">Vendor:</span>
                        <span className="font-medium">{result.extractedData.vendor || 'N/A'}</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <h5 className="font-medium text-gray-900 dark:text-gray-100">Financial Details</h5>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600 dark:text-gray-400">Amount:</span>
                        <span className="font-medium">
                          {result.extractedData.currency} {result.extractedData.amount?.toLocaleString() || '0'}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600 dark:text-gray-400">Tax Amount:</span>
                        <span className="font-medium">
                          {result.extractedData.currency} {result.extractedData.taxAmount?.toLocaleString() || '0'}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600 dark:text-gray-400">Total:</span>
                        <span className="font-medium text-lg">
                          {result.extractedData.currency} {result.extractedData.totalAmount?.toLocaleString() || '0'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Line Items */}
                {result.extractedData.lineItems && result.extractedData.lineItems.length > 0 && (
                  <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                    <h5 className="font-medium text-gray-900 dark:text-gray-100 mb-3">Line Items</h5>
                    <div className="overflow-x-auto">
                      <table className="min-w-full text-sm">
                        <thead>
                          <tr className="border-b border-gray-200 dark:border-gray-700">
                            <th className="text-left py-2">Description</th>
                            <th className="text-right py-2">Qty</th>
                            <th className="text-right py-2">Unit Price</th>
                            <th className="text-right py-2">Total</th>
                          </tr>
                        </thead>
                        <tbody>
                          {result.extractedData.lineItems.map((item, index) => (
                            <tr key={index} className="border-b border-gray-100 dark:border-gray-700">
                              <td className="py-2">{item.description}</td>
                              <td className="text-right py-2">{item.quantity}</td>
                              <td className="text-right py-2">{item.unitPrice?.toLocaleString()}</td>
                              <td className="text-right py-2">{item.total?.toLocaleString()}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* Validation Errors */}
                {result.validationErrors && result.validationErrors.length > 0 && (
                  <div className="bg-yellow-50 dark:bg-yellow-900 rounded-lg p-4">
                    <h5 className="font-medium text-yellow-900 dark:text-yellow-100 mb-3">
                      Validation Issues
                    </h5>
                    <ul className="space-y-1">
                      {result.validationErrors.map((error, index) => (
                        <li key={index} className="flex items-center space-x-2 text-sm">
                          <AlertCircle className="w-4 h-4 text-yellow-600" />
                          <span className="text-yellow-800 dark:text-yellow-200">{error}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Validate Tab */}
        {activeTab === 'validate' && (
          <div className="space-y-4">
            <div className="text-center py-8">
              <CheckCircle className="w-12 h-12 text-green-600 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                AI Field Validation
              </h3>
              <p className="text-gray-500 dark:text-gray-400 mt-2">
                Validate extracted data against business rules and patterns
              </p>
              {result && (
                <button
                  onClick={handleValidation}
                  disabled={processing}
                  className="mt-4 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
                >
                  {processing ? 'Validating...' : 'Validate Data'}
                </button>
              )}
            </div>
          </div>
        )}

        {/* Enhance Tab */}
        {activeTab === 'enhance' && (
          <div className="space-y-4">
            <div className="text-center py-8">
              <Zap className="w-12 h-12 text-orange-600 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                AI Image Enhancement
              </h3>
              <p className="text-gray-500 dark:text-gray-400 mt-2">
                Enhance document quality for better OCR accuracy
              </p>
              <button className="mt-4 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors">
                Enhance Document
              </button>
            </div>
          </div>
        )}

        {/* Error Display */}
        {error && (
          <div className="bg-red-50 dark:bg-red-900 rounded-lg p-4">
            <div className="flex items-center space-x-3">
              <AlertCircle className="w-6 h-6 text-red-600" />
              <div>
                <h4 className="font-medium text-red-900 dark:text-red-100">Processing Failed</h4>
                <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
};

export default AIDocumentProcessor;
