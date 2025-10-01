/**
 * API Endpoints Configuration for Django Backend
 * 
 * Replace the placeholder URLs with your actual Django backend endpoints
 * Base URL is configured in .env as VITE_API_BASE_URL
 */

export const API_ENDPOINTS = {
  // Authentication endpoints
  AUTH: {
    LOGIN: 'auth/token/', // TODO: Replace with your Django login endpoint
    REFRESH: 'auth/token/refresh/', // TODO: Replace with your Django token refresh endpoint
    LOGOUT: 'auth/logout/', // TODO: Replace with your Django logout endpoint
    REGISTER: 'register/', // TODO: Replace with your Django registration endpoint
    ME: 'me/', // TODO: Replace with your Django user profile endpoint
    CHANGE_PASSWORD: 'users/change-password/', // TODO: Replace with your Django password change endpoint
    RESET_PASSWORD: 'users/reset-password/', // TODO: Replace with your Django password reset endpoint
  },

  // Invoice management endpoints
  INVOICES: {
    LIST: 'invoices/', // TODO: Replace with your Django invoices list endpoint
    CREATE: 'invoices/', // TODO: Replace with your Django invoice creation endpoint
    DETAIL: (id: number ) => `invoices/${id}/`, // TODO: Replace with your Django invoice detail endpoint
    UPDATE: (id: number ) => `invoices/${id}/`, // TODO: Replace with your Django invoice update endpoint
    DELETE: (id: number ) => `invoices/${id}/`, // TODO: Replace with your Django invoice delete endpoint
    EXPORT: 'invoices/export/', // TODO: Replace with your Django invoice export endpoint
    BULK_DELETE: 'invoices/bulk-delete/', // TODO: Replace with your Django bulk delete endpoint
    SEARCH: 'invoices/search/', // TODO: Replace with your Django invoice search endpoint
    UPLOAD: 'invoices/ocr-upload/' 
  },

  // User management endpoints
  USERS: {
    LIST: 'users/', // TODO: Replace with your Django users list endpoint
    CREATE: 'users/', // TODO: Replace with your Django user creation endpoint
    DETAIL: (id: string) => `users/${id}/`, // TODO: Replace with your Django user detail endpoint
    UPDATE: (id: string) => `users/${id}/`, // TODO: Replace with your Django user update endpoint
    DELETE: (id: string) => `users/${id}/`, // TODO: Replace with your Django user delete endpoint
    PERMISSIONS: 'users/permissions/', // TODO: Replace with your Django permissions endpoint
    PERMISSIONS_OF_USER: (id: string) => `users/${id}/permissions/`,
    GROUPS_OF_USER: (id: string) => `users/${id}/groups/`,
  },

  // Analytics endpoints
  ANALYTICS: {
    SUMMARY: 'analytics/summary/', // TODO: Replace with your Django analytics summary endpoint
    REVENUE: 'analytics/revenue/', // TODO: Replace with your Django revenue analytics endpoint
    TRENDS: 'analytics/trends/', // TODO: Replace with your Django trends endpoint
    EXPORT: 'analytics/export/', // TODO: Replace with your Django analytics export endpoint
  },

  // Notifications endpoints
  NOTIFICATIONS: {
    LIST: 'notifications/', // TODO: Replace with your Django notifications list endpoint
    MARK_READ: (id: string) => `notifications/${id}/read/`, // TODO: Replace with your Django mark as read endpoint
    MARK_ALL_READ: 'notifications/mark-all-read/', // TODO: Replace with your Django mark all as read endpoint
    DELETE: (id: string) => `notifications/${id}/`, // TODO: Replace with your Django notification delete endpoint
  },

  // OCR and file upload endpoints
  FILES: {
    UPLOAD: 'files/upload/', // TODO: Replace with your Django file upload endpoint
    OCR_PROCESS: 'files/ocr/', // TODO: Replace with your Django OCR processing endpoint
    DELETE: (id: string) => `files/${id}/`, // TODO: Replace with your Django file delete endpoint
  },

  // Permissions and groups management
  PERMISSIONS: {
    LIST: 'permissions/',
  },
  GROUPS: {
    LIST: 'groups/',
    DETAIL: (id: string) => `groups/${id}/`,
    PERMISSIONS: (id: string) => `groups/${id}/permissions/`,
  },

  SERVICE: {
      LIST: '/services/',
      CREATE: '/services/',
      BY_USER: '/departments/user',      
      BY_SERVICE: '/departments/service'
  },


  // Settings and configuration endpoints
  SETTINGS: {
    GET: 'settings/', // TODO: Replace with your Django settings endpoint
     BULK_UPDATE: 'settings/update/',// TODO: Replace with your Django settings update endpoint
      POST: 'settings/', // TODO: Replace with your Django settings create endpoint
    //THEME: 'settings/theme/', // TODO: Replace with your Django theme settings endpoint
    //LANGUAGE: 'settings/language/', // TODO: Replace with your Django language settings endpoint
  },

  // Reports endpoints
  REPORTS: {
    GENERATE: 'reports/generate/', // TODO: Replace with your Django report generation endpoint
    LIST: 'reports/', // TODO: Replace with your Django reports list endpoint
    DOWNLOAD: (id: string) => `/reports/${id}/download/`, // TODO: Replace with your Django report download endpoint
  }
} as const;

// WebSocket endpoints for real-time features
export const WS_ENDPOINTS = {
  INVOICES: '/ws/invoices/', // TODO: Replace with your Django WebSocket endpoint for invoices
  NOTIFICATIONS: '/ws/notifications/', // TODO: Replace with your Django WebSocket endpoint for notifications
  ANALYTICS: '/ws/analytics/', // TODO: Replace with your Django WebSocket endpoint for analytics
} as const;
