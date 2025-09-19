import { useEffect, useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { InvoiceService } from '../services/apiService';


export const useInvoices = () => {
    const { user, hasPermission, refreshPermissions } = useAuth();

    useEffect(() => {
        const fetchInvoices = async () => {
            try {
                const response = await InvoiceService.getInvoices(); // your API call
            } catch (error) {
                console.error('Failed to fetch invoices:', error);
            }
        };

        fetchInvoices();
    }, []);
}