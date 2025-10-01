import { useEffect, useState } from 'react';
import { useAuth } from './useAuth';
import { Permissions } from '../types/auth';

/**
 * Hook for managing user permissions with real-time updates
 * Automatically refreshes permissions from Django backend
 */
export const usePermissions = () => {
    const { user, hasPermission, refreshPermissions } = useAuth();
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [lastRefresh, setLastRefresh] = useState<Date | null>(null);

    // Auto-refresh permissions every 10 minutes
    useEffect(() => {
        const interval = setInterval(async () => {
            if (user?.id) {
                setIsRefreshing(true);
                const success = await refreshPermissions();
                if (success) {
                    setLastRefresh(new Date());
                }
                setIsRefreshing(false);
            }
        }, 10 * 60 * 1000); // 10 minutes

        return () => clearInterval(interval);
    }, [user?.id, refreshPermissions]);

    // Manual refresh function
    const manualRefresh = async () => {
        if (!user?.id) return false;
        
        setIsRefreshing(true);
        const success = await refreshPermissions();
        if (success) {
            setLastRefresh(new Date());
        }
        setIsRefreshing(false);
        return success;
    };

    // Check if permissions are stale (older than 5 minutes)
    const arePermissionsStale = () => {
        if (!user?.permission_last_updated) return true;
        const lastUpdate = new Date(user.permission_last_updated);
        const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
        return lastUpdate < fiveMinutesAgo;
    };

    // Enhanced permission checker with automatic refresh for stale permissions
    const checkPermission = async (permission: string): Promise<boolean> => {
        // If permissions are stale, refresh them first
        if (arePermissionsStale()) {
            await manualRefresh();
        }
        
        return hasPermission(permission);
    };

    // Check multiple permissions at once
    const checkPermissions = async (permission: string[]): Promise<Record<string, boolean>> => {
        if (arePermissionsStale()) {
            await manualRefresh();
        }
        
        const result: Record<string, boolean> = {};
        permission.forEach(codename => {
            result[codename] = hasPermission(codename);
        });
        
        return result //as Record<Permission, boolean>;
    };


    return {
        permissions: user?.permissions || [],
        hasPermission,
        checkPermission,
        checkPermissions,
        refreshPermissions: manualRefresh,
        isRefreshing,
        lastRefresh,
        arePermissionsStale: arePermissionsStale(),
        permissionSource: user?.permission_source || 'cache'
    };

};
