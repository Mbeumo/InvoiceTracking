import { useEffect, useState } from 'react';
import { useAuth } from '../controllers/useAuth';
export const useInvoices = () => {
    const { user, hasPermission, refreshPermissions } = useAuth();

    useEffect(() => {
        const fetchInvoices = async () => {
            try {
                const response = await InvoiceService.getAll(); // your API call
                setInvoices(response.data);
            } catch (error) {
                console.error('Failed to fetch invoices:', error);
            }
        };

        fetchInvoices();
    }, []);
}