/**
 * Authentication and User Types
 * 
 * Enhanced types for the advanced invoice tracking system
 * with comprehensive permission management and security features
 */

export interface User {
    // Core Identity
    id: string;
    employeeId?: string;
    name: string;
    email: string;
    phone?: string;
    avatar?: string;
    avatarUrl?: string;
    
    // Organization
    serviceId: string;
    role: UserRole;
    managerId?: string;
    location?: string;
    timezone?: string;
    
    // Authentication & Security
    isActive: boolean;
    emailVerified: boolean;
    lastLogin?: string;
    failedLoginAttempts: number;
    lockedUntil?: string;
    passwordChangedAt?: string;
    requirePasswordChange: boolean;
    
    // Permissions & Access
    permissions: Permissions[];
    permission_last_updated?: string;
    permission_source?: 'cache' | 'fresh';
    is_superuser?: boolean;
    
    // Audit & Metadata
    createdAt: string;
    updatedAt: string;
    createdBy?: string;
    updatedBy?: string;
    notes?: string;
}

export interface Permissions {
    codename: string;
    name: string;
    app_label: string;
}

export type UserRole = 'admin' | 'manager' | 'employee' | 'viewer' | 'approver' | 'finance';

export interface AuthState {
    user: User | null;
    isAuthenticated: boolean;
    isLoading: boolean;
}

export interface LoginCredentials {
    email: string;
    password: string;
}

export interface RegisterData {
    name: string;
    email: string;
    password: string;
    service: string;
    role: UserRole;
    avatar_url?: string;
    timezone?: string;
}

// Enhanced permission system
export type Permission =
    | 'create_invoice'
    | 'edit_invoice'
    | 'approve_invoice'
    | 'reject_invoice'
    | 'transfer_invoice'
    | 'delete_invoice'
    | 'view_all_invoices'
    | 'view_invoice'
    | 'manage_users'
    | 'view_users'
    | 'view_reports'
    | 'export_data'
    | 'manage_services'
    | 'manage_settings'
    | 'view_audit_logs'
    | 'manage_workflows'
    | 'bulk_operations'
    | 'ai_insights'
    | 'fraud_detection'
    | 'predictive_analytics'
    | 'system_admin';

// Security and audit types
export interface SecurityEvent {
    id: string;
    timestamp: string;
    userId?: string;
    userName: string;
    userEmail: string;
    actionType: string;
    actionDescription: string;
    ipAddress: string;
    userAgent: string;
    riskLevel: 'low' | 'medium' | 'high' | 'critical';
    riskIndicators: string[];
    metadata: Record<string, any>;
}

export interface SessionInfo {
    sessionId: string;
    userId: string;
    ipAddress: string;
    userAgent: string;
    createdAt: string;
    lastActivity: string;
    expiresAt: string;
    isActive: boolean;
}

// AI and automation types
export interface AIProcessingStatus {
    status: 'pending' | 'processing' | 'completed' | 'failed';
    confidence?: number;
    processingTime?: number;
    errorMessage?: string;
    recommendations?: string[];
}

export interface UserPreferences {
    language: string;
    timezone: string;
    theme: 'light' | 'dark' | 'auto';
    notifications: {
        email: boolean;
        push: boolean;
        sms: boolean;
        reminderDays: number[];
    };
    dashboard: {
        defaultView: string;
        refreshInterval: number;
        showAIInsights: boolean;
    };
}