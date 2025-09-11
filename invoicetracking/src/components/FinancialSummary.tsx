import React from 'react';
import { Euro } from 'lucide-react';
import { Card } from './Card';
import { InvoiceStats } from '../types/invoice';

interface FinancialSummaryProps {
    stats: InvoiceStats;
}

export const FinancialSummary: React.FC<FinancialSummaryProps> = ({ stats }) => {
    return (
        <Card 
            title="Montants financiers"
            headerRight={<Euro className="h-6 w-6 text-green-600" />}
        >
            <div className="space-y-3">
                <div className="flex justify-between items-center">
                    <span className="text-gray-600">Total des factures</span>
                    <span className="font-semibold">{stats.totalAmount.toLocaleString()} EUR</span>
                </div>
                <div className="flex justify-between items-center">
                    <span className="text-gray-600">Montant payé</span>
                    <span className="font-semibold text-green-600">{stats.paidAmount.toLocaleString()} EUR</span>
                </div>
                <div className="flex justify-between items-center pt-3 border-t">
                    <span className="text-gray-600">En attente de paiement</span>
                    <span className="font-semibold text-yellow-600">
                        {(stats.totalAmount - stats.paidAmount).toLocaleString()} EUR
                    </span>
                </div>
            </div>
        </Card>
    );
};

export default FinancialSummary;
