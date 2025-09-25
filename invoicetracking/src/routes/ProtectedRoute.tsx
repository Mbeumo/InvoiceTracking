import React, { Suspense } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { Permissions } from '../types/auth';
import { useAuth } from '../hooks/useAuth';
interface ProtectedRouteProps {
  children: React.ReactNode;
  isAuthenticated: boolean;
  user: any;
  requiredPermissions?: string[];
  isPublic?: boolean;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  isAuthenticated,
  user,
  requiredPermissions = [],
  isPublic = false
}) => {
  // Public routes - allow access without authentication
  if (isPublic) {
    return <>{children}</>;
  }

  // Check authentication
  if (!isAuthenticated || !user) {
    return <Navigate to="/" replace />;
  }
    const { isSuperuser } = useAuth();
    console.log("User is superuser:", isSuperuser());

  // Check permissions if required
  if (requiredPermissions.length > 0) {

        const hasAllPermissions = isSuperuser || requiredPermissions.every(permission =>
            user?.permissions?.some((p: Permissions) => p.codename === permission)
        );

        //TODO: check this later
         //make the make 
     /* const hasPermission = (permission: string): boolean => {
          return user?.permissions?.some(p => p.codename === permission) || false;
      };*/

      if (!hasAllPermissions) {
          return (
              /*<div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
                <div className="max-w-md w-full bg-white dark:bg-gray-800 shadow-lg rounded-lg p-6">
                  <div className="text-center">
                    <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 dark:bg-red-900">
                      <svg className="h-6 w-6 text-red-600 dark:text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                      </svg>
                    </div>
                    <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-gray-100">Access Denied</h3>
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                      You don't have permission to access this page.
                    </p>
                    <div className="mt-6">
                      <button
                        onClick={() => usenavigate(-1)}
                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                      >
                        Go Back
                      </button>
                    </div>
                  </div>
                </div>
              </div>*/
                  <Navigate to="/unauthorized" replace />


      );
    }
  }

  return <>{children}</>;
};
