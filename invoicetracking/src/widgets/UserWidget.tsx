import React from 'react';
import { User } from '../types/DatabaseModels';
import { Mail, Phone, MapPin, Shield, Clock, CheckCircle, XCircle } from 'lucide-react';

interface UserWidgetProps {
  user: User;
  onSelect?: (user: User) => void;
  onEdit?: (user: User) => void;
  showActions?: boolean;
  compact?: boolean;
}

export const UserWidget: React.FC<UserWidgetProps> = ({
  user,
  onSelect,
  onEdit,
  showActions = true,
  compact = false
}) => {
  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin':
        return 'bg-red-100 text-red-800';
      case 'manager':
        return 'bg-blue-100 text-blue-800';
      case 'finance':
        return 'bg-green-100 text-green-800';
      case 'approver':
        return 'bg-purple-100 text-purple-800';
      case 'employee':
        return 'bg-gray-100 text-gray-800';
      case 'viewer':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatLastLogin = (lastLogin?: string) => {
    if (!lastLogin) return 'Never';
    const date = new Date(lastLogin);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));

    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    if (diffInMinutes < 10080) return `${Math.floor(diffInMinutes / 1440)}d ago`;
    return date.toLocaleDateString();
  };

  if (compact) {
    return (
      <div 
        className="flex items-center justify-between p-3 bg-white border rounded-lg hover:shadow-md transition-shadow cursor-pointer"
        onClick={() => onSelect?.(user)}
      >
        <div className="flex items-center space-x-3">
          <div className="flex-shrink-0">
            {user.avatar ? (
              <img 
                src={user.avatar} 
                alt={user.name}
                className="w-8 h-8 rounded-full"
              />
            ) : (
              <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                <span className="text-sm font-medium text-gray-700">
                  {user.name.charAt(0).toUpperCase()}
                </span>
              </div>
            )}
          </div>
          <div>
            <p className="font-medium text-gray-900">{user.name}</p>
            <p className="text-sm text-gray-500">{user.email}</p>
          </div>
        </div>
        <div className="text-right">
          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getRoleColor(user.role)}`}>
            {user.role}
          </span>
          <div className="flex items-center justify-end mt-1">
            {user.isActive ? (
              <CheckCircle className="w-4 h-4 text-green-600" />
            ) : (
              <XCircle className="w-4 h-4 text-red-600" />
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow">
      <div className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-start space-x-4">
            <div className="flex-shrink-0">
              {user.avatar ? (
                <img 
                  src={user.avatar} 
                  alt={user.name}
                  className="w-12 h-12 rounded-full"
                />
              ) : (
                <div className="w-12 h-12 bg-gray-300 rounded-full flex items-center justify-center">
                  <span className="text-lg font-medium text-gray-700">
                    {user.name.charAt(0).toUpperCase()}
                  </span>
                </div>
              )}
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-1">
                {user.name}
              </h3>
              <p className="text-gray-600">{user.employeeId}</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <span className={`inline-flex px-3 py-1 text-sm font-medium rounded-full ${getRoleColor(user.role)}`}>
              {user.role}
            </span>
            {user.isActive ? (
              <CheckCircle className="w-5 h-5 text-green-600">
                <title>Active</title>
              </CheckCircle>
            ) : (
              <XCircle className="w-5 h-5 text-red-600">
                <title>Inactive</title>
              </XCircle>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div className="flex items-center space-x-2">
            <Mail className="w-4 h-4 text-gray-400" />
            <div>
              <p className="text-sm text-gray-500">Email</p>
              <p className="font-medium text-gray-900">{user.email}</p>
            </div>
          </div>
          {user.phone && (
            <div className="flex items-center space-x-2">
              <Phone className="w-4 h-4 text-gray-400" />
              <div>
                <p className="text-sm text-gray-500">Phone</p>
                <p className="font-medium text-gray-900">{user.phone}</p>
              </div>
            </div>
          )}
          {user.location && (
            <div className="flex items-center space-x-2">
              <MapPin className="w-4 h-4 text-gray-400" />
              <div>
                <p className="text-sm text-gray-500">Location</p>
                <p className="font-medium text-gray-900">{user.location}</p>
              </div>
            </div>
          )}
          <div className="flex items-center space-x-2">
            <Shield className="w-4 h-4 text-gray-400" />
            <div>
              <p className="text-sm text-gray-500">Service</p>
              <p className="font-medium text-gray-900">{user.serviceId}</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="flex items-center space-x-2">
            <Clock className="w-4 h-4 text-gray-400" />
            <div>
              <p className="text-sm text-gray-500">Last Login</p>
              <p className="font-medium text-gray-900">
                {formatLastLogin(user.lastLogin)}
              </p>
            </div>
          </div>
          <div>
            <p className="text-sm text-gray-500">Status</p>
            <div className="flex items-center space-x-2">
              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                user.isActive ? 'text-green-600 bg-green-100' : 'text-red-600 bg-red-100'
              }`}>
                {user.isActive ? 'Active' : 'Inactive'}
              </span>
              {user.emailVerified && (
                <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full text-blue-600 bg-blue-100">
                  Verified
                </span>
              )}
            </div>
          </div>
        </div>

        {user.failedLoginAttempts > 0 && (
          <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-sm text-yellow-800">
              <strong>Security Alert:</strong> {user.failedLoginAttempts} failed login attempts
            </p>
          </div>
        )}

        {user.notes && (
          <p className="text-sm text-gray-600 mb-4 line-clamp-2">
            {user.notes}
          </p>
        )}

        {showActions && (
          <div className="flex items-center justify-end space-x-2 pt-4 border-t border-gray-100">
            <button
              onClick={() => onSelect?.(user)}
              className="px-3 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
            >
              View Profile
            </button>
            {onEdit && (
              <button
                onClick={() => onEdit(user)}
                className="px-3 py-2 text-sm font-medium text-blue-700 bg-blue-100 rounded-md hover:bg-blue-200 transition-colors"
              >
                Edit User
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
