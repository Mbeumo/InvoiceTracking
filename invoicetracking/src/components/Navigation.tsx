import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import {Permissions} from '../types/auth';
import { 
  LayoutDashboard, 
  FileText, 
  Users, 
  BarChart3, 
  Settings, 
  Bell,
  Upload,
  Download
} from 'lucide-react';
import { useAuth } from '../controllers/useAuth'
interface NavigationProps {
  user: any;
  className?: string;
}

const Navigation: React.FC<NavigationProps> = ({ user, className = '' }) => {
  const location = useLocation();

  const navigationItems = [
    {
      name: 'Dashboard',
      href: '/dashboard',
      icon: LayoutDashboard,
          permission: null,
          isSuperuser: false,

    },
    {
      name: 'Invoices',
      href: '/invoices',
      icon: FileText,
        permission: 'view_invoice',
            isSuperuser: true,

    },
    {
      name: 'Create Invoice',
      href: '/invoices/create',
      icon: Upload,
      permission: 'create_invoice',
      isSuperuser: true,

    },
    {
      name: 'Analytics',
      href: '/analytics',
      icon: BarChart3,
      permission: 'view_reports',
        isSuperuser: true,

    },
    {
      name: 'Users',
      href: '/users',
      icon: Users,
      permission: 'manage_users',
      isSuperuser:true,
    },
    {
      name: 'Notifications',
      href: '/notifications',
      icon: Bell,
      permission: null ,
      isSuperuser: false,
    },
    {
      name: 'Reports',
      href: '/reports',
      icon: Download,
      permission: 'view_reports',
      isSuperuser: true,
    },
    {
      name: 'Settings',
      href: '/settings',
      icon: Settings,
      permission: null,
      isSuperuser: false,

    }
  ];

  const hasPermission = (permission: string | null) => {
    if (!permission) return true;
      return user?.permissions?.some((p: Permissions) => p.codename === permission) || false;
  };
    const { isSuperuser } = useAuth()

  const isActive = (href: string) => {
    if (href === '/dashboard') {
      return location.pathname === '/' || location.pathname === '/dashboard';
    }
    return location.pathname.startsWith(href);
  };

  return (
    <nav className={`bg-white dark:bg-gray-800 shadow-sm ${className}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex space-x-8">
            {navigationItems
              .filter(item => hasPermission(item.permission) || item.isSuperuser && isSuperuser())
              .map((item) => {
                const Icon = item.icon;
                const active = isActive(item.href);
                
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-colors ${
                      active
                        ? 'border-blue-500 text-gray-900 dark:text-gray-100'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                    }`}
                  >
                    <Icon className="w-4 h-4 mr-2" />
                    {item.name}
                  </Link>
                );
              })}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
