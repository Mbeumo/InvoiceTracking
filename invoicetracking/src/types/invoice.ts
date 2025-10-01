/**
 * Invoice Types and Interfaces
 * 
 * These types define the data structure for the invoice system.
 * They match the Django backend models and database schema.
 */

export interface Invoice {
    id: number; // UUID, optional for insert
    // Vendor Info
    number: string;
    vendor_name: string;
    vendor_email?: string;
    vendor_phone?: string;

    // Financials
    subtotal: number;
    tax_amount: number;
    total_amount: number;
    currency: string;
    exchange_rate?: number;
    base_currency_amount?: number;

    // Description & Notes
    description?: string;
    notes?: string;
    external_reference?: string;

    // Dates
    invoice_date: string;
    issue_date: string;
    due_date: string;
    payment_date?: string;
    discount_due_date?: string;

    // Status & Workflow
    status: string;
    current_service: string;
    assigned_to?: string;
    priority: string;

    // Approval
    approval_level: number;
    approved_by?: string;
    approved_at?: string;
    rejection_reason?: string;

    // Payment Terms
    payment_terms: number;
    late_fees?: number;
    discount_amount?: number;

    // File & Metadata
    file: string;
    created_by: string;
    updated_by?: string;
    version: number;
    created_at?: string;
    updated_at?: string;

    // OCR & Matching
    raw_text?: string;
    ocr_confidence?: number;
    matched_template?: string;
    workflow?: string;

    // Derived Fields (optional, from serializer)
    days_until_due?: number;
    is_overdue?: boolean;
    comments_count?: number;
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
    pendingAmount: number;
}

export interface InvoiceActivity {
    id: string;
    type: 'created' | 'approved' | 'rejected' | 'transferred' | 'paid';
    description: string;
    timestamp: string;
    user: string;
    invoiceId?: string;
}
