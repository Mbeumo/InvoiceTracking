import api from './api';

export const exportInvoicePdf = async (id: string): Promise<Blob> => {
    const res = await api.get(`/invoices/${id}/export/pdf`, { responseType: 'blob' });
    return res.data as Blob;
};

export const exportInvoiceXlsx = async (id: string): Promise<Blob> => {
    const res = await api.get(`/invoices/${id}/export/xlsx`, { responseType: 'blob' });
    return res.data as Blob;
};

export const downloadBlob = (blob: Blob, filename: string) => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
};


