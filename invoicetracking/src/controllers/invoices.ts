import { InvoiceService } from '../services/apiService';

export interface InvoiceListParams {
    status?: string;
    service?: string;
    assignee?: string;
    search?: string;
    page?: number;
    pageSize?: number;
}

export const fetchInvoices = async (params: InvoiceListParams = {}) => {
    return await InvoiceService.getInvoices(params);
};

export const fetchInvoice = async (id: string) => {
    return await InvoiceService.getInvoice(id);
};

export const createInvoice = async (payload: any) => {
    return await InvoiceService.createInvoice(payload);
};

export const updateInvoice = async (id: string, payload: any) => {
    return await InvoiceService.updateInvoice(id, payload);
};

// TODO: Add these methods to InvoiceService for approval workflow
export const approveInvoice = async (id: string) => {
    // Placeholder: Replace with InvoiceService.approveInvoice(id) when implemented
    throw new Error('Approval workflow not yet implemented in API service');
};

export const rejectInvoice = async (id: string, reason?: string) => {
    // Placeholder: Replace with InvoiceService.rejectInvoice(id, reason) when implemented
    throw new Error('Rejection workflow not yet implemented in API service');
};


