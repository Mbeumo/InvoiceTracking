import React, { Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { RouteConfig } from './types';
import { ProtectedRoute } from './ProtectedRoute';
import LoadingSpinner from '../components/LoadingSpinner';

// Lazy-loaded components
const componentMap = {
    LoginForm: React.lazy(() => import('../pages/LoginForm').then(m => ({ default: m.LoginForm }))),
    Dashboard: React.lazy(() => import('../pages/Dashboard').then(m => ({ default: m.Dashboard }))),
    InvoiceList: React.lazy(() => import('../pages/InvoiceList').then(m => ({ default: m.InvoiceList }))),
    InvoiceCard: React.lazy(() => import('../pages/InvoiceCard').then(m => ({ default: m.InvoiceCard }))),
    InvoiceCardDetail: React.lazy(() => import('../pages/InvoiceCardDetail').then(m => ({ default: m.InvoiceDetails }))),
    User: React.lazy(() => import('../pages/User').then(m => ({ default: m.UserManagement }))),
    Analytics: React.lazy(() => import('../pages/Analytics').then(m => ({ default: m.Analytics }))),
    Notifications: React.lazy(() => import('../pages/Notifications').then(m => ({ default: m.Notifications }))),
    Reports: React.lazy(() => import('../pages/Reports').then(m => ({ default: m.Reports }))),
    Settings: React.lazy(() => import('../pages/Settings').then(m => ({ default: m.Settings }))),
    NotFound: React.lazy(() => import('../pages/NotFound').then(m => ({ default: m.NotFound }))),
};

const routeConfigs: RouteConfig[] = [
    { path: '/', element: 'redirect', public: false, redirectTo: '/dashboard' },
    { path: '/login', element: 'LoginForm', public: true, title: 'Login' },
    { path: '/dashboard', element: 'Dashboard', public: false, title: 'Dashboard' },
    { path: '/invoices', element: 'InvoiceList', public: false, title: 'Invoices', permissions: ['view_invoice'] },
    { path: '/invoices/create', element: 'InvoiceCard', public: false, title: 'Create Invoice', permissions: ['view_invoice'] },
    { path: '/invoices/:id', element: 'InvoiceCardDetail', public: false, title: 'Invoice Details' },
    { path: '/users', element: 'User', public: false, title: 'User Management', },
    { path: '/analytics', element: 'Analytics', public: false, title: 'Analytics', permissions: ['view_reports'] },
    { path: '/notifications', element: 'Notifications', public: false, title: 'Notifications' },
    { path: '/reports', element: 'Reports', public: false, title: 'Reports', permissions: ['view_reports'] },
    { path: '/settings', element: 'Settings', public: false, title: 'Settings' },
];

interface AppRoutesProps {
    isAuthenticated: boolean;
    user: any;
    login: (credentials: any) => Promise<boolean>;
    isLoading: boolean;
    setShowRegister: (show: boolean) => void;
}

const AppRoutes: React.FC<AppRoutesProps> = ({ isAuthenticated, user, login, isLoading, setShowRegister }) => {
    const renderRoute = (config: RouteConfig) => {
        const { path, element, public: isPublic, redirectTo, permissions = [] } = config;

        if (element === 'redirect') {
            return (
                <Route
                    key={path}
                    path={path}
                    element={
                        isAuthenticated && user
                            ? <Navigate to={redirectTo!} replace />
                            : <Navigate to="/login" replace />
                    }
                />
            );
        }

        if (element === 'LoginForm') {
            return (
                <Route
                    key={path}
                    path={path}
                    element={
                        isAuthenticated && user
                            ? <Navigate to="/dashboard" replace />
                            : (
                                <Suspense fallback={<LoadingSpinner />}>
                                    <componentMap.LoginForm
                                        onLogin={login}
                                        onSwitchToRegister={() => setShowRegister(true)}
                                        isLoading={isLoading}
                                    />
                                </Suspense>
                            )
                    }
                />
            );
        }

        const Component = componentMap[element as keyof typeof componentMap];
        if (!Component) return null;

        return (
            <Route
                key={path}
                path={path}
                element={
                    <ProtectedRoute
                        isAuthenticated={isAuthenticated}
                        user={user}
                        requiredPermissions={permissions}
                        isPublic={isPublic}
                    >
                        <Suspense fallback={<LoadingSpinner />}>
                            <Component user={user} />
                        </Suspense>
                    </ProtectedRoute>
                }
            />
        );
    };

    return (
        <Routes>
            {routeConfigs.map(renderRoute)}
            <Route
                path="*"
                element={
                    <Suspense fallback={<LoadingSpinner />}>
                        <componentMap.NotFound isAuthenticated={isAuthenticated} user={user} />
                    </Suspense>
                }
            />
        </Routes>
    );
};

export default AppRoutes;