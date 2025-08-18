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
import { User as UserType, UserRole } from '../types/auth'

interface RegisterFormProps {
    onRegister: (userData: Omit<UserType, 'id' | 'permissions' | 'lastLogin'>) => Promise<boolean>;
    onBackToLogin: () => void;
    isLoading: boolean;
}

interface RegisterData {
    name: string;
    email: string;
    password: string;
    confirmPassword: string;
    service: string;
    role: UserRole;
}

export const RegisterForm: React.FC<RegisterFormProps> = ({ onRegister, onBackToLogin, isLoading }) => {
    const [formData, setFormData] = useState<RegisterData>({
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

    const services = [
        { id: 'accounting', name: 'Comptabilit' },
        { id: 'purchasing', name: 'Achats' },
        { id: 'finance', name: 'Finance' },
        { id: 'management', name: 'Direction' },
        { id: 'hr', name: 'Ressources Humaines' }
    ];

    const roles = [
        { id: 'employee', name: 'Employ' },
        { id: 'manager', name: 'Manager' },
        { id: 'admin', name: 'Administrateur' }
    ];

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        // Validation
        if (!formData.name || !formData.email || !formData.password || !formData.service) {
            setError('Veuillez remplir tous les champs obligatoires');
            return;
        }

        if (formData.password !== formData.confirmPassword) {
            setError('Les mots de passe ne correspondent pas');
            return;
        }

        if (formData.password.length < 6) {
            setError('Le mot de passe doit contenir au moins 6 caractres');
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
            avatar: `https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop`
        };

        const success = await onRegister(userData);
        if (!success) {
            setError('Une erreur est survenue lors de l\'inscription');
        }
    };

    const updateFormData = (field: keyof RegisterData, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
            <div className="max-w-md w-full space-y-8">
                <div className="bg-white rounded-2xl shadow-xl p-8">
                    <div className="text-center mb-8">
                        <div className="mx-auto h-16 w-16 bg-green-600 rounded-full flex items-center justify-center mb-4">
                            <UserPlus className="h-8 w-8 text-white" />
                        </div>
                        <h2 className="text-3xl font-bold text-gray-900">Crer un compte</h2>
                        <p className="text-gray-600 mt-2">Rejoignez FactureFlow</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Nom complet *
                            </label>
                            <div className="relative">
                                <User className="h-5 w-5 text-gray-400 absolute left-3 top-3" />
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => updateFormData('name', e.target.value)}
                                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                    placeholder="Votre nom complet"
                                    disabled={isLoading}
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Adresse email *
                            </label>
                            <div className="relative">
                                <Mail className="h-5 w-5 text-gray-400 absolute left-3 top-3" />
                                <input
                                    type="email"
                                    value={formData.email}
                                    onChange={(e) => updateFormData('email', e.target.value)}
                                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                    placeholder="votre.email@company.com"
                                    disabled={isLoading}
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Service *
                            </label>
                            <div className="relative">
                                <Building className="h-5 w-5 text-gray-400 absolute left-3 top-3" />
                                <select
                                    value={formData.service}
                                    onChange={(e) => updateFormData('service', e.target.value)}
                                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent appearance-none"
                                    disabled={isLoading}
                                >
                                    <option value="">Slectionnez votre service</option>
                                    {services.map((service) => (
                                        <option key={service.id} value={service.id}>
                                            {service.name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Role
                            </label>
                            <select
                                value={formData.role}
                                onChange={(e) => updateFormData('role', e.target.value as UserRole)}
                                className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
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
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Mot de passe *
                            </label>
                            <div className="relative">
                                <Lock className="h-5 w-5 text-gray-400 absolute left-3 top-3" />
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    value={formData.password}
                                    onChange={(e) => updateFormData('password', e.target.value)}
                                    className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                    placeholder="Minimum 6 caractres"
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

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Confirmer le mot de passe *
                            </label>
                            <div className="relative">
                                <Lock className="h-5 w-5 text-gray-400 absolute left-3 top-3" />
                                <input
                                    type={showConfirmPassword ? 'text' : 'password'}
                                    value={formData.confirmPassword}
                                    onChange={(e) => updateFormData('confirmPassword', e.target.value)}
                                    className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                    placeholder="Confirmez votre mot de passe"
                                    disabled={isLoading}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                    className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                                    disabled={isLoading}
                                >
                                    {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
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
                            className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-3 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                        >
                            {isLoading ? (
                                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                            ) : (
                                <>
                                    <UserPlus className="h-5 w-5 mr-2" />
                                    Creer le compte
                                </>
                            )}
                        </button>
                    </form>

                    <div className="mt-6 text-center">
                        <button
                            onClick={onBackToLogin}
                            disabled={isLoading}
                            className="flex items-center justify-center w-full text-gray-600 hover:text-gray-900 transition-colors"
                        >
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            Retour a la connexion
                        </button>
                    </div>
                </div>

                <div className="bg-white rounded-2xl shadow-xl p-6">
                    <div className="text-center">
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">Informations importantes</h3>
                        <div className="text-sm text-gray-600 space-y-2">
                            <p> Les comptes sont soumis validation</p>
                            <p> Vos permissions dpendent de votre rle</p>
                            <p> Contactez l'administrateur pour des rleslevs</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};