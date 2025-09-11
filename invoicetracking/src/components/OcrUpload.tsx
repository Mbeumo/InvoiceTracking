import React, { useState } from 'react';
import { uploadDocument, getIngestStatus } from '../controllers/ingest';

export const OcrUpload: React.FC = () => {
    const [file, setFile] = useState<File | null>(null);
    const [jobId, setJobId] = useState<string | null>(null);
    const [status, setStatus] = useState<string>('');
    const [loading, setLoading] = useState(false);

    const onSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!file) return;
        setLoading(true);
        setStatus('');
        try {
            const res = await uploadDocument(file);
            setJobId(res.jobId || null);
            setStatus('uploaded');
        } finally {
            setLoading(false);
        }
    };

    const checkStatus = async () => {
        if (!jobId) return;
        setLoading(true);
        try {
            const res = await getIngestStatus(jobId);
            setStatus(res.status || JSON.stringify(res));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-white dark:bg-gray-900 dark:text-gray-100 rounded-lg border border-gray-200 dark:border-gray-800 p-4">
            <h4 className="font-semibold mb-3">OCR Upload</h4>
            <form onSubmit={onSubmit} className="flex items-center gap-2">
                <input type="file" accept=".pdf,.png,.jpg,.jpeg" onChange={(e) => setFile(e.target.files?.[0] || null)} className="text-sm" />
                <button disabled={loading || !file} className="px-3 py-2 rounded-md bg-blue-600 text-white text-sm disabled:opacity-50">Upload</button>
            </form>
            <div className="mt-3 flex items-center gap-2">
                <button onClick={checkStatus} disabled={!jobId || loading} className="px-3 py-2 rounded-md border text-sm">Check status</button>
                {status && <span className="text-xs text-gray-600 dark:text-gray-300">{status}</span>}
            </div>
        </div>
    );
};


