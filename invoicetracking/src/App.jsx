import React, { useState } from 'react'
//import reactLogo from './assets/react.svg'
//import viteLogo from '/vite.svg'
import { useAuth } from './controllers/useAuth'
import { LoginForm } from './components/LoginForm'
import { RegisterForm } from './components/RegisterForm'
import './App.css'

function App() {
    const { user, isAuthenticated, isLoading, login, register, logout, hasPermission } = useAuth();
    const [showRegister, setShowRegister] = useState(false);

    // Afficher l'�cran de chargement
    if (isLoading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    // Afficher la page de connexion si non authentifié
    if (!isAuthenticated || !user) {
        if (showRegister) {
            return (
                <RegisterForm
                    onRegister={register}
                    onBackToLogin={() => setShowRegister(false)}
                    isLoading={isLoading}
                />
            );
        }
        return (
            <LoginForm
                onLogin={login}
                onSwitchToRegister={() => setShowRegister(true)}
                isLoading={isLoading}
            />
        );
    }

    // Afficher le tableau de bord si authentifié
    return (
        <div className="min-h-screen bg-gray-50">
            <nav className="bg-white shadow-sm border-b">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        <div className="flex items-center">
                            <h1 className="text-xl font-semibold text-gray-900">FactureFlow</h1>
                        </div>
                        <div className="flex items-center space-x-4">
                            <div className="flex items-center space-x-3">
                                <img 
                                    src={user.avatar} 
                                    alt={user.name}
                                    className="h-8 w-8 rounded-full"
                                />
                                <div className="text-sm">
                                    <p className="text-gray-900 font-medium">{user.name}</p>
                                    <p className="text-gray-500">{user.role}</p>
                                </div>
                            </div>
                            <button
                                onClick={logout}
                                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                            >
                                Déconnexion
                            </button>
                        </div>
                    </div>
                </div>
            </nav>
            
            <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
                <div className="px-4 py-6 sm:px-0">
                    <div className="border-4 border-dashed border-gray-200 rounded-lg h-96 flex items-center justify-center">
                        <div className="text-center">
                            <h3 className="text-lg font-medium text-gray-900 mb-2">
                                Bienvenue dans FactureFlow
                            </h3>
                            <p className="text-gray-500">
                                Module d'authentification configuré avec succès.
                            </p>
                            <p className="text-sm text-gray-400 mt-2">
                                Prêt pour l'intégration du backend MySQL + Python
                            </p>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}


export default App
