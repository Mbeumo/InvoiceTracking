// API Service Layer for Django Backend Communication
import api from '../controllers/api';
import { API_ENDPOINTS } from './apiEndpoints';
import { SettingsData } from '../hooks/useSettings';
/**
 * API Service Layer for Django Backend Communication
 * 
 * This service provides a centralized way to communicate with the Django backend.
 * All API calls should go through this service for consistency and error handling.
 */

// Types for API responses
export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

export interface ApiError {
  message: string;
  status: number;
  details?: any;
}

// Authentication Service
export class AuthService {
  static async login(email: string, password: string) {
    try {
      console.log('Login attempt:', {
        url: API_ENDPOINTS.AUTH.LOGIN,
        method: 'POST',
        data: { email, password: '***' }
      });
      
      const response = await api.post(API_ENDPOINTS.AUTH.LOGIN, {
        email,
        password
      });
      
      console.log('Login success:', response.status);
      return response.data;
    } catch (error: any) {
      console.error('Login failed:', error.response?.status, error.response?.data);
      throw this.handleError(error);
    }
  }

  static async register(userData: any) {
    try {
      const response = await api.post(API_ENDPOINTS.AUTH.REGISTER, userData);
      return response.data;
    } catch (error: any) {
      throw this.handleError(error);
    }
  }
static async getServices(): Promise<{ id: string; name: string }[]> {
    try {
        const response = await api.get(API_ENDPOINTS.SERVICE.LIST);
        return response.data;
    } catch (error: any) {
        throw this.handleError(error);
    }
}


  static async logout() {
    try {
        await api.post(API_ENDPOINTS.AUTH.LOGOUT, {
            refresh: localStorage.getItem('refreshToken')
        });
        localStorage.removeItem('authToken');
        localStorage.removeItem('refreshToken');
    } catch (error: any) {
        

      // Ignore logout errors, clear local storage anyway
      console.warn('Logout error:', error);
    }
  }



  static async getCurrentUser() {
    try {
      const response = await api.get(API_ENDPOINTS.AUTH.ME);
      const userData = response.data;
      
      // Ensure permissions are properly formatted
      if (userData.user_permissions && Array.isArray(userData.user_permissions)) {
        userData.permissions = userData.user_permissions;
      }
      
      // Add permission metadata
      userData.permission_last_updated = new Date().toISOString();
      userData.permission_source = 'fresh';
      
      return userData;
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  static async refreshUserPermissions(userId: string) {
    try {
      console.log('Refreshing permissions for user:', userId);
      const response = await api.get(`${API_ENDPOINTS.AUTH.ME}?refresh_permissions=true`);
      const userData = response.data;
      
      // Process Django permissions
      if (userData.user_permissions && Array.isArray(userData.user_permissions)) {
        userData.permissions = userData.user_permissions;
      }
      
      // Add fresh permission metadata
      userData.permission_last_updated = new Date().toISOString();
      userData.permission_source = 'fresh';
      
      return userData;
    } catch (error: any) {
      console.warn('Failed to refresh permissions, using cached data');
      throw this.handleError(error);
    }
  }

  static async refreshToken(refreshToken: string) {
    try {
      const response = await api.post(API_ENDPOINTS.AUTH.REFRESH, {
        refresh: refreshToken
      });
      return response.data;
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  private static handleError(error: any): ApiError {
    console.error('AuthService Error:', {
      message: error.message,
      status: error.response?.status,
      data: error.response?.data,
      config: {
        url: error.config?.url,
        method: error.config?.method,
        baseURL: error.config?.baseURL
      }
    });
    
    return {
      message: error.response?.data?.message || error.response?.data?.detail || error.message || 'An error occurred',
      status: error.response?.status || 500,
      details: error.response?.data
    };
  }
}

// Invoice Service
export class InvoiceService {
  static async getInvoices(params?: { page?: number; pageSize?: number; search?: string }) {
    try {
      const response = await api.get(API_ENDPOINTS.INVOICES.LIST, { params });
      return response.data;
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  static async getInvoice(id: string) {
    try {
      const response = await api.get(API_ENDPOINTS.INVOICES.DETAIL(id));
      return response.data;
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  static async createInvoice(invoiceData: any) {
    try {
      const response = await api.post(API_ENDPOINTS.INVOICES.CREATE, invoiceData);
      return response.data;
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  static async updateInvoice(id: string, invoiceData: any) {
    try {
      const response = await api.put(API_ENDPOINTS.INVOICES.UPDATE(id), invoiceData);
      return response.data;
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  static async deleteInvoice(id: string) {
    try {
      await api.delete(API_ENDPOINTS.INVOICES.DELETE(id));
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  static async exportInvoices(format: 'pdf' | 'excel' | 'csv' = 'pdf') {
    try {
      const response = await api.get(API_ENDPOINTS.INVOICES.EXPORT, {
        params: { format },
        responseType: 'blob'
      });
      return response.data;
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  static async searchInvoices(query: string, filters?: any) {
    try {
      const response = await api.get(API_ENDPOINTS.INVOICES.SEARCH, {
        params: { q: query, ...filters }
      });
      return response.data;
    } catch (error: any) {
      throw this.handleError(error);
    }
  }
    static async uploadInvoiceFile(file: File) {
        try {
            const formData = new FormData();
            formData.append('file', file);

            const response = await api.post(API_ENDPOINTS.INVOICES.UPLOAD, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });

            return response.data;
        } catch (error: any) {
            throw this.handleError(error);
        }
    }

  private static handleError(error: any): ApiError {
    console.error('InvoiceService Error:', {
      message: error.message,
      status: error.response?.status,
      data: error.response?.data,
      config: {
        url: error.config?.url,
        method: error.config?.method,
        baseURL: error.config?.baseURL
      }
    });
    
    return {
      message: error.response?.data?.message || error.response?.data?.detail || error.message || 'An error occurred',
      status: error.response?.status || 500,
      details: error.response?.data
    };
  }
}

// User Service
export class UserService {
  static async getUsers(params?: { page?: number; pageSize?: number }) {
    try {
      const response = await api.get(API_ENDPOINTS.USERS.LIST, { params });
      return response.data;
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  static async getUser(id: string) {
    try {
      const response = await api.get(API_ENDPOINTS.USERS.DETAIL(id));
      return response.data;
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  static async createUser(userData: any) {
    try {
      const response = await api.post(API_ENDPOINTS.USERS.CREATE, userData);
      return response.data;
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  static async updateUser(id: string, userData: any) {
    try {
      const response = await api.put(API_ENDPOINTS.USERS.UPDATE(id), userData);
      return response.data;
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  static async deleteUser(id: string) {
    try {
      await api.delete(API_ENDPOINTS.USERS.DELETE(id));
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  static async getUserPermissions() {
    try {
      const response = await api.get(API_ENDPOINTS.USERS.PERMISSIONS);
      return response.data;
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  private static handleError(error: any): ApiError {
    console.error('UserService Error:', {
      message: error.message,
      status: error.response?.status,
      data: error.response?.data,
      config: {
        url: error.config?.url,
        method: error.config?.method,
        baseURL: error.config?.baseURL
      }
    });
    
    return {
      message: error.response?.data?.message || error.response?.data?.detail || error.message || 'An error occurred',
      status: error.response?.status || 500,
      details: error.response?.data
    };
  }
}

// Analytics Service
export class AnalyticsService {
  static async getSummary(dateRange?: { start: string; end: string }) {
    try {
      const response = await api.get(API_ENDPOINTS.ANALYTICS.SUMMARY, {
        params: dateRange
      });
      return response.data;
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  static async getRevenue(dateRange?: { start: string; end: string }) {
    try {
      const response = await api.get(API_ENDPOINTS.ANALYTICS.REVENUE, {
        params: dateRange
      });
      return response.data;
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  static async getTrends(period: 'daily' | 'weekly' | 'monthly' = 'monthly') {
    try {
      const response = await api.get(API_ENDPOINTS.ANALYTICS.TRENDS, {
        params: { period }
      });
      return response.data;
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  private static handleError(error: any): ApiError {
    console.error('AnalyticService Error:', {
      message: error.message,
      status: error.response?.status,
      data: error.response?.data,
      config: {
        url: error.config?.url,
        method: error.config?.method,
        baseURL: error.config?.baseURL
      }
    });
    
    return {
      message: error.response?.data?.message || error.response?.data?.detail || error.message || 'An error occurred',
      status: error.response?.status || 500,
      details: error.response?.data
    };
  }
}

// Notification Service
export class NotificationService {
  static async getNotifications(params?: { page?: number; pageSize?: number }) {
    try {
      const response = await api.get(API_ENDPOINTS.NOTIFICATIONS.LIST, { params });
      return response.data;
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  static async markAsRead(id: string) {
    try {
      await api.post(API_ENDPOINTS.NOTIFICATIONS.MARK_READ(id));
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  static async markAllAsRead() {
    try {
      await api.post(API_ENDPOINTS.NOTIFICATIONS.MARK_ALL_READ);
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  static async deleteNotification(id: string) {
    try {
      await api.delete(API_ENDPOINTS.NOTIFICATIONS.DELETE(id));
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  private static handleError(error: any): ApiError {
    console.error('NotificationService Error:', {
      message: error.message,
      status: error.response?.status,
      data: error.response?.data,
      config: {
        url: error.config?.url,
        method: error.config?.method,
        baseURL: error.config?.baseURL
      }
    });
    
    return {
      message: error.response?.data?.message || error.response?.data?.detail || error.message || 'An error occurred',
      status: error.response?.status || 500,
      details: error.response?.data
    };
  }
}
//Services

export class DepartmentService {
    static async getServices(): Promise<{ service_id: string; name: string }[]> {
        try {
            const response = await api.get(API_ENDPOINTS.SERVICE.LIST);
            return response.data;
        } catch (error: any) {
            throw this.handleError(error);
        }
    }
    async getDepartmentsByUser(userId: string): Promise<{ id: string; name: string }[]> {
        try {
            const response = await api.get(`${API_ENDPOINTS.SERVICE.BY_USER}/${userId}`);
            return response.data;
        } catch (error: any) {
            throw new Error(error?.response?.data?.message || 'Failed to fetch user departments');
        }
    }

    async getDepartmentsByService(serviceId: string): Promise<{ id: string; name: string }[]> {
        try {
            const response = await api.get(`${API_ENDPOINTS.SERVICE.BY_SERVICE}/${serviceId}`);
            return response.data;
        } catch (error: any) {
            throw new Error(error?.response?.data?.message || 'Failed to fetch service departments');
        }
    }
    private static handleError(error: any): ApiError {
        console.error('DepartmentService Error:', {
            message: error.message,
            status: error.response?.status,
            data: error.response?.data,
            config: {
                url: error.config?.url,
                method: error.config?.method,
                baseURL: error.config?.baseURL
            }
        });

        return {
            message: error.response?.data?.message || error.response?.data?.detail || error.message || 'An error occurred',
            status: error.response?.status || 500,
            details: error.response?.data
        };
    }
}

// File Service
export class FileService {
  static async uploadFile(file: File, onProgress?: (progress: number) => void) {
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await api.post(API_ENDPOINTS.FILES.UPLOAD, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        },
        onUploadProgress: (progressEvent) => {
          if (onProgress && progressEvent.total) {
            const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            onProgress(progress);
          }
        }
      });
      return response.data;
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  static async processOCR(fileId: string) {
    try {
      const response = await api.post(API_ENDPOINTS.FILES.OCR_PROCESS, { file_id: fileId });
      return response.data;
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  static async deleteFile(id: string) {
    try {
      await api.delete(API_ENDPOINTS.FILES.DELETE(id));
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  private static handleError(error: any): ApiError {
    console.error('FileService Error:', {
      message: error.message,
      status: error.response?.status,
      data: error.response?.data,
      config: {
        url: error.config?.url,
        method: error.config?.method,
        baseURL: error.config?.baseURL
      }
    });
    
    return {
      message: error.response?.data?.message || error.response?.data?.detail || error.message || 'An error occurred',
      status: error.response?.status || 500,
      details: error.response?.data
    };
  }
}

// Settings Service
// services/SettingsService.ts
import api from "../controllers/api";
import { API_ENDPOINTS } from "./apiEndpoints";
import { SettingsData } from "../types/settings";
import { ApiError } from "./apiService";

export class SettingsService {
    /**
     * Fetch both user & system settings
     */
    static async getSettings(): Promise<SettingsData> {
        try {
            const response = await api.get(API_ENDPOINTS.SETTINGS.GET); // → "/settings/"
            return response.data;
        } catch (error: any) {
            throw this.handleError(error);
        }
    }

    /**
     * Create new setting (POST /settings/)
     */
    static async createSetting(setting: {
        key: string;
        value: any;
        setting_type?: string;
        category?: string;
    }): Promise<any> {
        try {
            const response = await api.post(API_ENDPOINTS.SETTINGS.GET, setting);
            return response.data;
        } catch (error: any) {
            throw this.handleError(error);
        }
    }

    /**
     * Update a specific system setting
     * (PUT /settings/<uuid:id>/update/)
     */
    static async updateSetting(id: string, setting: {
        value: any;
    }): Promise<any> {
        try {
            const response = await api.put(API_ENDPOINTS.SETTINGS.UPDATE(id), setting);
            return response.data;
        } catch (error: any) {
            throw this.handleError(error);
        }
    }

    /**
     * Bulk update (if you want to send the whole structure at once)
     */
    /*static async updateAll(settings: SettingsData): Promise<SettingsData> {
        try {
            const response = await api.put(API_ENDPOINTS.SETTINGS.BULK_UPDATE, settings);
            return response.data;
        } catch (error: any) {
            throw this.handleError(error);
        }
    }*/

    private static handleError(error: any): ApiError {
        console.error("SettingsService Error:", {
            message: error.message,
            status: error.response?.status,
            data: error.response?.data,
            config: {
                url: error.config?.url,
                method: error.config?.method,
                baseURL: error.config?.baseURL,
            },
        });

        return {
            message:
                error.response?.data?.message ||
                error.response?.data?.detail ||
                error.message ||
                "An error occurred",
            status: error.response?.status || 500,
            details: error.response?.data,
        };
    }
}

