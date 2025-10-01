import React, { useEffect, useState, useCallback } from "react";
import { Invoice } from "../types/invoice";
import { User } from "../types/auth";
import { InvoiceList } from "./InvoiceList";
import { Card } from "../components/Card";
import { Loader2 } from "lucide-react";
import { useInvoices } from "../hooks/useInvoices";

interface InvoicesPageProps {
    user: User;
}

export const InvoicesPage: React.FC<InvoicesPageProps> = ({ user }) => {
   //const [invoices, setInvoices] = useState<Invoice[]>([]);
   // const [loading, setLoading] = useState(true);
   // const [error, setError] = useState<string | null>(null);
    const [filters, setFilters] = useState<{ search?: string; status?: string; service?: string }>({});

    const {
        invoices,
        error,
        loading,
        fetchInvoices,
        createInvoice,
        updateInvoice,
        deleteInvoice,
        exportInvoices,
        searchInvoices,
        uploadInvoiceFile,
    } = useInvoices();

    const handleFilterChange = useCallback(
        async (f: typeof filters) => {
            setFilters(f);
        },
        []
    );

   
    // CRUD Handlers
    const handleUpdateInvoice = async (id: number, updates: Partial<Invoice>) => {
        await updateInvoice(id, updates);
    };

    const handleDeleteInvoice = async (id: number) => {
        await deleteInvoice(id);
    };

    const handleCreateInvoice = async (invoice:  Partial<Invoice>) => { 
        await createInvoice(invoice);
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

            {!loading && !error && (
                <InvoiceList
                    invoices={invoices}
                    user={user}
                    onFilterChange={handleFilterChange}
                    onCreate={handleCreateInvoice}
                    onDelete={handleDeleteInvoice}
                    onUpdate={handleUpdateInvoice}
                />
            )}
        </div>
    );
};
