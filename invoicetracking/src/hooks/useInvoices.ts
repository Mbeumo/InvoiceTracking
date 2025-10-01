import { useEffect, useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { InvoiceService } from '../services/apiService';
import { Invoice } from '../types/DatabaseModels'; // Adjust path if needed

interface UseInvoicesParams {
    page?: number;
    pageSize?: number;
    search?: string;
    [key: string]: any;
}

export const useInvoices = (params?: UseInvoicesParams) => {
    const { user, hasPermission, refreshPermissions } = useAuth();

    const [invoices, setInvoices] = useState<Invoice[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        fetchInvoices(params);
    }, [params?.page, params?.pageSize, params?.search]);

    const fetchInvoices = async (params?: UseInvoicesParams) => {
        setLoading(true);
        setError(null);
        try {
            const data = await InvoiceService.getInvoices(params as any);
            setInvoices(data.results || data); // Adjust if paginated
        } catch (err: any) {
            console.error('Failed to fetch invoices:', err);
            setError(err.message || 'Failed to load invoices');
        } finally {
            setLoading(false);
        }
    };

    const getInvoice = async (id: number ) => {
        return await InvoiceService.getInvoice(id);
    };

    const createInvoice = async (invoiceData: Partial<Invoice> ) => {
        return await InvoiceService.createInvoice(invoiceData);
    };

    const updateInvoice = async (id: number, invoiceData: Partial<Invoice>) => {
        return await InvoiceService.updateInvoice(id, invoiceData);
    };

    const deleteInvoice = async (id: number) => {
        return await InvoiceService.deleteInvoice(id);
    };

    const exportInvoices = async (format: 'pdf' | 'excel' | 'csv' = 'pdf') => {
        return await InvoiceService.exportInvoices(format);
    };

    const searchInvoices = async (query: string, filters?: any) => {
        return await InvoiceService.searchInvoices(query, filters);
    };

    const uploadInvoiceFile = async (file: File, extraData?: Record<string, any>) => {
        return await InvoiceService.uploadInvoiceFile(file, extraData);
    };

    return {
        invoices,
        loading,
        error,
        fetchInvoices,
        getInvoice,
        createInvoice,
        updateInvoice,
        deleteInvoice,
        exportInvoices,
        searchInvoices,
        uploadInvoiceFile
    };
};