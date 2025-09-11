import React from 'react';

interface FiltersProps {
    search?: string;
    onSearch?: (v: string) => void;
    status?: string;
    onStatus?: (v: string) => void;
    service?: string;
    onService?: (v: string) => void;
}

export const Filters: React.FC<FiltersProps> = ({ search, onSearch, status, onStatus, service, onService }) => {
    return (
        <div className="flex flex-col md:flex-row gap-2">
            <input value={search || ''} onChange={(e) => onSearch?.(e.target.value)} placeholder="Search..." className="px-2 py-1 border rounded-md text-sm" />
            <select value={status || 'all'} onChange={(e) => onStatus?.(e.target.value)} className="px-2 py-1 border rounded-md text-sm">
                <option value="all">All Status</option>
                <option value="draft">Draft</option>
                <option value="pending_approval">Pending</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
                <option value="in_payment">In payment</option>
                <option value="paid">Paid</option>
            </select>
            <select value={service || 'all'} onChange={(e) => onService?.(e.target.value)} className="px-2 py-1 border rounded-md text-sm">
                <option value="all">All Services</option>
                <option value="accounting">Accounting</option>
                <option value="purchasing">Purchasing</option>
                <option value="finance">Finance</option>
                <option value="management">Management</option>
                <option value="hr">HR</option>
            </select>
        </div>
    );
};


