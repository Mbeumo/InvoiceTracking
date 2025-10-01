import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';

type ToastType = 'success' | 'error' | 'info' | 'warning';
type Toast = { id: string; type: ToastType; title?: string; message: string; timeoutMs?: number };

const ToastContext = createContext<{ notify: (t: Omit<Toast, 'id'>) => void } | null>(null);

export const useToast = () => {
    const ctx = useContext(ToastContext);
    if (!ctx) throw new Error('useToast must be used within ToastProvider');
    return ctx;
};

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [toasts, setToasts] = useState<Toast[]>([]);

    const notify = useCallback((t: Omit<Toast, 'id'>) => {
        const id = Math.random().toString(36).slice(2);
        const toast: Toast = { id, timeoutMs: 4000, ...t };
        setToasts(prev => [...prev, toast]);
        window.setTimeout(() => {
            setToasts(prev => prev.filter(x => x.id !== id));
        }, toast.timeoutMs);
    }, []);

    const value = useMemo(() => ({ notify }), [notify]);

    return (
        <ToastContext.Provider value={value}>
            {children}
            <div className="fixed top-4 right-4 z-50 space-y-2 w-80">
                {toasts.map(t => (
                    <div key={t.id} className={`rounded-lg shadow-lg p-3 text-sm border ${
                        t.type === 'success' ? 'bg-green-50 border-green-200 text-green-800' :
                        t.type === 'error' ? 'bg-red-50 border-red-200 text-red-800' :
                        t.type === 'warning' ? 'bg-yellow-50 border-yellow-200 text-yellow-800' :
                        'bg-blue-50 border-blue-200 text-blue-800'
                    }`}>
                        {t.title && <div className="font-semibold mb-0.5">{t.title}</div>}
                        <div>{t.message}</div>
                    </div>
                ))}
            </div>
        </ToastContext.Provider>
    );
};


