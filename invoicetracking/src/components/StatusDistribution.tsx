import React, { useMemo } from 'react';
import { TrendingUp } from 'lucide-react';
import { Card } from './Card';
import { Invoice } from '../types/invoice';
import { useI18n } from '../i18n'; 

interface StatusDistributionProps {
    invoices: Invoice[];
}

export const StatusDistribution: React.FC<StatusDistributionProps> = ({ invoices }) => {
    const { t } = useI18n();
    const statusDistribution = useMemo(() => [
        { label: t('invoice.status.draft'), count: invoices.filter(inv => inv.status === 'draft').length, color: 'bg-gray-400' },
        { label: t('invoice.status.pending'), count: invoices.filter(inv => inv.status === 'pending_approval').length, color: 'bg-yellow-400' },
        { label: t('invoice.status.approved'), count: invoices.filter(inv => inv.status === 'approved').length, color: 'bg-green-400' },
        { label: t('invoice.status.rejected'), count: invoices.filter(inv => inv.status === 'rejected').length, color: 'bg-red-400' },
        { label: t('invoice.status.in_payment'), count: invoices.filter(inv => inv.status === 'in_payment').length, color: 'bg-blue-400' },
        { label: t('invoice.status.paid'), count: invoices.filter(inv => inv.status === 'paid').length, color: 'bg-emerald-400' }
    ], [t, invoices]);
    invoices.forEach(inv => {
        console.log(`Invoice ${inv.status}:`, typeof inv.total_amount, inv.total_amount);
    });
    return (
        <Card 
            title={ t('dashboard.status_distribution') }
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
