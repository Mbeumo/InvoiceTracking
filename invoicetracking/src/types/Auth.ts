/**
 * Authentication Types and Interfaces
 * 
 * These types define the data structure for the authentication system.
 * They will be used both in the frontend and should match the backend database schema.
 * 
 * FUTURE ENHANCEMENT: Sync these types with Python backend models and MySQL database schema
 */

export interface User {
    id: string;                    // TODO: Change to UUID in MySQL
    name: string;                  // Full name of the user
    email: string;                 // Unique email address (indexed in MySQL)
    service: string;               // Department/service the user belongs to
    role: UserRole;                // User role for permission management
    avatar?: string;               // Optional profile picture URL
    lastLogin?: string;            // ISO timestamp of last login
    permissions: Permission[];     // Array of user permissions
    
    // TODO: Add these fields for MySQL integration:
    // createdAt: Date;            // User creation timestamp
    // updatedAt: Date;            // Last update timestamp
    // isActive: boolean;          // Account status
    // emailVerified: boolean;     // Email verification status
    // failedLoginAttempts: number; // Security tracking
    // lockedUntil?: Date;         // Account lockout
}

export type UserRole = 'admin' | 'manager' | 'employee' | 'viewer';

/**
 * Permission system for role-based access control (RBAC)
 * 
 * TODO: Implement in MySQL as a separate permissions table:
 * - permissions (id, name, description)
 * - user_permissions (user_id, permission_id)
 * - role_permissions (role_id, permission_id)
 */
export type Permission =
    | 'create_invoice'      // Create new invoices
    | 'edit_invoice'        // Modify existing invoices
    | 'approve_invoice'     // Approve invoices for payment
    | 'reject_invoice'      // Reject invoices
    | 'transfer_invoice'    // Transfer invoices between departments
    | 'delete_invoice'      // Delete invoices (admin only)
    | 'view_all_invoices'   // View all invoices in system
    | 'manage_users'        // User management (admin only)
    | 'view_reports'        // Access to reports and analytics
    | 'export_data';        // Export data to various formats

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

// TODO: Add these interfaces for future backend integration:

// export interface PasswordResetRequest {
//     email: string;
// }

// export interface PasswordReset {
//     token: string;
//     newPassword: string;
//     confirmPassword: string;
// }

// export interface ChangePassword {
//     currentPassword: string;
//     newPassword: string;
//     confirmPassword: string;
// }

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