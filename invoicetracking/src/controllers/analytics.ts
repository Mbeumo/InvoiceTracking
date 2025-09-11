import api from './api';

export interface SummaryResponse {
    totals?: { count?: number; amount?: number };
    byStatus?: Record<string, number>;
    period?: string;
}

export const fetchAnalyticsSummary = async (params: { range?: string } = {}) => {
    const { data } = await api.get('/analytics/summary', { params });
    return data as SummaryResponse;
};


