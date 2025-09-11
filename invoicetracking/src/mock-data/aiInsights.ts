import { ReportInsight } from '../services/aiService';

export const mockReportInsights: ReportInsight[] = [
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

export const mockAIProcessingResults = [
  {
    id: 'ai-proc-1',
    invoiceId: '1',
    originalFilename: 'techcorp_invoice_001.pdf',
    processingStatus: 'completed',
    ocrText: 'INVOICE\nTechCorp Solutions\n123 Tech Street...',
    extractedData: {
      vendorName: 'TechCorp Solutions',
      invoiceNumber: 'INV-2024-001',
      totalAmount: 18000.00,
      dueDate: '2024-02-15'
    },
    confidenceScore: 0.95,
    processingTimeMs: 2340,
    aiModelVersion: 'ocr-v2.1'
  }
];

export const mockFraudDetectionResults = [
  {
    id: 'fraud-1',
    invoiceId: '1',
    riskScore: 0.75,
    riskLevel: 'high',
    fraudIndicators: {
      duplicateInvoice: false,
      unusualAmount: true,
      vendorRiskFlag: false,
      patternAnomaly: true
    },
    anomalyFlags: ['amount_spike', 'timing_unusual'],
    mlModelVersion: 'fraud-detect-v1.3',
    falsePositive: false
  }
];

export const mockCategorizationResults = [
  {
    id: 'cat-1',
    invoiceId: '1',
    suggestedCategory: 'Software',
    confidenceScore: 0.92,
    suggestedGlAccount: '6200',
    suggestedCostCenter: 'CC001',
    categoryReasoning: 'Invoice contains software licensing keywords and matches historical patterns',
    alternativeCategories: [
      { category: 'IT Services', confidence: 0.78 },
      { category: 'Consulting', confidence: 0.65 }
    ],
    userAccepted: false,
    mlModelVersion: 'categorize-v1.1'
  }
];
