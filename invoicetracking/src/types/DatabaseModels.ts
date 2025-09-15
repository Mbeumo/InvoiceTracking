/**
 * COMPREHENSIVE DATABASE MODELS FOR INVOICE TRACKING SYSTEM
 * 
 * These models define the complete database schema for a production-ready
 * invoice tracking application with MySQL backend.
 * 
 * FUTURE IMPLEMENTATION: Sync with Python backend SQLAlchemy models
 */

// ============================================================================
// USER MANAGEMENT
// ============================================================================

//export interface User {
//    // Core Identity
//    id: string;                    // UUID primary key
//    employeeId?: string;           // Company employee ID
//    name: string;                  // Full name
//    email: string;                 // Unique email (indexed)
//    phone?: string;                // Contact phone
//    avatar?: string;               // Profile picture URL
    
//    // Organization
//    serviceId: string;               // Department/service (FK to services.id)
//    role: UserRole;                // User role for RBAC
//    managerId?: string;            // FK to users.id (hierarchical structure)
//    location?: string;             // Office location
//    timezone?: string;             // User timezone
    
//    // Authentication & Security
//    passwordHash: string;          // bcrypt hash (never store plain text)
//    isActive: boolean;             // Account status
//    emailVerified: boolean;        // Email verification status
//    lastLogin?: string;            // ISO timestamp
//    failedLoginAttempts: number;   // Security tracking
//    lockedUntil?: Date;            // Account lockout
//    passwordChangedAt?: string;    // Password change timestamp
//    requirePasswordChange: boolean; // Force password change
    
//    // Permissions & Access
//    permissions: Permission[];     // Array of user permissions
//    customPermissions?: string[];  // Additional custom permissions
    
//    // Audit & Metadata
//    createdAt: string;             // ISO timestamp
//    updatedAt: string;             // ISO timestamp
//    createdBy?: string;            // FK to users.id
//    updatedBy?: string;            // FK to users.id
//    notes?: string;                // Admin notes
//}

//export type UserRole = 'admin' | 'manager' | 'employee' | 'viewer' | 'approver' | 'finance';// | 'vendor';

//export type Permission =
//    |'view_all_users'
//    | 'create_invoice'
//    | 'edit_invoice'
//    | 'approve_invoice'
//    | 'reject_invoice'
//    | 'transfer_invoice'
//    | 'delete_invoice'
//    | 'view_all_invoices'
//    | 'manage_users'
//    | 'view_reports'
//    | 'export_data'
//    | 'manage_services'
//    | 'manage_settings'
//    | 'view_audit_logs'
//    | 'manage_workflows'
//    | 'bulk_operations';

//// 🔐 Default permissions per role
//export const adminPermissions: Permission[] = [
//    'view_all_users',
//    'create_invoice',
//    'edit_invoice',
//    'approve_invoice',
//    'reject_invoice',
//    'transfer_invoice',
//    'delete_invoice',
//    'view_all_invoices',
//    'manage_users',
//    'view_reports',
//    'export_data',
//    'manage_services',
//    'manage_settings',
//    'view_audit_logs',
//    'manage_workflows',
//    'bulk_operations',
//];

//export const managerPermissions: Permission[] = [
//    'create_invoice',
//    'edit_invoice',
//    'approve_invoice',
//    'reject_invoice',
//    'transfer_invoice',
//    'view_all_invoices',
//    'view_reports',
//    'export_data',
//    'manage_services',
//    'bulk_operations',
//];

//export const employeePermissions: Permission[] = [
//    'create_invoice',
//    'edit_invoice',
//    'view_all_invoices',
//];

//export const viewerPermissions: Permission[] = [
//    'view_all_invoices',
//    'view_reports',
//];

//export const approverPermissions: Permission[] = [
//    'approve_invoice',
//    'reject_invoice',
//    'view_all_invoices',
//];

//export const financePermissions: Permission[] = [
//    'transfer_invoice',
//    'delete_invoice',
//    'view_all_invoices',
//    'view_reports',
//    'export_data',
//];

//// 🧩 Role-to-permissions map for dynamic access
//export const defaultPermissionsByRole: Record<UserRole, Permission[]> = {
//    admin: adminPermissions,
//    manager: managerPermissions,
//    employee: employeePermissions,
//    viewer: viewerPermissions,
//    approver: approverPermissions,
//    finance: financePermissions,
//};

// ============================================================================
// SERVICE/DEPARTMENT MANAGEMENT
// ============================================================================

export interface Service {
    id: string;                    // Unique service identifier
    name: string;                  // Display name
    code: string;                  // Short code (e.g., 'ACC', 'PUR')
    description?: string;           // Service description
    color: string;                 // Hex color for UI
    icon?: string;                 // Icon identifier
    
    // Workflow Configuration
    canCreateInvoices: boolean;    // Can this service create invoices?
    canApproveInvoices: boolean;   // Can this service approve invoices?
    approvalThreshold?: number;    // Max amount for self-approval
    requiresManagerApproval: boolean; // Always require manager approval?
    
    // Business Rules
    defaultCurrency: string;       // Default currency for invoices
    paymentTerms: number;          // Default payment terms (days)
    costCenter?: string;           // Cost center code
    
    // Status
    isActive: boolean;             // Service status
    createdAt: string;             // ISO timestamp
    updatedAt: string;             // ISO timestamp
    createdBy: string;             // FK to users.id
}

// ============================================================================
// INVOICE MANAGEMENT
// ============================================================================

export interface Invoice {
    // Core Invoice Data
    id: string;                    // UUID primary key
    number: string;                // Invoice number (unique)
    vendorId: string;              // FK to vendors.id
    vendorName: string;            // Denormalized vendor name
    vendorEmail?: string;          // Vendor contact email
    vendorPhone?: string;          // Vendor contact phone
    
    // Financial Information
    subtotal: number;              // Amount before tax
    taxAmount: number;             // Tax amount
    totalAmount: number;           // Total amount (subtotal + tax)
    currency: string;              // Currency code (EUR, USD, etc.)
    exchangeRate?: number;         // Exchange rate if different from base currency
    baseCurrencyAmount?: number;   // Amount in base currency
    
    // Invoice Details
    description: string;           // Invoice description
    lineItems: InvoiceLineItem[];  // Detailed line items
    notes?: string;                // Internal notes
    externalReference?: string;    // Vendor's invoice number
    file: string;

    // Dates & Timing
    invoiceDate: string;           // Date on invoice
    receivedDate: string;          // Date received
    dueDate: string;               // Payment due date
    paymentDate?: string;          // Date paid
    
    // Workflow & Status
    status: InvoiceStatus;         // Current status
    currentService: string;        // FK to services.id
    assignedTo: string;            // FK to users.id
    priority: InvoicePriority;     // Priority level
    
    // Approval Process
    approvalLevel: number;         // Current approval level
    approvedBy?: string;           // FK to users.id
    approvedAt?: string;           // ISO timestamp
    rejectionReason?: string;      // Reason if rejected
    
    // Business Rules
    paymentTerms: number;          // Payment terms in days
    lateFees?: number;             // Late payment fees
    discountAmount?: number;       // Early payment discount
    discountDueDate?: string;      // Discount deadline
    
    // Audit & Metadata
    createdAt: string;             // ISO timestamp
    updatedAt: string;             // ISO timestamp
    createdBy: string;             // FK to users.id
    updatedBy: string;             // FK to users.id
    version: number;               // Version number for tracking changes
    
    // Attachments
    attachments?: InvoiceAttachment[]; // Related files
}

export interface InvoiceLineItem {
    id: string;                    // UUID primary key
    invoiceId: string;             // FK to invoices.id
    description: string;           // Item description
    quantity: number;              // Quantity
    unitPrice: number;             // Price per unit
    totalPrice: number;            // Total price (quantity * unitPrice)
    taxRate?: number;              // Tax rate percentage
    taxAmount?: number;            // Tax amount for this item
    costCenter?: string;           // Cost center code
    glAccount?: string;            // General ledger account
    category?: string;             // Expense category
}

export interface InvoiceAttachment {
    id: string;                    // UUID primary key
    invoiceId: string;             // FK to invoices.id
    fileName: string;              // Original filename
    filePath: string;              // Storage path
    fileSize: number;              // File size in bytes
    mimeType: string;              // File MIME type
    uploadedBy: string;            // FK to users.id
    uploadedAt: string;            // ISO timestamp
    description?: string;          // File description
}

export type InvoiceStatus = 
    | 'draft'              // Initial draft
    | 'pending_review'     // Waiting for review
    | 'pending_approval'   // Waiting for approval
    | 'approved'           // Approved for payment
    | 'rejected'           // Rejected
    | 'transferred'        // Transferred to another service
    | 'paid'               // Payment completed
    | 'cancelled'          // Cancelled
    | 'archived';          // Archived

export type InvoicePriority = 'low' | 'medium' | 'high' | 'urgent' | 'critical';

// ============================================================================
// VENDOR MANAGEMENT
// ============================================================================

export interface Vendor {
    id: string;                    // UUID primary key
    name: string;                  // Vendor name
    code: string;                  // Vendor code
    email?: string;                // Contact email
    phone?: string;                // Contact phone
    website?: string;              // Website URL
    
    // Address Information
    address?: string;              // Street address
    city?: string;                 // City
    state?: string;                // State/Province
    postalCode?: string;           // Postal code
    country?: string;              // Country
    
    // Business Information
    taxId?: string;                // Tax identification number
    registrationNumber?: string;   // Business registration number
    vatNumber?: string;            // VAT number
    
    // Payment Information
    defaultCurrency: string;       // Preferred currency
    paymentTerms: number;          // Default payment terms
    bankAccount?: string;          // Bank account details
    
    // Status & Metadata
    isActive: boolean;             // Vendor status
    rating?: number;               // Vendor rating (1-5)
    notes?: string;                // Internal notes
    createdAt: string;             // ISO timestamp
    updatedAt: string;             // ISO timestamp
    createdBy: string;             // FK to users.id
}

// ============================================================================
// INVOICE HISTORY & AUDIT TRAIL
// ============================================================================

export interface InvoiceHistory {
    id: string;                    // UUID primary key
    invoiceId: string;             // FK to invoices.id
    
    // Action Details
    action: string;                // Human-readable action description
    actionType: HistoryActionType; // Type of action performed
    
    // Status Changes
    fromStatus?: InvoiceStatus;    // Previous status
    toStatus?: InvoiceStatus;      // New status
    fromService?: string;          // Previous service
    toService?: string;            // New service
    
    // User Information
    userId: string;                // FK to users.id
    userName: string;              // Denormalized user name
    userEmail: string;             // Denormalized user email
    
    // Additional Context
    comment?: string;              // User comment or reason
    metadata?: Record<string, any>; // Additional data (JSON)
    
    // Timestamp
    timestamp: string;             // ISO timestamp
    
    // System Information
    ipAddress?: string;            // User's IP address
    userAgent?: string;            // User's browser/device
    sessionId?: string;            // User session ID
}

export type HistoryActionType = 
    | 'status_change'
    | 'service_transfer'
    | 'assignment_change'
    | 'approval'
    | 'rejection'
    | 'comment_added'
    | 'file_attached'
    | 'amount_modified'
    | 'due_date_changed'
    | 'priority_changed'
    | 'bulk_operation'
    | 'system_action';

// ============================================================================
// WORKFLOW & APPROVAL MANAGEMENT
// ============================================================================

export interface ApprovalWorkflow {
    id: string;                    // UUID primary key
    name: string;                  // Workflow name
    description?: string;          // Workflow description
    
    // Configuration
    serviceId: string;             // FK to services.id
    minAmount: number;             // Minimum amount for this workflow
    maxAmount?: number;            // Maximum amount (null = unlimited)
    
    // Approval Steps
    steps: ApprovalStep[];         // Array of approval steps
    isActive: boolean;             // Workflow status
    
    // Metadata
    createdAt: string;             // ISO timestamp
    updatedAt: string;             // ISO timestamp
    createdBy: string;             // FK to users.id
}

export interface ApprovalStep {
    stepNumber: number;            // Step order
    role: string;                  // Required role
    serviceId?: string;            // Required service (optional)
    userId?: string;               // Specific user (optional)
    minAmount?: number;            // Minimum amount for this step
    maxAmount?: number;            // Maximum amount for this step
    isRequired: boolean;           // Is this step mandatory?
    autoApprove?: boolean;         // Auto-approve if conditions met
}

// ============================================================================
// NOTIFICATIONS & COMMUNICATIONS
// ============================================================================

export interface Notification {
    id: string;                    // UUID primary key
    userId: string;                // FK to users.id
    type: NotificationType;        // Notification type
    title: string;                 // Notification title
    message: string;               // Notification message
    
    // Related Data
    relatedType?: string;          // Type of related entity
    relatedId?: string;            // ID of related entity
    
    // Status
    isRead: boolean;               // Read status
    isArchived: boolean;           // Archived status
    
    // Timestamps
    createdAt: string;             // ISO timestamp
    readAt?: string;               // When read
    expiresAt?: string;            // Expiration date
    
    // Delivery
    deliveryMethod: DeliveryMethod[]; // How to deliver
    deliveredAt?: string;          // When delivered
}

export type NotificationType = 
    | 'invoice_assigned'
    | 'approval_required'
    | 'status_changed'
    | 'due_date_approaching'
    | 'payment_received'
    | 'system_alert'
    | 'bulk_operation_complete';

export type DeliveryMethod = 'email' | 'sms' | 'push' | 'in_app';

// ============================================================================
// REPORTS & ANALYTICS
// ============================================================================

export interface Report {
    id: string;                    // UUID primary key
    name: string;                  // Report name
    description?: string;          // Report description
    type: ReportType;              // Report type
    
    // Configuration
    parameters: ReportParameter[];  // Report parameters
    schedule?: ReportSchedule;      // Scheduled execution
    recipients: string[];          // Array of user IDs
    
    // Status
    isActive: boolean;             // Report status
    lastRunAt?: string;            // Last execution
    nextRunAt?: string;            // Next scheduled run
    
    // Metadata
    createdAt: string;             // ISO timestamp
    updatedAt: string;             // ISO timestamp
    createdBy: string;             // FK to users.id
}

export type ReportType = 
    | 'invoice_summary'
    | 'approval_pipeline'
    | 'vendor_analysis'
    | 'service_performance'
    | 'payment_aging'
    | 'cost_center_analysis'
    | 'user_activity'
    | 'audit_trail';

export interface ReportParameter {
    name: string;                  // Parameter name
    type: 'string' | 'number' | 'date' | 'boolean' | 'select';
    defaultValue?: any;            // Default value
    required: boolean;             // Is required?
    options?: any[];               // Options for select type
}

export interface ReportSchedule {
    frequency: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly';
    dayOfWeek?: number;            // 0-6 (Sunday-Saturday)
    dayOfMonth?: number;           // 1-31
    time: string;                  // HH:MM format
    timezone: string;              // Timezone
}

// ============================================================================
// SYSTEM SETTINGS & CONFIGURATION
// ============================================================================

export interface SystemSetting {
    id: string;                    // Setting key
    value: any;                    // Setting value
    type: 'string' | 'number' | 'boolean' | 'json';
    description?: string;          // Setting description
    category: string;              // Setting category
    isEditable: boolean;           // Can users edit this?
    validation?: string;           // Validation rules
    
    // Metadata
    updatedAt: string;             // ISO timestamp
    updatedBy: string;             // FK to users.id
}

// ============================================================================
// AUDIT LOGS (SYSTEM LEVEL)
// ============================================================================

export interface AuditLog {
    id: string;                    // UUID primary key
    timestamp: string;             // ISO timestamp
    
    // User Information
    userId?: string;               // FK to users.id (null for system actions)
    userName?: string;             // User name
    userEmail?: string;            // User email
    ipAddress?: string;            // User IP address
    userAgent?: string;            // User browser/device
    
    // Action Details
    action: string;                // Action performed
    entityType: string;            // Type of entity affected
    entityId?: string;             // ID of entity affected
    oldValues?: Record<string, any>; // Previous values
    newValues?: Record<string, any>; // New values
    
    // Context
    sessionId?: string;            // User session ID
    requestId?: string;            // Request ID for tracking
    metadata?: Record<string, any>; // Additional context
} 