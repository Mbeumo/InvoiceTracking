/**
 * Invoice Types and Interfaces
 * 
 * These types define the data structure for the invoice system.
 * They match the Django backend models and database schema.
 */

export interface Invoice {
    id: string;
    invoiceNumber: string;
    supplierName: string;
    amount: number;
    currency: string;
    dueDate: string;
    issueDate: string;
    status: InvoiceStatus;
    currentService: string;
    assignedTo?: string;
    description?: string;
    attachments?: string[];
    createdAt: string;
    updatedAt: string;
    createdBy: string;
    
    // Payment information
    paymentDate?: string;
    paymentMethod?: string;
    paymentReference?: string;
    
    // Approval workflow
    approvedBy?: string;
    approvedAt?: string;
    rejectedBy?: string;
    rejectedAt?: string;
    rejectionReason?: string;
    
    // Categories and tags
    category?: string;
    tags?: string[];
    priority?: 'low' | 'medium' | 'high';
}

export type InvoiceStatus = 
    | 'draft'
    | 'pending_approval'
    | 'approved'
    | 'rejected'
    | 'in_payment'
    | 'paid'
    | 'overdue'
    | 'cancelled';

export interface InvoiceStats {
    total: number;
    pending: number;
    approved: number;
    paid: number;
    overdue: number;
    totalAmount: number;
    paidAmount: number;
}

export interface InvoiceActivity {
    id: string;
    type: 'created' | 'approved' | 'rejected' | 'transferred' | 'paid';
    description: string;
    timestamp: string;
    user: string;
    invoiceId?: string;
}
