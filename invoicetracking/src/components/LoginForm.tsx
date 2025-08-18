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
import { LogIn, Eye, EyeOff, User, Lock, AlertCircle, UserPlus } from 'lucide-react';
import { LoginCredentials } from '../types/auth';

interface LoginFormProps {
    onLogin: (credentials: LoginCredentials) => Promise<boolean>;
    onSwitchToRegister: () => void;
    isLoading: boolean;
}

export const LoginForm: React.FC<LoginFormProps> = ({ onLogin, onSwitchToRegister, isLoading }) => {
    const [credentials, setCredentials] = useState<LoginCredentials>({
        email: '',
        password: ''
    });
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (!credentials.email || !credentials.password) {
            setError('Veuillez remplir tous les champs');
            return;
        }

        const success = await onLogin(credentials);
        if (!success) {
            setError('Email ou mot de passe incorrect');
        }
    };

    const demoAccounts = [
        { role: 'Administrateur', email: 'marie.dubois@company.com', password: 'admin123' },
        { role: 'Manager', email: 'pierre.martin@company.com', password: 'manager123' },
        { role: 'Employ', email: 'jean.durand@company.com', password: 'employee123' },
        { role: 'Visualiseur', email: 'alice.bernard@company.com', password: 'viewer123' }
    ];

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
            <div className="max-w-md w-full space-y-8">
                <div className="bg-white rounded-2xl shadow-xl p-8">
                    <div className="text-center mb-8">
                        <div className="mx-auto h-16 w-16 bg-blue-600 rounded-full flex items-center justify-center mb-4">
                            <LogIn className="h-8 w-8 text-white" />
                        </div>
                        <h2 className="text-3xl font-bold text-gray-900">FactureFlow</h2>
                        <p className="text-gray-600 mt-2">Connectez-vous votre compte</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Adresse email
                            </label>
                            <div className="relative">
                                <User className="h-5 w-5 text-gray-400 absolute left-3 top-3" />
                                <input
                                    type="email"
                                    value={credentials.email}
                                    onChange={(e) => setCredentials(prev => ({ ...prev, email: e.target.value }))}
                                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    placeholder="votre.email@company.com"
                                    disabled={isLoading}
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Mot de passe
                            </label>
                            <div className="relative">
                                <Lock className="h-5 w-5 text-gray-400 absolute left-3 top-3" />
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    value={credentials.password}
                                    onChange={(e) => setCredentials(prev => ({ ...prev, password: e.target.value }))}
                                    className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    placeholder="Votre mot de passe"
                                    disabled={isLoading}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                                    disabled={isLoading}
                                >
                                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                                </button>
                            </div>
                        </div>

                        {error && (
                            <div className="flex items-center space-x-2 text-red-600 bg-red-50 p-3 rounded-lg">
                                <AlertCircle className="h-5 w-5" />
                                <span className="text-sm">{error}</span>
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                        >
                            {isLoading ? (
                                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                            ) : (
                                <>
                                    <LogIn className="h-5 w-5 mr-2" />
                                    Se connecter
                                </>
                            )}
                        </button>
                    </form>

                    <div className="mt-6 text-center">
                        <p className="text-gray-600 mb-3">Vous n'avez pas de compte ?</p>
                        <button
                            onClick={onSwitchToRegister}
                            disabled={isLoading}
                            className="flex items-center justify-center w-full text-green-600 hover:text-green-700 font-medium transition-colors"
                        >
                            <UserPlus className="h-4 w-4 mr-2" />
                            Crer un compte
                        </button>
                    </div>
                </div>

                {/* Comptes de dmonstration */}
                <div className="bg-white rounded-2xl shadow-xl p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Comptes de dmonstration</h3>
                    <div className="space-y-3">
                        {demoAccounts.map((account, index) => (
                            <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                <div>
                                    <p className="font-medium text-gray-900">{account.role}</p>
                                    <p className="text-sm text-gray-600">{account.email}</p>
                                </div>
                                <button
                                    onClick={() => setCredentials({ email: account.email, password: account.password })}
                                    className="text-blue-600 hover:text-blue-700 text-sm font-medium"
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