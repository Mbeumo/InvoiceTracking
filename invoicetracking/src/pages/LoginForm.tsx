/**
 * Login Form Component
 * 
 * CURRENT IMPLEMENTATION: Mock authentication with localStorage
 * FUTURE ENHANCEMENT: Integrate with Python backend API
 * 
 * TODO: Replace onLogin prop with real API call
 * - POST /api/auth/login
 * - Handle JWT token response
 * - Implement proper error handling
 * - Add loading states for API calls
 * - Add remember me functionality
 * - Implement password strength validation
 */

import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth'; // <-- import your hook
import { LoginCredentials } from '../types/auth';
import { LogIn, Eye, EyeOff, User, Lock, AlertCircle, UserPlus } from 'lucide-react';
import { useI18n } from '../i18n';
import { useNavigate } from 'react-router-dom';


export const LoginForm: React.FC<{
    onLogin: (credentials: LoginCredentials) => Promise<boolean>
    isLoading?: boolean
}> = ({ onLogin }) => {
    const { t } = useI18n();
    const { login, isLoading } = useAuth(); // <-- use hook
    const [credentials, setCredentials] = useState<LoginCredentials>({ email: '', password: '' });
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (!credentials.email || !credentials.password) {
            setError(t('errors.fill_all_fields'));
            return;
        }
        /*const goToDashboard = () => {
            navigate('/dashboard'); // 👈 This moves to the named route
        };*/

        try {
            //const successr = await logout();

            const success = await login(credentials);

            if (!success) {
                setError('Login failed. Check console for details.');
                return;
            } else if (success) {
                window.location.reload();
                navigate('/dashboard'); // ✅ Redirect here
                console.log("User permissions:", users?.permissions);

            }
            
        } catch (error: any) {
            console.error('Login form error:', error);
            setError(`Connection error: ${error.message || 'Unable to connect to server'}`);
        }

    };
    const handleDebugClick = async () => {
        const debugInfo: Record<string, string> = {
            'API Base URL': import.meta.env.VITE_API_BASE_URL || 'Not set (using fallback)',
            'Current URL': window.location.href,
            'Environment': import.meta.env.MODE,
            'Auth Token': localStorage.getItem('authToken') ? 'Present' : 'Not found'
        };
        
        console.log('Debug Info:', debugInfo);
        
        // Test API connection
        try {
            console.log('Testing API endpoint:', `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:9999/api/'}auth/token/`);
            const response = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:9999/api/'}auth/token/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    email: 'briand@gmail.com',
                    password: 'Briand123'
                })
            });
            
            const responseText = await response.text();
            console.log('API Test Response:', {
                status: response.status,
                statusText: response.statusText,
                headers: Object.fromEntries(response.headers.entries()),
                body: responseText
            });

            
            debugInfo['API Connection'] = `${response.status} ${response.statusText}`;
            if (responseText) {
                debugInfo['Response Body'] = responseText.substring(0, 100) + '...';
            }
        } catch (error: any) {
            console.error('API Test Error:', error);
            debugInfo['API Connection'] = `Error: ${error.message}`;
        }
        
        alert(`Debug Info:\n${Object.entries(debugInfo).map(([key, value]) => `${key}: ${value}`).join('\n')}`);
    };

    const demoAccounts = [
        { role: 'Administrateur', email: 'marie.dubois@company.com', password: 'admin123' },
        { role: 'Manager', email: 'pierre.martin@company.com', password: 'manager123' },
        { role: 'Employé', email: 'jean.durand@company.com', password: 'employee123' },
        { role: 'Visualiseur', email: 'alice.bernard@company.com', password: 'viewer123' }
    ];

    return (
        <div className="min-h-screen w-full bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-2 sm:p-4">
            <div className="w-full max-w-md space-y-6">
                {/* Main Login Form */}
                <div className="bg-white dark:bg-gray-900 dark:text-gray-100 rounded-2xl shadow-xl p-6 sm:p-8">
                    <div className="text-center mb-6 sm:mb-8">
                        <div className="mx-auto h-12 w-12 sm:h-16 sm:w-16 bg-blue-600 rounded-full flex items-center justify-center mb-4">
                            <LogIn className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
                        </div>
                        <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100">{t('app.name')}</h2>
                        <p className="text-gray-600 dark:text-gray-300 mt-2 text-sm sm:text-base">{t('auth.login.title')}</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                {t('auth.login.email')}
                            </label>
                            <div className="relative">
                                <User className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                                <input
                                    type="email"
                                    value={credentials.email}
                                    onChange={(e) => setCredentials(prev => ({ ...prev, email: e.target.value }))}
                                    className="w-full pl-10 pr-4 py-2.5 sm:py-3 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                                    placeholder="votre.email@company.com"
                                    disabled={isLoading}
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                {t('auth.login.password')}
                            </label>
                            <div className="relative">
                                <Lock className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    value={credentials.password}
                                    onChange={(e) => setCredentials(prev => ({ ...prev, password: e.target.value }))}
                                    className="w-full pl-10 pr-12 py-2.5 sm:py-3 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                                    placeholder="Votre mot de passe"
                                    disabled={isLoading}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                    disabled={isLoading}
                                >
                                    {showPassword ? <EyeOff className="h-4 w-4 sm:h-5 sm:w-5" /> : <Eye className="h-4 w-4 sm:h-5 sm:w-5" />}
                                </button>
                            </div>
                        </div>

                        {error && (
                            <div className="flex items-center space-x-2 text-red-600 bg-red-50 p-3 rounded-lg">
                                <AlertCircle className="h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0" />
                                <span className="text-sm">{error}</span>
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 sm:py-3 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center text-sm sm:text-base"
                        >
                            {isLoading ? (
                                <div className="animate-spin rounded-full h-4 w-4 sm:h-5 sm:w-5 border-b-2 border-white"></div>
                            ) : (
                                <>
                                    <LogIn className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
                                    {t('auth.login.button')}
                                </>
                            )}
                        </button>
                    </form>

                    <div className="mt-6 text-center space-y-3">
                        <p className="text-gray-600 dark:text-gray-300 mb-3 text-sm sm:text-base">Vous n'avez pas de compte ?</p>
                        <button
                            onClick={ () => navigate('/register') }
                            disabled={isLoading}
                            className="flex items-center justify-center w-full text-green-600 hover:text-green-700 font-medium transition-colors text-sm sm:text-base"
                        >
                            <UserPlus className="h-4 w-4 mr-2" />
                            {t('auth.login.create')}
                        </button>
                        
                        <button
                            onClick={handleDebugClick}
                            className="text-xs text-gray-400 hover:text-gray-600 transition-colors"
                        >
                            Debug Connection
                        </button>
                    </div>
                </div>

                {/* Demo Accounts */}
                <div className="bg-white dark:bg-gray-900 dark:text-gray-100 rounded-2xl shadow-xl p-4 sm:p-6">
                    <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">{t('auth.login.demo')}</h3>
                    <div className="space-y-2 sm:space-y-3">
                        {demoAccounts.map((account, index) => (
                            <div key={index} className="flex items-center justify-between p-2 sm:p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                                <div className="min-w-0 flex-1">
                                    <p className="font-medium text-gray-900 dark:text-gray-100 text-sm sm:text-base truncate">{account.role}</p>
                                    <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300 truncate">{account.email}</p>
                                </div>
                                <button
                                    onClick={() => setCredentials({ email: account.email, password: account.password })}
                                    className="text-blue-600 hover:text-blue-700 text-xs sm:text-sm font-medium ml-2 flex-shrink-0"
                                    disabled={isLoading}
                                >
                                    Utiliser
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};