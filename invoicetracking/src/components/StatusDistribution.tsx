import React from 'react';
import { TrendingUp } from 'lucide-react';
import { Card } from './Card';
import { Invoice } from '../types/invoice';

interface StatusDistributionProps {
    invoices: Invoice[];
}

export const StatusDistribution: React.FC<StatusDistributionProps> = ({ invoices }) => {
    const statusDistribution = [
        { label: 'Brouillon', count: invoices.filter(inv => inv.status === 'draft').length, color: 'bg-gray-400' },
        { label: 'En attente', count: invoices.filter(inv => inv.status === 'pending_approval').length, color: 'bg-yellow-400' },
        { label: 'Approuvées', count: invoices.filter(inv => inv.status === 'approved').length, color: 'bg-green-400' },
        { label: 'Rejetées', count: invoices.filter(inv => inv.status === 'rejected').length, color: 'bg-red-400' },
        { label: 'En paiement', count: invoices.filter(inv => inv.status === 'in_payment').length, color: 'bg-blue-400' },
        { label: 'Payées', count: invoices.filter(inv => inv.status === 'paid').length, color: 'bg-emerald-400' }
    ];

    return (
        <Card 
            title="Distribution par statut"
            headerRight={<TrendingUp className="h-6 w-6 text-blue-600" />}
        >
            <div className="space-y-3">
                {statusDistribution.map((item, index) => (
                    <div key={index} className="flex items-center justify-between">
                        <div className="flex items-center">
                            <div className={`w-3 h-3 rounded-full ${item.color} mr-3`}></div>
                            <span className="text-gray-700">{item.label}</span>
                        </div>
                        <span className="font-medium">{item.count}</span>
                    </div>
                ))}
            </div>
        </Card>
    );
};

export default StatusDistribution;
