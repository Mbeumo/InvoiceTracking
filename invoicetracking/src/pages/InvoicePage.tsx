import React, { useEffect, useState, useCallback } from "react";
import { Invoice } from "../types/DatabaseModels";
import { User } from "../types/auth";
import { InvoiceList } from "./InvoiceList";
import { Card } from "../components/Card";
import { Loader2 } from "lucide-react";
import { useInvoices } from "../hooks/useInvoices";

interface InvoicesPageProps {
    user: User;
}

export const InvoicesPage: React.FC<InvoicesPageProps> = ({ user }) => {
    const [invoices, setInvoices] = useState<Invoice[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [filters, setFilters] = useState<{ search?: string; status?: string; service?: string }>({});
    const {
        fetchInvoices,
        createInvoice,
        updateInvoice,
        deleteInvoice,
        exportInvoices,
        searchInvoices,
        uploadInvoiceFile,
    } = useInvoices();
    const handleFilterChange = useCallback((f) => {
        fetchInvoices(f);
    }, [fetchInvoices]);
    /*useEffect(() => {
        const loadInvoices = async () => {
            try {
                setLoading(true);
                const data = await fetchInvoices(filters); 
                setInvoices(data);
            } catch (err: any) {
                setError(err.message || "Failed to load invoices");
            } finally {
                setLoading(false);
            }
        };

        loadInvoices();
    }, [filters, fetchInvoices]);
    */
    // CRUD Handlers
    const handleUpdateInvoice = async (id: string, updates: Partial<Invoice>) => {
        const updated = await updateInvoice(id, updates);
        setInvoices((prev) => prev.map((inv) => (inv.id === id ? updated : inv)));
    };

    const handleDeleteInvoice = async (id: string) => {
        await deleteInvoice(id);
        setInvoices((prev) => prev.filter((inv) => inv.id !== id));
    };

    const handleCreateInvoice = async (invoice: Partial<Invoice>) => {
        const created = await createInvoice(invoice);
        setInvoices((prev) => [created, ...prev]);
    };

    return (
        <div className="max-w-7xl mx-auto px-4 py-8 space-y-6">
            {loading && (
                <Card>
                    <div className="flex items-center justify-center py-12 text-gray-500">
                        <Loader2 className="h-6 w-6 animate-spin mr-2" />
                        Loading invoices...
                    </div>
                </Card>
            )}

            {error && (
                <Card>
                    <div className="text-red-600 p-4">⚠ {error}</div>
                </Card>
            )}

            <InvoiceList
                invoices={invoices}
                user={user}
                onFilterChange={handleFilterChange}
            />
        </div>
    );
};