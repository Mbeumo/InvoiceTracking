import React from 'react';

interface StatProps {
    label: string;
    value: string | number;
    subtitle?: string;
}

export const Stat: React.FC<StatProps> = ({ label, value, subtitle }) => {
    return (
        <div className="rounded-md bg-gray-50 dark:bg-gray-800 p-3">
            <div className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">{label}</div>
            <div className="text-xl font-semibold text-gray-900 dark:text-gray-100">{value}</div>
            {subtitle && <div className="text-xs text-gray-500 dark:text-gray-400">{subtitle}</div>}
        </div>
    );
};


