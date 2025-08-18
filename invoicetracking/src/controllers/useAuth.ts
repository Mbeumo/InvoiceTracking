import { useState, useEffect } from 'react'
import { AuthState, LoginCredentials, User } from '../types/auth'
import { mockUsers, demoCredentials, rolePermissions } from '../data/users'

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
        // TODO: Replace with JWT token validation from backend
        // Check if user has valid JWT token in localStorage/cookies
        // Verify token with Python backend API
        const savedUser = localStorage.getItem('currentUser');
        if (savedUser) {
            try {
                const user = JSON.parse(savedUser);
                setAuthState({
                    user,
                    isAuthenticated: true,
                    isLoading: false
                });
            } catch (error) {
                localStorage.removeItem('currentUser');
                setAuthState(prev => ({ ...prev, isLoading: false }));
            }
        } else {
            setAuthState(prev => ({ ...prev, isLoading: false }));
        }
    }, []);

    const login = async (credentials: LoginCredentials): Promise<boolean> => {
        setAuthState(prev => ({ ...prev, isLoading: true }));

        // TODO: Replace with real API call to Python backend
        // POST /api/auth/login
        // {
        //   "email": "user@example.com",
        //   "password": "hashed_password"
        // }
        // Response: { "token": "jwt_token", "user": {...}, "refresh_token": "..." }
        
        // SIMULATION: Mock API delay
        await new Promise(resolve => setTimeout(resolve, 1000));

        // TODO: Replace with backend validation
        // Backend should:
        // 1. Hash password with bcrypt
        // 2. Query MySQL database for user
        // 3. Verify password hash
        // 4. Generate JWT token
        // 5. Return user data and tokens
        const validCredential = demoCredentials.find(
            cred => cred.email === credentials.email && cred.password === credentials.password
        );

        if (validCredential) {
            const user = mockUsers.find(u => u.email === credentials.email);
            if (user) {
                const updatedUser = { ...user, lastLogin: new Date().toISOString() };
                
                // TODO: Store JWT token instead of user object
                // localStorage.setItem('authToken', jwtToken);
                // localStorage.setItem('refreshToken', refreshToken);
                localStorage.setItem('currentUser', JSON.stringify(updatedUser));
                
                setAuthState({
                    user: updatedUser,
                    isAuthenticated: true,
                    isLoading: false
                });
                return true;
            }
        }

        setAuthState(prev => ({ ...prev, isLoading: false }));
        return false;
    };

    const register = async (userData: Omit<User, 'id' | 'permissions' | 'lastLogin'>): Promise<boolean> => {
        setAuthState(prev => ({ ...prev, isLoading: true }));

        // TODO: Replace with real API call to Python backend
        // POST /api/auth/register
        // {
        //   "name": "User Name",
        //   "email": "user@example.com",
        //   "password": "plain_password",
        //   "service": "accounting",
        //   "role": "employee"
        // }
        // Backend should:
        // 1. Hash password with bcrypt
        // 2. Check if email exists in MySQL
        // 3. Insert new user into database
        // 4. Send email verification (optional)
        // 5. Return success/failure
        
        // SIMULATION: Mock API delay
        await new Promise(resolve => setTimeout(resolve, 1500));

        // TODO: Replace with backend validation
        const existingUser = mockUsers.find(u => u.email === userData.email);
        if (existingUser) {
            setAuthState(prev => ({ ...prev, isLoading: false }));
            return false;
        }

        // TODO: Backend should generate proper UUID and handle permissions
        const newUser: User = {
            ...userData,
            id: Date.now().toString(),
            permissions: rolePermissions[userData.role] || rolePermissions.employee,
            lastLogin: new Date().toISOString()
        };

        // TODO: Remove this mock data manipulation
        mockUsers.push(newUser);

        // TODO: Backend should return JWT token after successful registration
        localStorage.setItem('currentUser', JSON.stringify(newUser));
        setAuthState({
            user: newUser,
            isAuthenticated: true,
            isLoading: false
        });

        return true;
    };

    const logout = () => {
        // TODO: Call backend logout endpoint
        // POST /api/auth/logout
        // Backend should:
        // 1. Invalidate JWT token
        // 2. Clear refresh token
        // 3. Log logout event
        
        localStorage.removeItem('currentUser');
        // TODO: Also remove JWT tokens
        // localStorage.removeItem('authToken');
        // localStorage.removeItem('refreshToken');
        
        setAuthState({
            user: null,
            isAuthenticated: false,
            isLoading: false
        });
    };

    const hasPermission = (permission: string): boolean => {
        // TODO: Backend should validate permissions on each request
        // Frontend permission check is for UI purposes only
        // Always verify permissions on backend API calls
        return authState.user?.permissions.includes(permission as any) || false;
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
        hasPermission
    };
};