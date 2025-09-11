import React from 'react';

export const Section: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className }) => (
    <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 ${className || ''}`}>
        {children}
    </div>
);


