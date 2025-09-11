/**
 * Registration Form Component
 * 
 * CURRENT IMPLEMENTATION: Mock user creation with localStorage
 * FUTURE ENHANCEMENT: Integrate with Python backend API
 * 
 * TODO: Replace onRegister prop with real API call
 * - POST /api/auth/register
 * - Handle user creation response
 * - Implement email verification flow
 * - Add CAPTCHA protection
 * - Implement terms of service acceptance
 * - Add password strength requirements
 * - Send welcome email after registration
 */

import React, { useState } from 'react'
import { UserPlus, Eye, EyeOff, User, Lock, Mail, Building, AlertCircle, ArrowLeft } from 'lucide-react'
import { RegisterData, UserRole } from '../types/auth'
import { useI18n } from '../i18n'

interface RegisterFormProps {
    onRegister: (userData: RegisterData) => Promise<boolean>;
    onBackToLogin: () => void;
    isLoading: boolean;
}

interface RegisterFormData {
    name: string;
    email: string;
    password: string;
    confirmPassword: string;
    service: string;
    role: UserRole;
}

export const RegisterForm: React.FC<RegisterFormProps> = ({ onRegister, onBackToLogin, isLoading }) => {
    const { t } = useI18n();
    const [formData, setFormData] = useState<RegisterFormData>({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
        service: '',
        role: 'employee'
    });
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [error, setError] = useState('');
    //modify this 
    const services = [
        { id: 'accounting', name: 'Comptabilité' },
        { id: 'purchasing', name: 'Achats' },
        { id: 'finance', name: 'Finance' },
        { id: 'management', name: 'Direction' },
        { id: 'hr', name: 'Ressources Humaines' }
    ];

    const roles = [
        { id: 'employee', name: 'Employé' },
        { id: 'manager', name: 'Manager' },
        { id: 'admin', name: 'Administrateur' }
    ];

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        // Validation
        if (!formData.name || !formData.email || !formData.password || !formData.service) {
            setError(t('errors.fill_all_fields'));
            return;
        }

        if (formData.password !== formData.confirmPassword) {
            setError('Les mots de passe ne correspondent pas');
            return;
        }

        if (formData.password.length < 8) {
            setError('Le mot de passe doit contenir au moins 8 caractères');
            return;
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(formData.email)) {
            setError('Veuillez entrer une adresse email valide');
            return;
        }

        const userData = {
            name: formData.name,
            email: formData.email,
            service: formData.service,
            role: formData.role,
            password: formData.password,
            avatar_url: `https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop`
        };

        const success = await onRegister(userData);
        if (!success) {
            setError(t('errors.registration_failed'));
        }
    };

    const updateFormData = (field: keyof RegisterFormData, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    return (
        <div className="min-h-screen w-full bg-gradient-to-br from-green-50 to-emerald-100 dark:from-gray-900 dark:to-gray-950 flex items-center justify-center p-2 sm:p-4">
            <div className="w-full max-w-md space-y-6">
                {/* Main Registration Form */}
                <div className="bg-white dark:bg-gray-900 dark:text-gray-100 rounded-2xl shadow-xl p-6 sm:p-8">
                    <div className="text-center mb-6 sm:mb-8">
                        <div className="mx-auto h-12 w-12 sm:h-16 sm:w-16 bg-green-600 rounded-full flex items-center justify-center mb-4">
                            <UserPlus className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
                        </div>
                        <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100">{t('auth.register.title')}</h2>
                        <p className="text-gray-600 dark:text-gray-300 mt-2 text-sm sm:text-base">{t('app.name')}</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Nom complet *
                            </label>
                            <div className="relative">
                                <User className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => updateFormData('name', e.target.value)}
                                    className="w-full pl-10 pr-4 py-2.5 sm:py-3 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm sm:text-base bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                                    placeholder="Votre nom complet"
                                    disabled={isLoading}
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Adresse email *
                            </label>
                            <div className="relative">
                                <Mail className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                                <input
                                    type="email"
                                    value={formData.email}
                                    onChange={(e) => updateFormData('email', e.target.value)}
                                    className="w-full pl-10 pr-4 py-2.5 sm:py-3 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm sm:text-base bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                                    placeholder="votre.email@company.com"
                                    disabled={isLoading}
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Service *
                            </label>
                            <div className="relative">
                                <Building className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                                <select
                                    value={formData.service}
                                    onChange={(e) => updateFormData('service', e.target.value)}
                                    className="w-full pl-10 pr-4 py-2.5 sm:py-3 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent appearance-none text-sm sm:text-base bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                                    disabled={isLoading}
                                >
                                    <option value="">Sélectionnez votre service</option>
                                    {services.map((service) => (
                                        <option key={service.id} value={service.id}>
                                            {service.name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Rôle
                            </label>
                            <select
                                value={formData.role}
                                onChange={(e) => updateFormData('role', e.target.value as UserRole)}
                                className="w-full px-3 py-2.5 sm:py-3 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm sm:text-base bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                                disabled={isLoading}
                            >
                                {roles.map((role) => (
                                    <option key={role.id} value={role.id}>
                                        {role.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Mot de passe *
                            </label>
                            <div className="relative">
                                <Lock className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    value={formData.password}
                                    onChange={(e) => updateFormData('password', e.target.value)}
                                    className="w-full pl-10 pr-12 py-2.5 sm:py-3 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm sm:text-base bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                                    placeholder="Minimum 8 caractères"
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

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Confirmer le mot de passe *
                            </label>
                            <div className="relative">
                                <Lock className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                                <input
                                    type={showConfirmPassword ? 'text' : 'password'}
                                    value={formData.confirmPassword}
                                    onChange={(e) => updateFormData('confirmPassword', e.target.value)}
                                    className="w-full pl-10 pr-12 py-2.5 sm:py-3 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm sm:text-base bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                                    placeholder="Confirmez votre mot de passe"
                                    disabled={isLoading}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                    disabled={isLoading}
                                >
                                    {showConfirmPassword ? <EyeOff className="h-4 w-4 sm:h-5 sm:w-5" /> : <Eye className="h-4 w-4 sm:h-5 sm:w-5" />}
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
                            className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-2.5 sm:py-3 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center text-sm sm:text-base"
                        >
                            {isLoading ? (
                                <div className="animate-spin rounded-full h-4 w-4 sm:h-5 sm:w-5 border-b-2 border-white"></div>
                            ) : (
                                <>
                                    <UserPlus className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
                                    {t('auth.register.button')}
                                </>
                            )}
                        </button>
                    </form>

                    <div className="mt-6 text-center">
                        <button
                            onClick={onBackToLogin}
                            disabled={isLoading}
                            className="flex items-center justify-center w-full text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors text-sm sm:text-base"
                        >
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            {t('auth.register.back')}
                        </button>
                    </div>
                </div>

                {/* Information Box */}
                <div className="bg-white dark:bg-gray-900 dark:text-gray-100 rounded-2xl shadow-xl p-4 sm:p-6">
                    <div className="text-center">
                        <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2">Informations importantes</h3>
                        <div className="text-xs sm:text-sm text-gray-600 space-y-2">
                            <p>• Les comptes sont soumis à validation</p>
                            <p>• Vos permissions dépendent de votre rôle</p>
                            <p>• Contactez l'administrateur pour des rôles élevés</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};