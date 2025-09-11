/**
 * AI Service Endpoints for Django Backend
 * 
 * Replace the placeholder URLs with your actual Django AI endpoints
 */

export const AI_ENDPOINTS = {
  // Fraud Detection & Security
  FRAUD_DETECTION: {
    ANALYZE_DOCUMENT: '/ai/fraud/analyze-document/',
    CHECK_DUPLICATE: '/ai/fraud/check-duplicate/',
    DUPLICATE_CHECK: '/ai/fraud/duplicate-check/',
    VERIFY_AUTHENTICITY: '/ai/fraud/verify-authenticity/',
    RISK_ASSESSMENT: '/ai/fraud/risk-assessment/'
  },

  // Document Processing & OCR
  DOCUMENT_AI: {
    EXTRACT_DATA: '/ai/ocr/extract-data/', // TODO: Replace with your Django OCR data extraction endpoint
    CLASSIFY_DOCUMENT: '/ai/ocr/classify/', // TODO: Replace with your Django document classification endpoint
    VALIDATE_FIELDS: '/ai/ocr/validate-fields/', // TODO: Replace with your Django field validation endpoint
    ENHANCE_IMAGE: '/ai/ocr/enhance-image/', // TODO: Replace with your Django image enhancement endpoint
  },

  // Predictive Analytics
  PREDICTIONS: {
    PAYMENT_DELAY: '/ai/predictions/payment-delay/', // TODO: Replace with your Django payment delay prediction endpoint
    CASH_FLOW: '/ai/predictions/cash-flow/', // TODO: Replace with your Django cash flow prediction endpoint
    EXPENSE_FORECAST: '/ai/predictions/expense-forecast/', // TODO: Replace with your Django expense forecasting endpoint
    BUDGET_OPTIMIZATION: '/ai/predictions/budget-optimization/', // TODO: Replace with your Django budget optimization endpoint
  },

  // Intelligent Categorization
  CATEGORIZATION: {
    AUTO_CATEGORIZE: '/ai/categorization/auto-categorize/', // TODO: Replace with your Django auto-categorization endpoint
    SUGGEST_TAGS: '/ai/categorization/suggest-tags/', // TODO: Replace with your Django tag suggestion endpoint
    CLASSIFY_EXPENSE: '/ai/categorization/classify-expense/', // TODO: Replace with your Django expense classification endpoint
    VENDOR_MATCHING: '/ai/categorization/vendor-matching/', // TODO: Replace with your Django vendor matching endpoint
  },

  // Workflow Automation
  AUTOMATION: {
    APPROVAL_ROUTING: '/ai/automation/approval-routing/', // TODO: Replace with your Django approval routing endpoint
    PRIORITY_SCORING: '/ai/automation/priority-scoring/', // TODO: Replace with your Django priority scoring endpoint
    WORKFLOW_OPTIMIZATION: '/ai/automation/workflow-optimization/', // TODO: Replace with your Django workflow optimization endpoint
    ANOMALY_DETECTION: '/ai/automation/anomaly-detection/', // TODO: Replace with your Django anomaly detection endpoint
  },

  // Workflow Management
  WORKFLOW: {
    ROUTE_APPROVAL: '/ai/workflow/route-approval/', // TODO: Replace with your Django workflow routing endpoint
    PRIORITY_SCORING: '/ai/workflow/priority-scoring/', // TODO: Replace with your Django priority scoring endpoint
    WORKFLOW_OPTIMIZATION: '/ai/workflow/optimization/', // TODO: Replace with your Django workflow optimization endpoint
  },

  // Natural Language Processing
  NLP: {
    EXTRACT_ENTITIES: '/ai/nlp/extract-entities/', // TODO: Replace with your Django entity extraction endpoint
    SENTIMENT_ANALYSIS: '/ai/nlp/sentiment-analysis/', // TODO: Replace with your Django sentiment analysis endpoint
    SUMMARIZE_DOCUMENT: '/ai/nlp/summarize/', // TODO: Replace with your Django document summarization endpoint
    TRANSLATE_TEXT: '/ai/nlp/translate/', // TODO: Replace with your Django translation endpoint
  },

  // AI Assistant & Chatbot
  ASSISTANT: {
    CHAT: '/ai/assistant/chat/', // TODO: Replace with your Django AI chat endpoint
    QUERY_INSIGHTS: '/ai/assistant/query-insights/', // TODO: Replace with your Django insights query endpoint
    GENERATE_REPORT: '/ai/assistant/generate-report/', // TODO: Replace with your Django AI report generation endpoint
    RECOMMEND_ACTIONS: '/ai/assistant/recommend-actions/', // TODO: Replace with your Django action recommendation endpoint
  },

  // Smart Insights & Analytics
  INSIGHTS: {
    SPENDING_PATTERNS: '/ai/insights/spending-patterns/', // TODO: Replace with your Django spending pattern analysis endpoint
    COST_OPTIMIZATION: '/ai/insights/cost-optimization/', // TODO: Replace with your Django cost optimization endpoint
    PERFORMANCE_METRICS: '/ai/insights/performance-metrics/', // TODO: Replace with your Django performance analysis endpoint
    TREND_ANALYSIS: '/ai/insights/trend-analysis/', // TODO: Replace with your Django trend analysis endpoint
  },

  // Reporting & Analytics
  REPORTING: {
    GENERATE_INSIGHTS: '/ai/reporting/generate-insights/', // TODO: Replace with your Django reporting insights endpoint
    EXPORT_REPORT: '/ai/reporting/export-report/', // TODO: Replace with your Django report export endpoint
    SCHEDULE_REPORT: '/ai/reporting/schedule-report/', // TODO: Replace with your Django report scheduling endpoint
  }
} as const;
