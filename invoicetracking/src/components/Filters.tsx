import React, { useState } from "react";

interface FiltersProps {
    onChange: (filters: { search?: string; status?: string; service?: string }) => void;
}

export const Filters: React.FC<FiltersProps> = ({ onChange }) => {
    const [search, setSearch] = useState("");
    const [status, setStatus] = useState("");
    const [service, setService] = useState("");

    const applyFilters = (updates: Partial<{ search: string; status: string; service: string }>) => {
        const newFilters = { search, status, service, ...updates };
        setSearch(newFilters.search || "");
        setStatus(newFilters.status || "");
        setService(newFilters.service || "");
        onChange(newFilters);
    };

    return (
        <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <input
                type="text"
                placeholder="Search invoices..."
                value={search}
                onChange={(e) => applyFilters({ search: e.target.value })}
                className="flex-1 border rounded-lg px-3 py-2 shadow-sm focus:ring focus:ring-blue-200"
            />

            {/* Status Dropdown */}
            <select
                value={status}
                onChange={(e) => applyFilters({ status: e.target.value })}
                className="border rounded-lg px-3 py-2 shadow-sm"
            >
                <option value="">All Statuses</option>
                <option value="pending_approval">Pending</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
                <option value="paid">Paid</option>
            </select>

            {/* Service Dropdown */}
            <select
                value={service}
                onChange={(e) => applyFilters({ service: e.target.value })}
                className="border rounded-lg px-3 py-2 shadow-sm"
            >
                <option value="">All Services</option>
                <option value="finance">Finance</option>
                <option value="hr">HR</option>
                <option value="it">IT</option>
                <option value="operations">Operations</option>
            </select>
        </div>
    );
};
