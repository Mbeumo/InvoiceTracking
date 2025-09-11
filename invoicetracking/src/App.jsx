import React, { useState } from 'react';
import { BrowserRouter } from 'react-router-dom';
import { useAuth } from './controllers/useAuth';
import { RegisterForm } from './pages/RegisterForm';
import { useI18n } from './i18n';
import './App.css';
import AppRoutes from './routes'; // Import your optimized route definitions
import Navigation from './components/Navigation';

function App() {
    const { user, isAuthenticated, isLoading, login, register, logout } = useAuth();
    const { t } = useI18n();
    const [showRegister, setShowRegister] = useState(false);

    // ⏳ Loading screen
    if (isLoading) {
        return (
            <div className="min-h-screen w-full bg-gray-50 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    // 🧾 Registration flow
    if (!isAuthenticated && showRegister) {
        return (
            <div className="min-h-screen w-full">
                <RegisterForm
                    onRegister={register}
                    onBackToLogin={() => setShowRegister(false)}
                    isLoading={isLoading}
                />
            </div>
        );
    }

    // 🧠 Main app with routing
    return (
        <BrowserRouter>
            <div className="min-h-screen w-full bg-gray-50 dark:bg-gray-950">
                {/* Navigation Header */}
                {isAuthenticated && user && (
                    <nav className="bg-white dark:bg-gray-900 shadow-sm border-b border-gray-200 dark:border-gray-800 sticky top-0 z-50">
                        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                            <div className="flex justify-between items-center h-16">
                                <div className="flex items-center">
                                    <h1 className="text-xl font-semibold text-gray-900 dark:text-gray-100">{t('app.name')}</h1>
                                </div>
                                <div className="flex items-center space-x-2 sm:space-x-4">
                                    <div className="flex items-center space-x-2 sm:space-x-3">
                                        <img
                                            src={user.avatar}
                                            alt={user.name}
                                            className="h-8 w-8 rounded-full"
                                        />
                                        <div className="hidden sm:block text-sm">
                                            <p className="text-gray-900 dark:text-gray-100 font-medium">{user.name}</p>
                                            <p className="text-gray-500 dark:text-gray-300">{user.role}</p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={logout}
                                        className="bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded-lg text-sm font-medium transition-colors sm:px-4"
                                    >
                                        <span className="hidden sm:inline">{t('nav.logout')}</span>
                                        <span className="sm:hidden">{t('nav.logout')}</span>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </nav>
                )}

                {/* Navigation */}
                {isAuthenticated && user && (
                    <Navigation user={user} />
                )}

                {/* Route Rendering */}
                <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
                    <AppRoutes
                        isAuthenticated={isAuthenticated}
                        user={user}
                        login={login}
                        isLoading={isLoading}
                        setShowRegister={setShowRegister}
                    />
                </main>
            </div>
        </BrowserRouter>
    );
}

export default App;