import React, { useState } from 'react';
import { Invoice } from '../types/DatabaseModels';
import { User,Permissions} from '../types/auth';
import { InvoiceCard } from './InvoiceCard';
import { InvoiceDetails } from './InvoiceCardDetail';
import { Plus } from 'lucide-react';
import { Toolbar } from '../components/Toolbar';
import { Filters } from '../components/Filters';
import { Card } from '../components/Card';
import { Section } from '../components/Section';
import { Stat } from '../components/Stat';

interface InvoiceListProps {
    invoices: Invoice[];
    user: User;
    onUpdate: (invoiceId: string, updates: Partial<Invoice>) => void;
}

export const InvoiceList: React.FC<InvoiceListProps> = ({ invoices, user, onUpdate }) => {
    const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [serviceFilter, setServiceFilter] = useState('all');

    // Filter invoices based on permissions
    const hasInvoicePermission = user?.permission ? (
        (p: Permissions) => p.codename === 'view_invoice'
    ) : false;

    const visibleInvoices = hasInvoicePermission
        ? invoices || [] 
        : (invoices || []).filter(inv => inv.currentService === user.serviceId);

    const filteredInvoices = visibleInvoices.filter(invoice => {
        const matchesSearch =
            invoice.number.toLowerCase().includes(searchTerm.toLowerCase()) ||
            invoice.vendorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            invoice.description.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesStatus = statusFilter === 'all' || invoice.status === statusFilter;
        const matchesService = serviceFilter === 'all' || invoice.currentService === serviceFilter;

        return matchesSearch && matchesStatus && matchesService;
    });

    // Calculate statistics
    const stats = {
        total: filteredInvoices.length,
        overdue: filteredInvoices.filter(inv => new Date(inv.dueDate) < new Date() && inv.status !== 'paid').length,
        pending: filteredInvoices.filter(inv => inv.status === 'pending_approval').length,
        paid: filteredInvoices.filter(inv => inv.status === 'paid').length
    };

    return (
        <div className="space-y-6">
            {/* Statistics Overview */}
            <Section>
                <Stat label="Total Invoices" value={stats.total} />
                <Stat label="Overdue" value={stats.overdue} subtitle="Requires attention" />
                <Stat label="Pending Approval" value={stats.pending} subtitle="Awaiting review" />
                <Stat label="Paid" value={stats.paid} subtitle="Completed" />
            </Section>

            {/* Filters and Search */}
            <Card>
                <Toolbar
                    left={
                        <Filters
                            search={searchTerm}
                            onSearch={setSearchTerm}
                            status={statusFilter}
                            onStatus={setStatusFilter}
                            service={serviceFilter}
                            onService={setServiceFilter}
                        />
                    }
                    right={
                        user.permission?( (p: Permissions) => p.codename === 'view_invoice')  && (
                            <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md flex items-center transition-colors">
                                <Plus className="h-4 w-4 mr-2" />
                                New Invoice
                            </button>
                        ) : false 
                    }
                />
            </Card>

            {/* Invoice List */}
            <Section>
                {filteredInvoices.map((invoice) => (
                    <InvoiceCard
                        key={invoice.id}
                        invoice={invoice}
                        onClick={() => setSelectedInvoice(invoice)}
                    />
                ))}
            </Section>

            {filteredInvoices.length === 0 && (
                <Card>
                    <div className="text-center py-12">
                        <div className="text-gray-400 text-4xl mb-4">📋</div>
                        <p className="text-gray-500">No invoices match the search criteria</p>
                    </div>
                </Card>
            )}

            {/* Invoice Details Modal */}
            {selectedInvoice && (
                <InvoiceDetails
                    invoice={selectedInvoice}
                    user={user}
                    onClose={() => setSelectedInvoice(null)}
                    onUpdate={onUpdate}
                />
            )}
        </div>
    );
};