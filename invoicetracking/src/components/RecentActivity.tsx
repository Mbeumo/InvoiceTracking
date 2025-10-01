import React from 'react';
import { Card } from './Card';
import { InvoiceStats } from '../types/invoice';
import { useI18n } from '../i18n'; 

interface RecentActivityProps {
    stats: InvoiceStats;
}

export const RecentActivity: React.FC<RecentActivityProps> = ({ stats }) => {
    const { t } = useI18n();
    return (
        <Card title={t('dashboard.recent_activities')}>
            <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                        <div className="h-2 w-2 bg-blue-500 rounded-full"></div>
                        <span className="text-sm text-gray-700">{stats.total} { t('dashboard.stats.total_invoices') }</span>
                    </div>
                    <span className="text-xs text-gray-500">{ t('dashboard.now')}</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                        <div className="h-2 w-2 bg-green-500 rounded-full"></div>
                        <span className="text-sm text-gray-700">{stats.approved} { t('dashboard.stats.approved_invoices')}</span>
                    </div>
                    <span className="text-xs text-gray-500">{ t('dashboard.recent')}</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                        <div className="h-2 w-2 bg-yellow-500 rounded-full"></div>
                        <span className="text-sm text-gray-700">{stats.pending} {t('dashboard.stats.pending_approval') } </span>
                    </div>
                    <span className="text-xs text-gray-500">{ t('dashboard.ongoing') }</span>
                </div>
            </div>
        </Card>
    );
};

export default RecentActivity;
