import React, { useState } from 'react';
import { Shield, AlertTriangle, CheckCircle, XCircle, Eye, FileText, Upload } from 'lucide-react';
import { FraudDetectionService, FraudAnalysisResult } from '../services/aiService';
import Card from './Card';

interface AIFraudDetectionProps {
  onAnalysisComplete?: (result: FraudAnalysisResult) => void;
}

const AIFraudDetection: React.FC<AIFraudDetectionProps> = ({ onAnalysisComplete }) => {
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState<FraudAnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setAnalyzing(true);
      setError(null);
      
      const analysisResult = await FraudDetectionService.analyzeDocument(file);
      setResult(analysisResult);
      onAnalysisComplete?.(analysisResult);
    } catch (err: any) {
      setError(err.message || 'Fraud analysis failed');
    } finally {
      setAnalyzing(false);
    }
  };

  const getRiskColor = (riskLevel: string) => {
    switch (riskLevel) {
      case 'low': return 'text-green-600 bg-green-100 dark:bg-green-900';
      case 'medium': return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900';
      case 'high': return 'text-orange-600 bg-orange-100 dark:bg-orange-900';
      case 'critical': return 'text-red-600 bg-red-100 dark:bg-red-900';
      default: return 'text-gray-600 bg-gray-100 dark:bg-gray-900';
    }
  };

  const getRiskIcon = (riskLevel: string) => {
    switch (riskLevel) {
      case 'low': return <CheckCircle className="w-5 h-5" />;
      case 'medium': return <Eye className="w-5 h-5" />;
      case 'high': return <AlertTriangle className="w-5 h-5" />;
      case 'critical': return <XCircle className="w-5 h-5" />;
      default: return <Shield className="w-5 h-5" />;
    }
  };

  return (
    <Card title="AI Fraud Detection">
      <div className="space-y-6">
        {/* Upload Section */}
        <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center">
          <div className="flex flex-col items-center space-y-4">
            <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-full">
              <Upload className="w-8 h-8 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                Upload Document for Analysis
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                AI will analyze the document for potential fraud indicators
              </p>
            </div>
            <label className="cursor-pointer">
              <input
                type="file"
                accept=".pdf,.jpg,.jpeg,.png"
                onChange={handleFileUpload}
                disabled={analyzing}
                className="hidden"
              />
              <span className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50">
                <FileText className="w-4 h-4 mr-2" />
                {analyzing ? 'Analyzing...' : 'Select Document'}
              </span>
            </label>
          </div>
        </div>

        {/* Analysis Progress */}
        {analyzing && (
          <div className="bg-blue-50 dark:bg-blue-900 rounded-lg p-4">
            <div className="flex items-center space-x-3">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
              <div>
                <h4 className="font-medium text-blue-900 dark:text-blue-100">
                  AI Analysis in Progress
                </h4>
                <p className="text-sm text-blue-700 dark:text-blue-300">
                  Scanning document for fraud indicators, verifying authenticity, and checking for anomalies...
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Error Display */}
        {error && (
          <div className="bg-red-50 dark:bg-red-900 rounded-lg p-4">
            <div className="flex items-center space-x-3">
              <XCircle className="w-6 h-6 text-red-600" />
              <div>
                <h4 className="font-medium text-red-900 dark:text-red-100">Analysis Failed</h4>
                <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Analysis Results */}
        {result && (
          <div className="space-y-4">
            {/* Risk Overview */}
            <div className={`rounded-lg p-4 ${getRiskColor(result.riskLevel)}`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  {getRiskIcon(result.riskLevel)}
                  <div>
                    <h4 className="font-medium">
                      Risk Level: {result.riskLevel.toUpperCase()}
                    </h4>
                    <p className="text-sm opacity-90">
                      Risk Score: {result.riskScore}/100 (Confidence: {result.confidence}%)
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Detailed Analysis */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Fraud Indicators */}
              <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                <h5 className="font-medium text-gray-900 dark:text-gray-100 mb-3">
                  Fraud Indicators
                </h5>
                {result.flags.length > 0 ? (
                  <ul className="space-y-2">
                    {result.flags.map((flag, index) => (
                      <li key={index} className="flex items-center space-x-2 text-sm">
                        <AlertTriangle className="w-4 h-4 text-yellow-500" />
                        <span className="text-gray-700 dark:text-gray-300">{flag}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-green-600 dark:text-green-400">
                    No fraud indicators detected
                  </p>
                )}
              </div>

              {/* Verification Details */}
              <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                <h5 className="font-medium text-gray-900 dark:text-gray-100 mb-3">
                  Verification Details
                </h5>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">Document Authenticity:</span>
                    <span className="font-medium">{result.details.documentAuthenticity}%</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">Data Consistency:</span>
                    <span className="font-medium">{result.details.dataConsistency}%</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">Vendor Verification:</span>
                    <span className="font-medium">{result.details.vendorVerification}%</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">Amount Validation:</span>
                    <span className="font-medium">{result.details.amountValidation}%</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Recommendations */}
            {result.recommendations.length > 0 && (
              <div className="bg-blue-50 dark:bg-blue-900 rounded-lg p-4">
                <h5 className="font-medium text-blue-900 dark:text-blue-100 mb-3">
                  AI Recommendations
                </h5>
                <ul className="space-y-2">
                  {result.recommendations.map((recommendation, index) => (
                    <li key={index} className="flex items-start space-x-2 text-sm">
                      <CheckCircle className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                      <span className="text-blue-800 dark:text-blue-200">{recommendation}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </div>
    </Card>
  );
};

export default AIFraudDetection;
