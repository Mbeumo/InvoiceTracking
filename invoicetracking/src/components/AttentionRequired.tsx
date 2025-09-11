import React from 'react';
import { AlertTriangle, Clock, CheckCircle } from 'lucide-react';
import { Card } from './Card';
import { InvoiceStats } from '../types/invoice';

interface AttentionRequiredProps {
    stats: InvoiceStats;
    userService: string;
    hasViewAllPermission: boolean;
}

export const AttentionRequired: React.FC<AttentionRequiredProps> = ({ 
    stats, 
    userService, 
    hasViewAllPermission 
}) => {
    const title = `Factures nécessitant votre attention${
        !hasViewAllPermission ? ` (Service: ${userService})` : ''
    }`;

    return (
        <Card title={title}>
            <div className="space-y-3">
                {stats.overdue > 0 && (
                    <div className="flex items-center justify-between p-4 bg-red-50 rounded-lg border border-red-200">
                        <div className="flex items-center">
                            <AlertTriangle className="h-5 w-5 text-red-600 mr-3" />
                            <span className="text-red-800 font-medium">{stats.overdue} facture(s) en retard</span>
                        </div>
                        <span className="text-sm text-red-600">Action requise</span>
                    </div>
                )}
                {stats.pending > 0 && (
                    <div className="flex items-center justify-between p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                        <div className="flex items-center">
                            <Clock className="h-5 w-5 text-yellow-600 mr-3" />
                            <span className="text-yellow-800 font-medium">{stats.pending} facture(s) en attente d'approbation</span>
                        </div>
                        <span className="text-sm text-yellow-600">Révision nécessaire</span>
                    </div>
                )}
                {stats.overdue === 0 && stats.pending === 0 && (
                    <div className="flex items-center justify-center p-8 text-gray-500">
                        <CheckCircle className="h-8 w-8 mr-3" />
                        <span>Aucune facture ne nécessite d'attention immédiate</span>
                    </div>
                )}
            </div>
        </Card>
    );
};

export default AttentionRequired;
