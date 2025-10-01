import React from 'react';
import { Euro } from 'lucide-react';
import { Card } from './Card';
import { InvoiceStats } from '../types/invoice';
import { useI18n } from '../i18n';

interface FinancialSummaryProps {
    stats: InvoiceStats;
}

export const FinancialSummary: React.FC<FinancialSummaryProps> = ({ stats }) => {
    const { t } = useI18n();
    return (
        <Card 
            title={t('dashboard.financial_amounts') }
            headerRight={<Euro className="h-6 w-6 text-green-600" />}
        >
            <div className="space-y-3">
                <div className="flex justify-between items-center">
                    <span className="text-gray-600">{t('dashboard.total_amount')}</span>
                    <span className="font-semibold">{stats.totalAmount.toLocaleString("fr-FR", { style: "currency", currency: "XAF" })}
                    </span>
                </div>
                <div className="flex justify-between items-center">
                    <span className="text-gray-600">{t('dashboard.paid_amount')}</span>
                    <span className="font-semibold text-green-600">{stats.paidAmount.toLocaleString()} FCFA</span>
                </div>
                <div className="flex justify-between items-center pt-3 border-t">
                    <span className="text-gray-600">{ t('dashboard.pending_amount')}</span>
                    <span className="font-semibold text-yellow-600">
                        {(stats.pendingAmount).toLocaleString()} FCFA
                    </span>
                </div>
            </div>
        </Card>
    );
};

export default FinancialSummary;
