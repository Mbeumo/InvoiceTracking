import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Home, ArrowLeft, Search, FileQuestion } from 'lucide-react';
import { useI18n } from '../i18n';

interface NotFoundProps {
  isAuthenticated?: boolean;
  user?: any;
}

export const NotFound: React.FC<NotFoundProps> = ({ isAuthenticated = false, user = null }) => {
  const { t } = useI18n();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4">
      <div className="max-w-lg w-full text-center">
        <div className="mb-8">
          {/* Animated 404 with icon */}
          <div className="relative mb-6">
            <h1 className="text-9xl font-bold text-gray-200 dark:text-gray-700">404</h1>
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
              <FileQuestion className="w-16 h-16 text-gray-400 dark:text-gray-600 animate-pulse" />
            </div>
          </div>
          
          <div className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
            Oops! Page Not Found
          </div>
          
          <p className="text-gray-600 dark:text-gray-400 mb-8">
            The page you're looking for doesn't exist or has been moved. 
            {isAuthenticated && user && (
              <span className="block mt-2 text-sm">
                Hi {user.name}, let's get you back on track!
              </span>
            )}
          </p>
        </div>
        
        <div className="space-y-4">
          {isAuthenticated && user ? (
            <>
              <Link
                to="/dashboard"
                className="inline-flex items-center justify-center w-full px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors shadow-lg hover:shadow-xl"
              >
                <Home className="w-5 h-5 mr-2" />
                Go to Dashboard
              </Link>
              
              <div className="grid grid-cols-2 gap-3">
                <Link
                  to="/invoices"
                  className="inline-flex items-center justify-center px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-colors"
                >
                  <Search className="w-4 h-4 mr-1" />
                  Invoices
                </Link>
                
                <Link
                  to="/users"
                  className="inline-flex items-center justify-center px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-lg transition-colors"
                >
                  <Search className="w-4 h-4 mr-1" />
                  Users
                </Link>
              </div>
            </>
          ) : (
            <Link
              to="/"
              className="inline-flex items-center justify-center w-full px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors shadow-lg hover:shadow-xl"
            >
              <Home className="w-5 h-5 mr-2" />
              Go to Login
            </Link>
          )}
          
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center justify-center w-full px-6 py-3 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-900 dark:text-gray-100 font-medium rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Go Back
          </button>
        </div>
        
        {/* Helpful links */}
        <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">
            Need help? Try these popular pages:
          </p>
          <div className="flex flex-wrap justify-center gap-2 text-xs">
            {isAuthenticated ? (
              <>
                <Link to="/dashboard" className="text-blue-600 hover:text-blue-800 dark:text-blue-400">Dashboard</Link>
                <span className="text-gray-300">•</span>
                <Link to="/settings" className="text-blue-600 hover:text-blue-800 dark:text-blue-400">Settings</Link>
                <span className="text-gray-300">•</span>
                <Link to="/help" className="text-blue-600 hover:text-blue-800 dark:text-blue-400">Help</Link>
              </>
            ) : (
              <>
                <Link to="/" className="text-blue-600 hover:text-blue-800 dark:text-blue-400">Login</Link>
                <span className="text-gray-300">•</span>
                <Link to="/register" className="text-blue-600 hover:text-blue-800 dark:text-blue-400">Register</Link>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

