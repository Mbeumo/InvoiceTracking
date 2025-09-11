import React, { useEffect, useState } from 'react';
import { fetchAnalyticsSummary, SummaryResponse } from '../controllers/analytics';

export const AnalyticsSummary: React.FC = () => {
    const [data, setData] = useState<SummaryResponse | null>(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const load = async () => {
            setLoading(true);
            try {
                const res = await fetchAnalyticsSummary({ range: '30d' });
                setData(res);
            } finally { setLoading(false); }
        };
        load();
    }, []);

    return (
        <div className="bg-white dark:bg-gray-900 dark:text-gray-100 rounded-lg border border-gray-200 dark:border-gray-800 p-4">
            <h4 className="font-semibold mb-2">Analytics</h4>
            {loading && <div className="text-sm">Loading...</div>}
            {!loading && (
                <div className="text-sm space-y-2">
                    <div>Total invoices: {data?.totals?.count ?? '—'}</div>
                    <div>Total amount: {data?.totals?.amount ?? '—'}</div>
                    <div className="text-xs text-gray-500">Period: {data?.period ?? '—'}</div>
                </div>
            )}
        </div>
    );
};


