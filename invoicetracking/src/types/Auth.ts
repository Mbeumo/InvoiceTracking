/**
 * Authentication Types and Interfaces
 * 
 * These types define the data structure for the authentication system.
 * They will be used both in the frontend and should match the backend database schema.
 * 
 * FUTURE ENHANCEMENT: Sync these types with Python backend models and MySQL database schema
 */

export type UserRole = 'admin' | 'manager' | 'employee' | 'viewer';


export interface Permissions {
    codename: string;   // e.g. "view_user"
    name: string;       // e.g. "Can view user"
    app_label: string;
}
export interface User {
    id: string;                     // UUID
    email: string;                  // Unique email address
    name: string;                   // Full name
    role: UserRole;                 // Role for RBAC
    serviceId?: string;             // Department/service
    employeeId?: string | null;     // Employee ID (nullable)
    phone?: string | null;          // Phone number
    avatarUrl?: string | null;      // Profile picture URL
    managerId?: string | null;      // Manager’s ID
    location?: string | null;       // User location
    is_superuser: 1 | 0 ;
    // Account status
    isActive: boolean;
    emailVerified: boolean;
    lastLogin?: string | null;      // ISO timestamp
    failedLoginAttempts?: number;
    lockedUntil?: string | null;
    passwordChangedAt?: string | null;
    requirePasswordChange?: boolean;

    // Audit fields
    createdAt: string;              // ISO timestamp
    updatedAt: string;              // ISO timestamp
    createdBy?: string | null;
    updatedBy?: string | null;
    notes?: string | null;

    // Permissions
    permission: Permissions [
        /*codename: string,   // e.g. "view_user"
        name: string,   // e.g. "Can view user"
        app_label: string,*/
    ]      // e.g. "users";
    permission_last_updated: string;
    permission_source: string;
}

/**
 * Permission system for role-based access control (RBAC)
 * 
 * TODO: Implement in MySQL as a separate permissions table:
 * - permissions (id, name, description)
 * - user_permissions (user_id, permission_id)
 * - role_permissions (role_id, permission_id)
 */
/*export type Permission =
    | 'create_invoice'      // Create new invoices
    | 'edit_invoice'        // Modify existing invoices
    | 'approve_invoice'     // Approve invoices for payment
    | 'reject_invoice'      // Reject invoices
    | 'transfer_invoice'    // Transfer invoices between departments
    | 'delete_invoice'      // Delete invoices (admin only)
    | 'view_all_invoices'   // View all invoices in system
    | 'manage_users'        // User management (admin only)
    | 'view_reports'
    | 'view_invoices'
    | 'view_all_users'
    | 'view_analytics'
    | 'view_notifications'
    | 'export_data'
    | 'manage_services'
    | 'manage_settings'
    | 'view_audit_logs'
    | 'manage_workflows'
    | 'bulk_operations' ;        // Export data to various formats

export const adminPermissions: Permission[] = [
    'view_all_users',
    'create_invoice',
    'edit_invoice',
    'approve_invoice',
    'reject_invoice',
    'transfer_invoice',
    'delete_invoice',
    'view_all_invoices',
    'manage_users',
    'view_reports',
    'export_data',
    'manage_services',
    'manage_settings',
    'view_audit_logs',
    'manage_workflows',
    'bulk_operations',
];

export const managerPermissions: Permission[] = [
    'create_invoice',
    'edit_invoice',
    'approve_invoice',
    'reject_invoice',
    'transfer_invoice',
    'view_all_invoices',
    'view_reports',
    'export_data',
    'manage_services',
    'bulk_operations',
];

export const employeePermissions: Permission[] = [
    'create_invoice',
    'edit_invoice',
    'view_all_invoices',
];

export const viewerPermissions: Permission[] = [
    'view_all_invoices',
    'view_reports',
];

export const defaultPermissionsByRole: Record<UserRole, Permission[]> = {
        admin: adminPermissions,
        manager: managerPermissions,
        employee: employeePermissions,
        viewer: viewerPermissions,
    };
*/
export interface AuthState {
    user: User | null;           // Currently authenticated user
    isAuthenticated: boolean;     // Authentication status
    isLoading: boolean;          // Loading state for async operations
    
    // TODO: Add these for JWT integration:
    // token: string | null;      // JWT access token
    // refreshToken: string | null; // JWT refresh token
    // tokenExpiry: Date | null;  // Token expiration time
}

export interface LoginCredentials {
    email: string;               // User's email address
    password: string;            // Plain text password (will be hashed by backend)
    
    // TODO: Add these for enhanced security:
    // rememberMe: boolean;       // Remember user session
    // twoFactorCode?: string;    // 2FA code if enabled
}


export interface RegisterData {
    name: string;
    email: string;
    password: string;
    service: string;
    role: UserRole;
    avatar_url?: string;
}

// TODO: Add these interfaces for future backend integration:

// export interface PasswordResetRequest {
//     email: string;
// }

export interface PasswordReset {
     token: string;
     newPassword: string;
    confirmPassword: string;
}

export interface ChangePassword {
     currentPassword: string;
     newPassword: string;
     confirmPassword: string;
}

// export interface UserProfile {
//     name: string;
//     avatar?: string;
//     preferences: UserPreferences;
// }

// export interface UserPreferences {
//     language: string;
//     timezone: string;
//     notifications: NotificationSettings;
// }