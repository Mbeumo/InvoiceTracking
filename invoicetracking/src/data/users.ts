import { User, Permission } from '../types/auth';

/**
 * MOCK DATA - TEMPORARY IMPLEMENTATION
 * 
 * This file contains mock data for development and testing purposes.
 * 
 * FUTURE ENHANCEMENT: Replace with MySQL database queries and Python backend API calls
 * 
 * BACKEND INTEGRATION PLAN:
 * 1. Create MySQL database schema
 * 2. Implement Python backend with FastAPI/Flask
 * 3. Replace mock data with real database queries
 * 4. Add proper data validation and sanitization
 * 5. Implement caching for frequently accessed data
 */

/**
 * Role-based permissions mapping
 * 
 * TODO: Move to MySQL database with these tables:
 * - roles (id, name, description)
 * - permissions (id, name, description, category)
 * - role_permissions (role_id, permission_id)
 * 
 * Python backend should:
 * - Load permissions from database on startup
 * - Cache permissions for performance
 * - Provide API endpoint to get role permissions
 */
export const rolePermissions: Record<string, Permission[]> = {
    admin: [
        'create_invoice',
        'edit_invoice',
        'approve_invoice',
        'reject_invoice',
        'transfer_invoice',
        'delete_invoice',
        'view_all_invoices',
        'manage_users',
        'view_reports',
        'export_data'
    ],
    manager: [
        'create_invoice',
        'edit_invoice',
        'approve_invoice',
        'reject_invoice',
        'transfer_invoice',
        'view_all_invoices',
        'view_reports',
        'export_data'
    ],
    employee: [
        'create_invoice',
        'edit_invoice',
        'transfer_invoice',
        'view_reports'
    ],
    viewer: [
        'view_reports'
    ]
};

/**
 * Mock user data for development
 * 
 * TODO: Replace with MySQL database table 'users':
 * 
 * CREATE TABLE users (
 *     id VARCHAR(36) PRIMARY KEY,           -- UUID
 *     name VARCHAR(255) NOT NULL,
 *     email VARCHAR(255) UNIQUE NOT NULL,
 *     password_hash VARCHAR(255) NOT NULL,   -- bcrypt hash
 *     service VARCHAR(100) NOT NULL,
 *     role ENUM('admin', 'manager', 'employee', 'viewer') NOT NULL,
 *     avatar_url TEXT,
 *     last_login TIMESTAMP NULL,
 *     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
 *     updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
 *     is_active BOOLEAN DEFAULT TRUE,
 *     email_verified BOOLEAN DEFAULT FALSE,
 *     failed_login_attempts INT DEFAULT 0,
 *     locked_until TIMESTAMP NULL,
 *     INDEX idx_email (email),
 *     INDEX idx_role (role),
 *     INDEX idx_service (service)
 * );
 * 
 * Python backend should:
 * - Use SQLAlchemy ORM for database operations
 * - Implement proper password hashing with bcrypt
 * - Add database migrations for schema changes
 * - Implement user search and filtering
 */
export const mockUsers: User[] = [
    {
        id: '1',
        name: 'Marie Dubois',
        email: 'marie.dubois@company.com',
        service: 'accounting',
        role: 'admin',
        avatar: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop',
        lastLogin: '2024-01-15T08:30:00Z',
        permissions: rolePermissions.admin
    },
    {
        id: '2',
        name: 'Pierre Martin',
        email: 'pierre.martin@company.com',
        service: 'purchasing',
        role: 'manager',
        avatar: 'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop',
        lastLogin: '2024-01-14T14:20:00Z',
        permissions: rolePermissions.manager
    },
    {
        id: '3',
        name: 'Sophie Laurent',
        email: 'sophie.laurent@company.com',
        service: 'finance',
        role: 'manager',
        avatar: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop',
        lastLogin: '2024-01-15T09:45:00Z',
        permissions: rolePermissions.manager
    },
    {
        id: '4',
        name: 'Jean Durand',
        email: 'jean.durand@company.com',
        service: 'management',
        role: 'employee',
        avatar: 'https://images.pexels.com/photos/1681010/pexels-photo-1681010.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop',
        lastLogin: '2024-01-13T16:10:00Z',
        permissions: rolePermissions.employee
    },
    {
        id: '5',
        name: 'Alice Bernard',
        email: 'alice.bernard@company.com',
        service: 'hr',
        role: 'viewer',
        avatar: 'https://images.pexels.com/photos/1130626/pexels-photo-1130626.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop',
        lastLogin: '2024-01-12T11:30:00Z',
        permissions: rolePermissions.viewer
    }
];

/**
 * Demo credentials for testing
 * 
 * TODO: Remove this after implementing real authentication
 * 
 * Python backend should:
 * - Never store plain text passwords
 * - Use bcrypt for password hashing
 * - Implement secure password validation
 * - Add password complexity requirements
 * - Implement account lockout after failed attempts
 * - Add password expiration policy
 * - Implement secure password reset flow
 */
export const demoCredentials = [
    { email: 'marie.dubois@company.com', password: 'admin123' },
    { email: 'pierre.martin@company.com', password: 'manager123' },
    { email: 'sophie.laurent@company.com', password: 'manager123' },
    { email: 'jean.durand@company.com', password: 'employee123' },
    { email: 'alice.bernard@company.com', password: 'viewer123' }
];

/**
 * FUTURE ENHANCEMENTS:
 * 
 * 1. Database Schema:
 *    - Add audit_logs table for tracking user actions
 *    - Add user_sessions table for session management
 *    - Add password_history table for password policies
 *    - Add user_groups table for organizational structure
 * 
 * 2. Python Backend Features:
 *    - User management API endpoints
 *    - Role and permission management
 *    - User activity monitoring
 *    - Bulk user operations
 *    - User import/export functionality
 * 
 * 3. Security Enhancements:
 *    - Two-factor authentication (2FA)
 *    - IP-based access control
 *    - Session timeout management
 *    - Brute force protection
 *    - Account lockout mechanisms
 * 
 * 4. Performance Optimizations:
 *    - Redis caching for user data
 *    - Database connection pooling
 *    - Query optimization and indexing
 *    - Background job processing
 */