import React from 'react';

interface ToolbarProps {
    left?: React.ReactNode;
    right?: React.ReactNode;
    className?: string;
}

export const Toolbar: React.FC<ToolbarProps> = ({ left, right, className }) => (
    <div className={`flex items-center justify-between gap-2 ${className || ''}`}>
        <div className="flex items-center gap-2">{left}</div>
        <div className="flex items-center gap-2">{right}</div>
    </div>
);


