import React from 'react';
import { Card } from './Card';
import { InvoiceStats } from '../types/invoice';

interface RecentActivityProps {
    stats: InvoiceStats;
}

export const RecentActivity: React.FC<RecentActivityProps> = ({ stats }) => {
    return (
        <Card title="Activité récente">
            <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                        <div className="h-2 w-2 bg-blue-500 rounded-full"></div>
                        <span className="text-sm text-gray-700">{stats.total} factures au total</span>
                    </div>
                    <span className="text-xs text-gray-500">Maintenant</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                        <div className="h-2 w-2 bg-green-500 rounded-full"></div>
                        <span className="text-sm text-gray-700">{stats.approved} factures approuvées</span>
                    </div>
                    <span className="text-xs text-gray-500">Récent</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                        <div className="h-2 w-2 bg-yellow-500 rounded-full"></div>
                        <span className="text-sm text-gray-700">{stats.pending} en attente d'approbation</span>
                    </div>
                    <span className="text-xs text-gray-500">En cours</span>
                </div>
            </div>
        </Card>
    );
};

export default RecentActivity;
