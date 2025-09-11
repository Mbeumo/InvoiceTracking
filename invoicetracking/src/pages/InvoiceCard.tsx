import React from 'react';
import { Calendar, User, Building, Euro, AlertTriangle } from 'lucide-react';
import { Card } from '../components/Card';
import { Invoice } from '../types/DatabaseModels';

interface InvoiceCardProps {
    invoice: Invoice;
    onClick: () => void;
}

const statusStyles = {
    draft: 'bg-gray-100 text-gray-800 border-gray-200',
    pending_review: 'bg-orange-100 text-orange-800 border-orange-200',
    pending_approval: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    approved: 'bg-green-100 text-green-800 border-green-200',
    rejected: 'bg-red-100 text-red-800 border-red-200',
    transferred: 'bg-purple-100 text-purple-800 border-purple-200',
    paid: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    cancelled: 'bg-gray-100 text-gray-800 border-gray-200',
    archived: 'bg-slate-100 text-slate-800 border-slate-200'
};

const statusLabels = {
    draft: 'Brouillon',
    pending_review: 'En révision',
    pending_approval: 'En attente',
    approved: 'Approuvée',
    rejected: 'Rejetée',
    transferred: 'Transférée',
    paid: 'Payée',
    cancelled: 'Annulée',
    archived: 'Archivée'
};

const priorityStyles = {
    low: 'bg-gray-100 text-gray-600',
    medium: 'bg-blue-100 text-blue-600',
    high: 'bg-red-100 text-red-600',
    urgent: 'bg-orange-100 text-orange-600',
    critical: 'bg-red-200 text-red-800'
};

const priorityLabels = {
    low: 'Faible',
    medium: 'Moyenne',
    high: 'Haute',
    urgent: 'Urgente',
    critical: 'Critique'
};

export const InvoiceCard: React.FC<InvoiceCardProps> = ({ invoice, onClick }) => {
    const isOverdue = new Date(invoice.dueDate) < new Date() && invoice.status !== 'paid';

    return (
        <div onClick={onClick} className="cursor-pointer">
            <Card className="hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start mb-4">
                    <div>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{invoice.number}</h3>
                        <p className="text-gray-600 dark:text-gray-300">{invoice.vendorName}</p>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                        <span className={`px-3 py-1 rounded-full text-sm font-medium border ${statusStyles[invoice.status]}`}>
                            {statusLabels[invoice.status]}
                        </span>
                        <span className={`px-2 py-1 rounded text-xs font-medium ${priorityStyles[invoice.priority]}`}>
                            {priorityLabels[invoice.priority]}
                        </span>
                    </div>
                </div>

                <div className="space-y-3">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center text-gray-600 dark:text-gray-300">
                            <Euro className="h-4 w-4 mr-2" />
                            <span className="font-medium">{invoice.totalAmount.toLocaleString()} {invoice.currency}</span>
                        </div>
                        {isOverdue && (
                            <div className="flex items-center text-red-600">
                                <AlertTriangle className="h-4 w-4 mr-1" />
                                <span className="text-sm">Overdue</span>
                            </div>
                        )}
                    </div>

                    <div className="flex items-center text-gray-600 dark:text-gray-300">
                        <Calendar className="h-4 w-4 mr-2" />
                        <span className="text-sm">Due: {new Date(invoice.dueDate).toLocaleDateString()}</span>
                    </div>

                    <div className="flex items-center justify-between">
                        <div className="flex items-center text-gray-600 dark:text-gray-300">
                            <Building className="h-4 w-4 mr-2" />
                            <span className="text-sm">{invoice.currentService}</span>
                        </div>
                        <div className="flex items-center text-gray-600 dark:text-gray-300">
                            <User className="h-4 w-4 mr-2" />
                            <span className="text-sm">{invoice.assignedTo}</span>
                        </div>
                    </div>
                </div>

                <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700">
                    <p className="text-sm text-gray-600 dark:text-gray-300 truncate">{invoice.description}</p>
                </div>
            </Card>
        </div>
    );
};