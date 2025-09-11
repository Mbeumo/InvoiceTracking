import api from './api';

export const uploadDocument = async (file: File) => {
    const form = new FormData();
    form.append('file', file);
    const { data } = await api.post('/ingest/upload/', form, {
        headers: { 'Content-Type': 'multipart/form-data' }
    });
    return data; // { jobId, invoiceId? }
};

export const getIngestStatus = async (jobId: string) => {
    const { data } = await api.get(`/ingest/${jobId}/`);
    return data; // { status, result }
};


