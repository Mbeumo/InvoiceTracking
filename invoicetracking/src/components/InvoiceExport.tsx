import React, { useState } from 'react';
import { exportInvoicePdf, exportInvoiceXlsx, downloadBlob } from '../controllers/exports';

export const InvoiceExport: React.FC = () => {
    const [invoiceId, setInvoiceId] = useState('');
    const [loading, setLoading] = useState(false);

    const run = async (fmt: 'pdf' | 'xlsx') => {
        if (!invoiceId) return;
        setLoading(true);
        try {
            const blob = fmt === 'pdf' ? await exportInvoicePdf(invoiceId) : await exportInvoiceXlsx(invoiceId);
            downloadBlob(blob, `invoice_${invoiceId}.${fmt}`);
        } finally { setLoading(false); }
    };

    return (
        <div className="flex items-center gap-2">
            <input value={invoiceId} onChange={(e) => setInvoiceId(e.target.value)} placeholder="Invoice ID" className="px-2 py-1 border rounded-md text-sm" />
            <button onClick={() => run('pdf')} disabled={!invoiceId || loading} className="px-2 py-1 text-sm border rounded-md">PDF</button>
            <button onClick={() => run('xlsx')} disabled={!invoiceId || loading} className="px-2 py-1 text-sm border rounded-md">XLSX</button>
        </div>
    );
};


