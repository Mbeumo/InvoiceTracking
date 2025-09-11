import React from 'react';
import { Link } from 'react-router-dom';
import { Shield, Home, LogIn } from 'lucide-react';
import { useI18n } from '../i18n';

interface UnauthorizedAccessProps {
  isAuthenticated?: boolean;
  message?: string;
}

const UnauthorizedAccess: React.FC<UnauthorizedAccessProps> = ({ 
  isAuthenticated = false, 
  message = "You don't have permission to access this page." 
}) => {
  const { t } = useI18n();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4">
      <div className="max-w-md w-full text-center">
        <div className="mb-8">
          <div className="mx-auto w-24 h-24 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mb-6">
            <Shield className="w-12 h-12 text-red-600 dark:text-red-400" />
          </div>
          
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
            Access Denied
          </h1>
          
          <p className="text-gray-600 dark:text-gray-400 mb-8">
            {message}
          </p>
        </div>
        
        <div className="space-y-4">
          {isAuthenticated ? (
            <Link
              to="/dashboard"
              className="inline-flex items-center justify-center w-full px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
            >
              <Home className="w-5 h-5 mr-2" />
              Go to Dashboard
            </Link>
          ) : (
            <Link
              to="/"
              className="inline-flex items-center justify-center w-full px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
            >
              <LogIn className="w-5 h-5 mr-2" />
              Sign In
            </Link>
          )}
          
          <button
            onClick={() => window.history.back()}
            className="inline-flex items-center justify-center w-full px-6 py-3 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-900 dark:text-gray-100 font-medium rounded-lg transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    </div>
  );
};

export default UnauthorizedAccess;
