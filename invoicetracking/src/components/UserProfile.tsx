import React, { useState } from 'react';
import { User, Settings, LogOut, Shield, Clock, Mail } from 'lucide-react';
import { User as UserType } from '../types/auth';
import { useAuth } from '../controllers/useAuth';
interface UserProfileProps {
    user: UserType;
    onLogout: () => void;
}

const roleLabels = {
    admin: 'Administrator',
    manager: 'Manager',
    employee: 'Employee',
    viewer: 'Viewer'
};

const roleColors = {
    admin: 'bg-purple-100 text-purple-800',
    manager: 'bg-blue-100 text-blue-800',
    employee: 'bg-green-100 text-green-800',
    viewer: 'bg-gray-100 text-gray-800'
};

export const UserProfile: React.FC<UserProfileProps> = ({ user, onLogout }) => {
    const [isOpen, setIsOpen] = useState(false);
    const { logout } = useAuth();
    const handleLogout = async () => {
        try {
            await logout();
            // Optionally redirect or clear state here
        } catch (err) {
            console.error('Logout failed:', err);
        }
    };

    return (
        <div className="relative">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
                <div className="h-10 w-10 rounded-full overflow-hidden bg-gray-200 dark:bg-gray-700">
                    {user.avatarUrl ? (
                        <img src={user.avatarUrl} alt={user.name} className="h-full w-full object-cover" />
                    ) : (
                        <div className="h-full w-full flex items-center justify-center">
                            <User className="h-6 w-6 text-gray-400" />
                        </div>
                    )}
                </div>
                <div className="hidden md:block text-left">
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{user.name}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{roleLabels[user.role]}</p>
                </div>
            </button>

            {isOpen && (
                <>
                    <div
                        className="fixed inset-0 z-10"
                        onClick={() => setIsOpen(false)}
                    />
                    <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-gray-900 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-20">
                        <div className="p-4 border-b border-gray-100 dark:border-gray-700">
                            <div className="flex items-center space-x-3">
                                <div className="h-12 w-12 rounded-full overflow-hidden bg-gray-200 dark:bg-gray-700">
                                    {user.avatarUrl ? (
                                        <img src={user.avatarUrl} alt={user.name} className="h-full w-full object-cover" />
                                    ) : (
                                        <div className="h-full w-full flex items-center justify-center">
                                            <User className="h-8 w-8 text-gray-400" />
                                        </div>
                                    )}
                                </div>
                                <div>
                                    <h3 className="font-semibold text-gray-900 dark:text-gray-100">{user.name}</h3>
                                    <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${roleColors[user.role]}`}>
                                        {roleLabels[user.role]}
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className="p-4 space-y-4">
                            <div className="space-y-3">
                                <div className="flex items-center space-x-3 text-sm text-gray-600 dark:text-gray-300">
                                    <Mail className="h-4 w-4" />
                                    <span>{user.email}</span>
                                </div>
                                <div className="flex items-center space-x-3 text-sm text-gray-600 dark:text-gray-300">
                                    <Shield className="h-4 w-4" />
                                    <span>Service: {user.serviceId}</span>
                                </div>
                                {user.lastLogin && (
                                    <div className="flex items-center space-x-3 text-sm text-gray-600 dark:text-gray-300">
                                        <Clock className="h-4 w-4" />
                                        <span>
                                            Last login: {new Date(user.lastLogin).toLocaleDateString()}
                                        </span>
                                    </div>
                                )}
                            </div>

                            <div className="border-t border-gray-100 dark:border-gray-700 pt-4">
                                <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">Permissions</h4>
                                <div className="flex flex-wrap gap-1">
                                    {user.permissions.slice(0, 4).map((permission) => (
                                        <span
                                            key={permission}
                                            className="inline-flex px-2 py-1 rounded text-xs bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300"
                                        >
                                            {permission.replace('_', ' ')}
                                        </span>
                                    ))}
                                    {user.permissions.length > 4 && (
                                        <span className="inline-flex px-2 py-1 rounded text-xs bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-400">
                                            +{user.permissions.length - 4} more
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="border-t border-gray-100 dark:border-gray-700 p-4 space-y-2">
                            <button className="w-full flex items-center space-x-3 px-3 py-2 text-left text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg transition-colors">
                                <Settings className="h-4 w-4" />
                                <span className="text-sm">Account Settings</span>
                            </button>
                            <button
                                onClick={handleLogout}
                                className="w-full flex items-center space-x-3 px-3 py-2 text-left text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                            >
                                <LogOut className="h-4 w-4" />
                                <span className="text-sm">Sign Out</span>
                            </button>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};
