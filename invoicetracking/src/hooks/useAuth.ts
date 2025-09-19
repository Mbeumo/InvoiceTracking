import { useState, useEffect } from 'react'
import { AuthState, LoginCredentials, User, RegisterData, Permissions } from '../types/auth'
import { AuthService } from '../services/apiService'

/**
 * Authentication Controller Hook
 * 
 * CURRENT IMPLEMENTATION: Mock authentication with localStorage
 * FUTURE ENHANCEMENT: Replace with real API calls to Python backend
 * 
 * BACKEND INTEGRATION PLAN:
 * 1. Replace mockUsers with API calls to MySQL database
 * 2. Implement JWT token authentication
 * 3. Add refresh token mechanism
 * 4. Implement proper password hashing (bcrypt)
 * 5. Add rate limiting for login attempts
 * 6. Implement session management
 * 7. Add audit logging for authentication events
 */
export const useAuth = () => {
    const [authState, setAuthState] = useState<AuthState>({
        user: null,
        isAuthenticated: false,
        isLoading: true
    });

    useEffect(() => {
        const init = async () => {
            try {
                const token = localStorage.getItem('authToken');
                if (!token) {
                    setAuthState(prev => ({ ...prev, isLoading: false }));
                    return;
                }
                
                // Check if we need to refresh permissions (every 5 minutes)
                const cachedUser = localStorage.getItem('currentUser');
                let shouldRefreshPermissions = true;
                
                if (cachedUser) {
                    const userData = JSON.parse(cachedUser);
                    const lastUpdate = userData.permission_last_updated;
                    if (lastUpdate) {
                        const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
                        shouldRefreshPermissions = new Date(lastUpdate) < fiveMinutesAgo;
                    }
                }
                
                const data = shouldRefreshPermissions 
                    ? await AuthService.getCurrentUser()
                    : JSON.parse(cachedUser || '{}');
                    
                localStorage.setItem('currentUser', JSON.stringify(data));
                setAuthState({ user: data, isAuthenticated: true, isLoading: false });
            } catch (_) {
                localStorage.removeItem('authToken');
                localStorage.removeItem('refreshToken');
                localStorage.removeItem('currentUser');
                setAuthState({ user: null, isAuthenticated: false, isLoading: false });
            }
        };
        init();
    }, []);

    const login = async (credentials: LoginCredentials): Promise<boolean> => {
        setAuthState(prev => ({ ...prev, isLoading: true }));
        try {
            const data = await AuthService.login(credentials.email, credentials.password);
            const access = data.access || data.token;
            const refresh = data.refresh || data.refresh_token;
            if (access) localStorage.setItem('authToken', access);
            if (refresh) localStorage.setItem('refreshToken', refresh);

            const me = await AuthService.getCurrentUser();
            localStorage.setItem('currentUser', JSON.stringify(me));
            setAuthState({ user: me, isAuthenticated: true, isLoading: false });
            
            //Trigger WebSocket event for dashboard refresh
            if (window.dispatchEvent) {
               window.dispatchEvent(new CustomEvent('user-login', { detail: me }));
            }
            
            return true;
        } catch (error) {
            console.error('Login error:', error);
            setAuthState(prev => ({ ...prev, isLoading: false }));
            return false;
        }
    };
    const isSuperuser = (): boolean => {
        return authState.user?.is_superuser === true;
    };


    const register = async (userData: RegisterData): Promise<boolean> => {
        setAuthState(prev => ({ ...prev, isLoading: true }));
        try {
            await AuthService.register(userData);
            // After successful registration, auto-login
            const loginOk = await login({ email: userData.email, password: userData.password });
            if (!loginOk) {
                setAuthState(prev => ({ ...prev, isLoading: false }));
                return false;
            }
            return true;
        } catch (error) {
            console.error('Registration error:', error);
            setAuthState(prev => ({ ...prev, isLoading: false }));
            return false;
        }
    };

    const logout = async () => {
        try {
            await AuthService.logout();
        } catch (_) {
            // ignore
        }
        localStorage.removeItem('currentUser');
        localStorage.removeItem('authToken');
        localStorage.removeItem('refreshToken');
        setAuthState({ user: null, isAuthenticated: false, isLoading: false });
    };

    //const hasPermission = (permission: string): boolean => {
    //    // Check if user has the specific permission from Django backend
    //    if (!authState.user?.permission) return false;
        
    //    // Check both direct permissions and Django permission format
    //    const userPermissions = authState.user.permission;
    //    return userPermissions.includes(permission as any) || 
    //           userPermissions.some(p => p.includes(permission));
    //};
    const hasPermission = (permission: string | null) => {
        if (!permission) return true;
        return authState.user?.permissions?.some((p: Permissions) => p.codename === permission) || false;
    };

    const refreshPermissions = async (): Promise<boolean> => {
        if (!authState.user?.id) return false;
        
        try {
            const updatedUser = await AuthService.refreshUserPermissions(authState.user.id);
            localStorage.setItem('currentUser', JSON.stringify(updatedUser));
            setAuthState(prev => ({ ...prev, user: updatedUser }));
            return true;
        } catch (error) {
            console.error('Failed to refresh permissions:', error);
            return false;
        }
    };

    // TODO: Add these methods for future backend integration
    // const refreshToken = async () => { ... }
    // const changePassword = async (oldPassword: string, newPassword: string) => { ... }
    // const requestPasswordReset = async (email: string) => { ... }
    // const resetPassword = async (token: string, newPassword: string) => { ... }

    return {
        ...authState,
        login,
        register,
        logout,
        isSuperuser,
        hasPermission,
        refreshPermissions
    };
};
