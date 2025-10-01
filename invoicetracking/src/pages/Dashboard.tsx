import React, { useEffect, useState } from 'react';
import { useI18n } from '../i18n/';
import { FileText, RefreshCw, Clock, CheckCircle, AlertTriangle } from 'lucide-react';
import { fetchInvoices } from '../controllers/invoices';
import { fetchNotifications } from '../controllers/notifications';
import { RealtimeSocket } from '../controllers/socket';
import { usePermissions } from '../hooks/usePermissions';
import { Invoice, InvoiceStats } from '../types/invoice';
import { StatCard } from '../components/StatCard';
import { FinancialSummary } from '../components/FinancialSummary';
import { StatusDistribution } from '../components/StatusDistribution';
import { AttentionRequired } from '../components/AttentionRequired';
import { RecentActivity } from '../components/RecentActivity';
import { useInvoices } from "../hooks/useInvoices" 
interface DashboardProps {
    user: { 
        id: string;
        name: string;
        email: string;
        role: string;
        service: string;
        avatar: string;
        permissions: string[];
        last_login?: string;
    };
}

export const Dashboard: React.FC<DashboardProps> = ({ user }) => {
    const { t } = useI18n();
    const { 
        hasPermission, 
        refreshPermissions, 
        isRefreshing, 
        arePermissionsStale,
        permissionSource 
    } = usePermissions();
    
    //const [invoices, setInvoices] = useState<Invoice[]>([]);
    const { invoices, loading, error } = useInvoices();
    const [counts, setCounts] = useState<{ invoices: number; notifications: number }>({ invoices: 0, notifications: 0 });

    // Filter invoices based on user permissions
    const visibleInvoices = hasPermission('view_invoice') 
        ? invoices 
        : invoices.filter(inv => inv.current_service === user.service);
    const totalAmount = visibleInvoices.reduce((sum, inv) => {
        const amount = typeof inv.total_amount === "number"
            ? inv.total_amount
            : parseFloat(inv.total_amount); // convert string to number
        return sum + (isNaN(amount) ? 0 : amount); // fallback to 0 if invalid
    }, 0);
    visibleInvoices.forEach(inv => {
        console.log(`Invoice ${inv.id}:`, typeof inv.total_amount, inv.total_amount);
    });

    const paidAmount = visibleInvoices
        .filter(inv => inv.status === "paid")
        .reduce((sum, inv) => sum + inv.total_amount, 0);

    const pendingAmount = totalAmount - paidAmount;
    const stats: InvoiceStats = {
        total: visibleInvoices.length,
        pending: visibleInvoices.filter(inv => inv.status === "pending_approval").length,
        approved: visibleInvoices.filter(inv => inv.status === "approved").length,
        paid: visibleInvoices.filter(inv => inv.status === "paid").length,
        overdue: visibleInvoices.filter(inv =>
            new Date(inv.due_date) < new Date() && inv.status !== "paid"
        ).length,
        totalAmount,       // sum of all invoice amounts
        paidAmount,        // sum of paid invoice amounts
        pendingAmount, 
    };
    const statCards = [
        {
            title: t('dashboard.stats.total_invoices'),
            value: stats.total,
            icon: FileText,
            color: 'blue',
            bgColor: 'bg-blue-50',
            iconColor: 'text-blue-600'
        },
        {
            title: t('dashboard.stats.pending_approval'),
            value: stats.pending,
            icon: Clock,
            color: 'yellow',
            bgColor: 'bg-yellow-50',
            iconColor: 'text-yellow-600'
        },
        {
            title: t('dashboard.stats.approved_invoices') ,
            value: stats.approved,
            icon: CheckCircle,
            color: 'green',
            bgColor: 'bg-green-50',
            iconColor: 'text-green-600'
        },
        {
            title: t('dashboard.stats.overdue_invoices'),
            value: stats.overdue,
            icon: AlertTriangle,
            color: 'red',
            bgColor: 'bg-red-50',
            iconColor: 'text-red-600'
        }
    ];


    useEffect(() => {
        const load = async () => {
            try {
                const [invoicesData, notifs] = await Promise.all([
                    fetchInvoices({ page: 1, pageSize: 100 }), // Get more invoices for statistics
                    fetchNotifications()
                ]);
                
                // Set invoices for statistics calculation
               /*if (invoicesData?.results) {
                    setInvoices(invoicesData.results);
                }*/
                
               /* setCounts({ 
                    invoices: invoicesData?.count ?? (invoicesData?.results?.length || 0), 
                    notifications: notifs?.count ?? notifs?.length ?? 0 
                });*/

            } catch (error) {
                console.error('Failed to load dashboard data:', error);
            }
        };
        load();

        // Initialize WebSocket connection for real-time updates
        const wsUrl = (import.meta as any).env?.VITE_WS_BASE_URL || 'ws://localhost:9999/ws/invoices/';
        const socket = new RealtimeSocket(wsUrl, () => localStorage.getItem('authToken'));
        
        socket.start();
        const off = socket.on((ev) => {
            console.log('WebSocket event received:', ev);
            
            // Handle different event types for real-time updates
            if (ev?.type?.startsWith('invoice.')) {
                load(); // Reload data when invoice events occur
            }
            if (ev?.type?.startsWith('notification.')) {
                setCounts((c) => ({ ...c, notifications: c.notifications + 1 }));
            }
            if (ev?.type === 'user.login') {
                load();
            }
            if (ev?.type === 'dashboard.refresh') {
                load();
            }
        });
        
        return () => {
            off();
            socket.stop();
        };
    }, [user.id]);

    return (
        <div className="space-y-6">
            {/* User Welcome Header */}
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg p-6 text-white">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold">{t('dashboard.hello')}, {user.name.split(' ')[0]} 👋</h1>
                        <p className="text-blue-100 mt-1">
                            {t('dashboard.overview')} {hasPermission('Can view invoices') ? 'globales' : `${user.service}`}
                        </p>
                    </div>
                    <div className="text-right">
                        <p className="text-sm text-blue-100">{t('auth.service.name')}</p>
                        <p className="font-semibold capitalize">{user.service}</p>
                        
                        {/* Permission Status Indicator */}
                        <div className="mt-2 flex items-center gap-2">
                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                arePermissionsStale 
                                    ? 'bg-yellow-100 text-yellow-800'
                                    : 'bg-green-100 text-green-800'
                            }`}>
                                {arePermissionsStale ? 'Permissions Stale' : 'Fresh'}
                            </span>
                            
                            <button
                                onClick={refreshPermissions}
                                disabled={isRefreshing}
                                className="inline-flex items-center px-2 py-1 text-xs bg-white/20 hover:bg-white/30 disabled:bg-white/10 text-white rounded transition-colors"
                            >
                                <RefreshCw className={`w-3 h-3 mr-1 ${isRefreshing ? 'animate-spin' : ''}`} />
                                {isRefreshing ? 'Refresh...' : 'Refresh'}
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Statistics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {statCards.map((stat, index) => (
                    <StatCard
                        key={index}
                        title={stat.title}
                        value={stat.value}
                        icon={stat.icon}
                        bgColor={stat.bgColor}
                        iconColor={stat.iconColor}
                    />
                ))}
            </div>

            {/* Financial Summary and Status Distribution */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FinancialSummary stats={stats} />
                <StatusDistribution invoices={visibleInvoices} />
            </div>

            {/* Attention Required Section */}
            <AttentionRequired 
                stats={stats} 
                userService={user.service} 
                hasViewAllPermission={hasPermission('Can view inovices')} 
            />

            {/* Recent Activity - for managers and admins */}
            {(user.role === 'admin' || user.role === 'manager') && (
                <RecentActivity stats={stats} />
            )}
        </div>
    );
};


