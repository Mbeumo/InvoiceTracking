import React from 'react';

interface CardProps {
    title?: string;
    headerRight?: React.ReactNode;
    children?: React.ReactNode;
    className?: string;
}

export const Card: React.FC<CardProps> = ({ title, headerRight, children, className }) => {
    return (
        <div className={`bg-white dark:bg-gray-900 dark:text-gray-100 rounded-lg shadow p-5 border border-gray-200 dark:border-gray-800 ${className || ''}`}>
            {(title || headerRight) && (
                <div className="flex items-center justify-between mb-2">
                    {title && <h4 className="font-semibold">{title}</h4>}
                    {headerRight}
                </div>
            )}
            {children}
        </div>
    );
};

export default Card;


