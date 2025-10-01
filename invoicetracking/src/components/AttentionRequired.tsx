import React from 'react';
import { AlertTriangle, Clock, CheckCircle } from 'lucide-react';
import { Card } from './Card';
import { InvoiceStats } from '../types/invoice';
import { useI18n } from '../i18n';

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
    const { t } = useI18n();
    const title = t('dashboard.attention_required') + `${
        !hasViewAllPermission ? ` (Service: ${userService})` : ''
    }`;
    
    return (
        <Card title={title}>
            <div className="space-y-3">
                {stats.overdue > 0 && (
                    <div className="flex items-center justify-between p-4 bg-red-50 rounded-lg border border-red-200">
                        <div className="flex items-center">
                            <AlertTriangle className="h-5 w-5 text-red-600 mr-3" />
                            <span className="text-red-800 font-medium">{stats.overdue} { t('invoice.status.overdue')}</span>
                        </div>
                        <span className="text-sm text-red-600">{t('dashboard.attention_required')}</span>
                    </div>
                )}
                {stats.pending > 0 && (
                    <div className="flex items-center justify-between p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                        <div className="flex items-center">
                            <Clock className="h-5 w-5 text-yellow-600 mr-3" />
                            <span className="text-yellow-800 font-medium">{stats.pending} { t('invoice.status.appproved') }</span>
                        </div>
                        <span className="text-sm text-yellow-600">{t('dashboard.required_revision')}</span>
                    </div>
                )}
                {stats.overdue === 0 && stats.pending === 0 && (
                    <div className="flex items-center justify-center p-8 text-gray-500">
                        <CheckCircle className="h-8 w-8 mr-3" />
                        <span>{t('dashboard.no_attention_needed')}</span>
                    </div>
                )}
            </div>
        </Card>
    );
};

export default AttentionRequired;
