import { useEffect, useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { InvoiceService } from '../services/apiService';
import { Invoice } from '../types/invoice'; // Adjust path if needed

interface UseInvoicesParams {
    page?: number;
    pageSize?: number;
    search?: string;
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
            const data = await InvoiceService.getInvoices(params);
            setInvoices(data.results || data); // Adjust if paginated
        } catch (err: any) {
            console.error('Failed to fetch invoices:', err);
            setError(err.message || 'Failed to load invoices');
        } finally {
            setLoading(false);
        }
    };

    const getInvoice = async (id: string) => {
        return await InvoiceService.getInvoice(id);
    };

    const createInvoice = async (invoiceData: any) => {
        return await InvoiceService.createInvoice(invoiceData);
    };

    const updateInvoice = async (id: string, invoiceData: any) => {
        return await InvoiceService.updateInvoice(id, invoiceData);
    };

    const deleteInvoice = async (id: string) => {
        return await InvoiceService.deleteInvoice(id);
    };

    const exportInvoices = async (format: 'pdf' | 'excel' | 'csv' = 'pdf') => {
        return await InvoiceService.exportInvoices(format);
    };

    const searchInvoices = async (query: string, filters?: any) => {
        return await InvoiceService.searchInvoices(query, filters);
    };

    const uploadInvoiceFile = async (file: File) => {
        return await InvoiceService.uploadInvoiceFile(file);
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