import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Permissions } from '../types/auth';
import {
    LayoutDashboard,
    FileText,
    Users,
    BarChart3,
    Settings,
    Bell,
    Upload,
    Download,
    Menu,
    X
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

interface NavigationProps {
    user: any;
    className?: string;
}

const Navigation: React.FC<NavigationProps> = ({ user, className = '' }) => {
    const location = useLocation();
    const { isSuperuser, isAuthenticated } = useAuth();
    const [mobileOpen, setMobileOpen] = useState(false);

    const navigationItems = [
        { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard, permission: null, isSuperuser: false },
        { name: 'Invoices', href: '/invoices', icon: FileText, permission: 'view_invoice', isSuperuser: true },
        { name: 'Create Invoice', href: '/invoices/create', icon: Upload, permission: 'create_invoice', isSuperuser: true },
        { name: 'Analytics', href: '/analytics', icon: BarChart3, permission: 'view_reports', isSuperuser: true },
        { name: 'Users', href: '/users', icon: Users, permission: 'manage_users', isSuperuser: true },
        { name: 'Notifications', href: '/notifications', icon: Bell, permission: null, isSuperuser: false },
        { name: 'Reports', href: '/reports', icon: Download, permission: 'view_reports', isSuperuser: true },
        { name: 'Settings', href: '/settings', icon: Settings, permission: null, isSuperuser: false }
    ];

    const hasPermission = (permission: string | null) => {
        if (!permission) return true;
        return user?.permissions?.some((p: Permissions) => p.codename === permission) || false;
    };

    const isActive = (href: string) => {
        if (href === '/dashboard') {
            return location.pathname === '/' || location.pathname === '/dashboard';
        }
        return location.pathname.startsWith(href);
    };

    const renderLinks = (extraClasses = '') => (
        <>
            {navigationItems
                .filter(item => hasPermission(item.permission) || (item.isSuperuser && isSuperuser()))
                .map((item) => {
                    const Icon = item.icon;
                    const active = isActive(item.href);

                    return (
                        <Link
                            key={item.name}
                            to={item.href}
                            className={`flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors ${extraClasses} ${active
                                    ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/40 dark:text-blue-400'
                                    : 'text-gray-600 hover:bg-blue-50 hover:text-blue-600 dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-blue-400'
                                }`}
                            onClick={() => setMobileOpen(false)}
                        >
                            <Icon className="w-4 h-4 mr-2" />
                            {item.name}
                        </Link>
                    );
                })}
        </>
    );

    return (
        <nav className={`bg-white dark:bg-gray-900 shadow-md ${className}`}>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                    {/* Logo / App Name */}

                    {/* Desktop Menu */}
                    <div className="hidden md:flex space-x-6">
                        {renderLinks()}
                    </div>

                    {/* Mobile Menu Button */}
                    <div className="md:hidden">
                        <button
                            onClick={() => setMobileOpen(!mobileOpen)}
                            className="text-gray-600 dark:text-gray-300 hover:text-blue-600 focus:outline-none"
                        >
                            {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Dropdown */}
            {mobileOpen && (
                <div className="md:hidden bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 px-4 py-3 space-y-2">
                    {renderLinks('w-full')}
                </div>
            )}
        </nav>
    );
};

export default Navigation;
