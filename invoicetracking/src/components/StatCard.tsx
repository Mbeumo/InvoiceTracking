import React from 'react';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
    title: string;
    value: number;
    icon: LucideIcon;
    bgColor: string;
    iconColor: string;
}

export const StatCard: React.FC<StatCardProps> = ({ 
    title, 
    value, 
    icon: Icon, 
    bgColor, 
    iconColor 
}) => {
    return (
        <div className={`${bgColor} rounded-lg p-6`}>
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-sm font-medium text-gray-600">{title}</p>
                    <p className="text-3xl font-bold text-gray-900 mt-2">{value}</p>
                </div>
                <div className={`${bgColor} p-3 rounded-lg`}>
                    <Icon className={`h-8 w-8 ${iconColor}`} />
                </div>
            </div>
        </div>
    );
};

export default StatCard;
