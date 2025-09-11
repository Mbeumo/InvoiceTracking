import api from '../controllers/api';
import { AI_ENDPOINTS } from './aiEndpoints';

/**
 * AI Service Layer for Intelligent Invoice Processing
 * 
 * This service provides AI-powered capabilities including fraud detection,
 * automated data extraction, predictive analytics, and intelligent automation.
 */

// Additional AI Types
export interface CategorySuggestion {
  category: string;
  confidence: number;
  reasoning?: string;
  tags?: string[];
}

export interface DuplicateDetectionResult {
  totalScanned: number;
  potentialDuplicates: any[];
}

export interface MatchResult {
  id: string;
  entity: string;
  type: string;
  confidence: number;
  description?: string;
  entityId?: string;
  status?: string;
  lastTransaction?: string;
  matchingFields?: any[];
  additionalInfo?: any;
}

export interface WorkflowResult {
  workflowType: string;
  priorityScore: number;
  priority: string;
  approvalSteps?: any[];
  estimatedDuration?: string;
  canAutoApprove?: boolean;
  automationRules?: string[];
}

export interface ChatMessage {
  id: string;
  content: string;
  sender: 'user' | 'assistant';
  timestamp: Date;
  type: 'text' | 'error';
  suggestions?: string[];
}

export interface ReportInsight {
  id: string;
  type: 'warning' | 'opportunity' | 'info';
  title: string;
  description: string;
  value: string;
  change: number;
  period: string;
  impact?: 'high' | 'medium' | 'low';
  trend?: 'up' | 'down' | 'stable';
  recommendations: string[];
  chartData?: {
    labels: string[];
    values: number[];
  };
}

// Types and interfaces
export interface FraudAnalysisResult {
  riskScore: number; // 0-100, higher = more suspicious
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  flags: string[];
  confidence: number;
  recommendations: string[];
  details: {
    documentAuthenticity: number;
    dataConsistency: number;
    vendorVerification: number;
    amountValidation: number;
  };
}

export interface DocumentExtractionResult {
  extractedData: {
    invoiceNumber: string;
    date: string;
    dueDate: string;
    vendor: string;
    amount: number;
    currency: string;
    lineItems: Array<{
      description: string;
      quantity: number;
      unitPrice: number;
      total: number;
    }>;
    taxAmount: number;
    totalAmount: number;
  };
  confidence: number;
  validationErrors: string[];
  suggestedCorrections: Record<string, any>;
}

export interface PredictionResult {
  prediction: any;
  confidence: number;
  factors: Array<{
    factor: string;
    impact: number;
    description: string;
  }>;
  recommendations: string[];
}

// Fraud Detection Service
export class FraudDetectionService {
  static async analyzeDocument(file: File, metadata?: any): Promise<FraudAnalysisResult> {
    try {
      const formData = new FormData();
      formData.append('document', file);
      if (metadata) {
        formData.append('metadata', JSON.stringify(metadata));
      }

      const response = await api.post(AI_ENDPOINTS.FRAUD_DETECTION.ANALYZE_DOCUMENT, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      return response.data;
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  static async detectDuplicates(invoiceData: any): Promise<DuplicateDetectionResult> {
    try {
      const response = await api.post(AI_ENDPOINTS.FRAUD_DETECTION.DUPLICATE_CHECK, invoiceData);
      return response.data;
    } catch (error) {
      console.error('Duplicate detection failed:', error);
      throw error;
    }
  }

  static async detectDuplicatesOld(invoiceData: any): Promise<{ isDuplicate: boolean; confidence: number; similarInvoices: any[] }> {
    try {
      const response = await api.post(AI_ENDPOINTS.FRAUD_DETECTION.CHECK_DUPLICATE, invoiceData);
      return response.data;
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  static async checkDuplicate(invoiceData: any): Promise<{
    isDuplicate: boolean;
    similarInvoices: any[];
    confidence: number;
  }> {
    try {
      const response = await api.post(AI_ENDPOINTS.FRAUD_DETECTION.CHECK_DUPLICATE, invoiceData);
      return response.data;
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  static async verifyAuthenticity(documentId: string): Promise<{
    isAuthentic: boolean;
    confidence: number;
    verificationDetails: any;
  }> {
    try {
      const response = await api.post(AI_ENDPOINTS.FRAUD_DETECTION.VERIFY_AUTHENTICITY, {
        document_id: documentId
      });
      return response.data;
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  static async assessRisk(invoiceData: any): Promise<FraudAnalysisResult> {
    try {
      const response = await api.post(AI_ENDPOINTS.FRAUD_DETECTION.RISK_ASSESSMENT, invoiceData);
      return response.data;
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  private static handleError(error: any) {
    return {
      message: error.response?.data?.message || 'AI fraud detection failed',
      status: error.response?.status || 500,
      details: error.response?.data
    };
  }
}

// Document AI Service
export class DocumentAIService {
  static async extractData(file: File): Promise<DocumentExtractionResult> {
    try {
      const formData = new FormData();
      formData.append('document', file);

      const response = await api.post(AI_ENDPOINTS.DOCUMENT_AI.EXTRACT_DATA, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      return response.data;
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  static async classifyDocument(file: File): Promise<{
    documentType: string;
    confidence: number;
    suggestedWorkflow: string;
  }> {
    try {
      const formData = new FormData();
      formData.append('document', file);

      const response = await api.post(AI_ENDPOINTS.DOCUMENT_AI.CLASSIFY_DOCUMENT, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      return response.data;
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  static async validateFields(extractedData: any): Promise<{
    isValid: boolean;
    validationResults: Record<string, { isValid: boolean; confidence: number; suggestion?: string }>;
  }> {
    try {
      const response = await api.post(AI_ENDPOINTS.DOCUMENT_AI.VALIDATE_FIELDS, extractedData);
      return response.data;
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  static async enhanceImage(file: File): Promise<{
    enhancedImageUrl: string;
    improvements: string[];
  }> {
    try {
      const formData = new FormData();
      formData.append('image', file);

      const response = await api.post(AI_ENDPOINTS.DOCUMENT_AI.ENHANCE_IMAGE, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      return response.data;
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  private static handleError(error: any) {
    return {
      message: error.response?.data?.message || 'Document AI processing failed',
      status: error.response?.status || 500,
      details: error.response?.data
    };
  }
}

// Predictive Analytics Service
export class PredictiveAnalyticsService {
  static async predictPaymentDelay(invoiceData: any): Promise<PredictionResult> {
    try {
      const response = await api.post(AI_ENDPOINTS.PREDICTIONS.PAYMENT_DELAY, invoiceData);
      return response.data;
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  static async forecastCashFlow(params: {
    timeframe: 'week' | 'month' | 'quarter';
    includeProjections?: boolean;
  }): Promise<{
    forecast: Array<{ date: string; inflow: number; outflow: number; balance: number }>;
    confidence: number;
    insights: string[];
  }> {
    try {
      const response = await api.post(AI_ENDPOINTS.PREDICTIONS.CASH_FLOW, params);
      return response.data;
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  static async forecastExpenses(params: {
    category?: string;
    timeframe: 'month' | 'quarter' | 'year';
  }): Promise<PredictionResult> {
    try {
      const response = await api.post(AI_ENDPOINTS.PREDICTIONS.EXPENSE_FORECAST, params);
      return response.data;
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  static async optimizeBudget(budgetData: any): Promise<{
    optimizedBudget: any;
    savings: number;
    recommendations: Array<{
      category: string;
      currentAmount: number;
      suggestedAmount: number;
      reasoning: string;
    }>;
  }> {
    try {
      const response = await api.post(AI_ENDPOINTS.PREDICTIONS.BUDGET_OPTIMIZATION, budgetData);
      return response.data;
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  private static handleError(error: any) {
    return {
      message: error.response?.data?.message || 'Predictive analytics failed',
      status: error.response?.status || 500,
      details: error.response?.data
    };
  }
}

// Intelligent Categorization Service
export class CategorizationService {
  static async categorizeExpense(data: any): Promise<{ suggestions: CategorySuggestion[] }> {
    try {
      const response = await api.post(AI_ENDPOINTS.CATEGORIZATION.AUTO_CATEGORIZE, data);
      return response.data;
    } catch (error) {
      console.error('Expense categorization failed:', error);
      throw error;
    }
  }

  static async categorizeExpenseOld(data: any): Promise<{ category: string; confidence: number; tags: string[] }> {
    try {
      const response = await api.post(AI_ENDPOINTS.CATEGORIZATION.AUTO_CATEGORIZE, data);
      return response.data;
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  static async suggestTags(invoiceData: any): Promise<{
    suggestedTags: string[];
    confidence: number;
  }> {
    try {
      const response = await api.post(AI_ENDPOINTS.CATEGORIZATION.SUGGEST_TAGS, invoiceData);
      return response.data;
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  static async classifyExpense(expenseData: any): Promise<{
    classification: string;
    subCategory: string;
    confidence: number;
    taxImplications: string[];
  }> {
    try {
      const response = await api.post(AI_ENDPOINTS.CATEGORIZATION.CLASSIFY_EXPENSE, expenseData);
      return response.data;
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  static async matchVendor(vendorInfo: any): Promise<{
    matches: MatchResult[];
    matchedVendor: any;
    confidence: number;
    suggestedMerges: any[];
  }> {
    try {
      const response = await api.post(AI_ENDPOINTS.CATEGORIZATION.VENDOR_MATCHING, vendorInfo);
      return {
        matches: response.data.matches || [],
        matchedVendor: response.data.matchedVendor,
        confidence: response.data.confidence,
        suggestedMerges: response.data.suggestedMerges || []
      };
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  private static handleError(error: any) {
    return {
      message: error.response?.data?.message || 'Categorization failed',
      status: error.response?.status || 500,
      details: error.response?.data
    };
  }
}

// Workflow Automation Service
export class WorkflowAutomationService {
  static async routeApproval(invoiceData: any): Promise<WorkflowResult> {
    try {
      const response = await api.post(AI_ENDPOINTS.WORKFLOW.ROUTE_APPROVAL, invoiceData);
      return response.data;
    } catch (error) {
      console.error('Approval routing failed:', error);
      throw error;
    }
  }

  static async routeForApproval(invoiceData: any): Promise<{
    suggestedApprovers: string[];
    priority: 'low' | 'medium' | 'high' | 'urgent';
    estimatedApprovalTime: number;
    reasoning: string;
  }> {
    try {
      const response = await api.post(AI_ENDPOINTS.AUTOMATION.APPROVAL_ROUTING, invoiceData);
      return response.data;
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  static async scorePriority(invoiceData: any): Promise<{
    priorityScore: number;
    priority: 'low' | 'medium' | 'high' | 'urgent';
    factors: Array<{ factor: string; impact: number }>;
  }> {
    try {
      const response = await api.post(AI_ENDPOINTS.AUTOMATION.PRIORITY_SCORING, invoiceData);
      return response.data;
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  static async optimizeWorkflow(workflowData: any): Promise<{
    optimizedWorkflow: any;
    improvements: string[];
    estimatedTimeSavings: number;
  }> {
    try {
      const response = await api.post(AI_ENDPOINTS.AUTOMATION.WORKFLOW_OPTIMIZATION, workflowData);
      return response.data;
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  static async detectAnomalies(data: any): Promise<{
    anomalies: Array<{
      type: string;
      severity: 'low' | 'medium' | 'high';
      description: string;
      suggestedAction: string;
    }>;
    overallRisk: number;
  }> {
    try {
      const response = await api.post(AI_ENDPOINTS.AUTOMATION.ANOMALY_DETECTION, data);
      return response.data;
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  private static handleError(error: any) {
    return {
      message: error.response?.data?.message || 'Workflow automation failed',
      status: error.response?.status || 500,
      details: error.response?.data
    };
  }
}

// AI Assistant Service
export class AIAssistantService {
  static async sendMessage(message: string, conversationId?: string): Promise<{
    response: string;
    conversationId: string;
    suggestions: string[];
  }> {
    try {
      const response = await api.post(AI_ENDPOINTS.ASSISTANT.CHAT, {
        message,
        conversationId
      });
      return response.data;
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  static async chatQuery(query: string): Promise<{
    response: string;
    suggestions: string[];
  }> {
    try {
      const response = await api.post(AI_ENDPOINTS.ASSISTANT.CHAT, { message: query });
      return {
        response: response.data.response,
        suggestions: response.data.suggestions || []
      };
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  static async queryInsights(query: string): Promise<{
    insights: any[];
    visualizations: any[];
    recommendations: string[];
  }> {
    try {
      const response = await api.post(AI_ENDPOINTS.ASSISTANT.QUERY_INSIGHTS, { query });
      return response.data;
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  static async generateReport(params: any): Promise<{
    insights: ReportInsight[];
    reportUrl: string;
    summary: string;
    keyFindings: string[];
  }> {
    try {
      const response = await api.post(AI_ENDPOINTS.ASSISTANT.GENERATE_REPORT, params);
      return {
        insights: response.data.insights || [],
        reportUrl: response.data.reportUrl,
        summary: response.data.summary,
        keyFindings: response.data.keyFindings || []
      };
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  static async generateInsights(reportData: any): Promise<{
    insights: ReportInsight[];
    reportUrl: string;
    summary: string;
    keyFindings: string[];
  }> {
    try {
      const response = await api.post(AI_ENDPOINTS.REPORTING.GENERATE_INSIGHTS, reportData);
      return {
        insights: response.data.insights || [],
        reportUrl: response.data.reportUrl,
        summary: response.data.summary,
        keyFindings: response.data.keyFindings || []
      };
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  static async recommendActions(context: any): Promise<{
    recommendations: Array<{
      action: string;
      priority: number;
      reasoning: string;
      estimatedImpact: string;
    }>;
  }> {
    try {
      const response = await api.post(AI_ENDPOINTS.ASSISTANT.RECOMMEND_ACTIONS, context);
      return response.data;
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  private static handleError(error: any) {
    return {
      message: error.response?.data?.message || 'AI assistant failed',
      status: error.response?.status || 500,
      details: error.response?.data
    };
  }
}
