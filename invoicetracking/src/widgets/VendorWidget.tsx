import React from 'react';
import { Vendor } from '../types/DatabaseModels';
import { Mail, Phone, Globe, MapPin, Star, Building } from 'lucide-react';

interface VendorWidgetProps {
  vendor: Vendor;
  onSelect?: (vendor: Vendor) => void;
  onEdit?: (vendor: Vendor) => void;
  showActions?: boolean;
  compact?: boolean;
}

export const VendorWidget: React.FC<VendorWidgetProps> = ({
  vendor,
  onSelect,
  onEdit,
  showActions = true,
  compact = false
}) => {
  const formatRating = (rating?: number) => {
    if (!rating) return 'No rating';
    return `${rating.toFixed(1)}/5.0`;
  };

  const getRatingColor = (rating?: number) => {
    if (!rating) return 'text-gray-400';
    if (rating >= 4.5) return 'text-green-600';
    if (rating >= 4.0) return 'text-yellow-600';
    if (rating >= 3.0) return 'text-orange-600';
    return 'text-red-600';
  };

  if (compact) {
    return (
      <div 
        className="flex items-center justify-between p-3 bg-white border rounded-lg hover:shadow-md transition-shadow cursor-pointer"
        onClick={() => onSelect?.(vendor)}
      >
        <div className="flex items-center space-x-3">
          <div className="flex-shrink-0">
            <Building className="w-5 h-5 text-gray-400" />
          </div>
          <div>
            <p className="font-medium text-gray-900">{vendor.name}</p>
            <p className="text-sm text-gray-500">{vendor.code}</p>
          </div>
        </div>
        <div className="text-right">
          <div className="flex items-center space-x-1">
            <Star className={`w-4 h-4 ${getRatingColor(vendor.rating)}`} />
            <span className={`text-sm font-medium ${getRatingColor(vendor.rating)}`}>
              {formatRating(vendor.rating)}
            </span>
          </div>
          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
            vendor.isActive ? 'text-green-600 bg-green-100' : 'text-red-600 bg-red-100'
          }`}>
            {vendor.isActive ? 'Active' : 'Inactive'}
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow">
      <div className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-1">
              {vendor.name}
            </h3>
            <p className="text-gray-600">{vendor.code}</p>
          </div>
          <div className="flex items-center space-x-2">
            <div className="flex items-center space-x-1">
              <Star className={`w-4 h-4 ${getRatingColor(vendor.rating)}`} />
              <span className={`text-sm font-medium ${getRatingColor(vendor.rating)}`}>
                {formatRating(vendor.rating)}
              </span>
            </div>
            <span className={`inline-flex px-3 py-1 text-sm font-medium rounded-full ${
              vendor.isActive ? 'text-green-600 bg-green-100' : 'text-red-600 bg-red-100'
            }`}>
              {vendor.isActive ? 'Active' : 'Inactive'}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          {vendor.email && (
            <div className="flex items-center space-x-2">
              <Mail className="w-4 h-4 text-gray-400" />
              <div>
                <p className="text-sm text-gray-500">Email</p>
                <p className="font-medium text-gray-900">{vendor.email}</p>
              </div>
            </div>
          )}
          {vendor.phone && (
            <div className="flex items-center space-x-2">
              <Phone className="w-4 h-4 text-gray-400" />
              <div>
                <p className="text-sm text-gray-500">Phone</p>
                <p className="font-medium text-gray-900">{vendor.phone}</p>
              </div>
            </div>
          )}
          {vendor.website && (
            <div className="flex items-center space-x-2">
              <Globe className="w-4 h-4 text-gray-400" />
              <div>
                <p className="text-sm text-gray-500">Website</p>
                <a 
                  href={vendor.website} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="font-medium text-blue-600 hover:text-blue-800"
                >
                  {vendor.website}
                </a>
              </div>
            </div>
          )}
          {vendor.city && vendor.country && (
            <div className="flex items-center space-x-2">
              <MapPin className="w-4 h-4 text-gray-400" />
              <div>
                <p className="text-sm text-gray-500">Location</p>
                <p className="font-medium text-gray-900">
                  {vendor.city}, {vendor.country}
                </p>
              </div>
            </div>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <p className="text-sm text-gray-500">Payment Terms</p>
            <p className="font-medium text-gray-900">{vendor.paymentTerms} days</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Currency</p>
            <p className="font-medium text-gray-900">{vendor.defaultCurrency}</p>
          </div>
        </div>

        {vendor.notes && (
          <p className="text-sm text-gray-600 mb-4 line-clamp-2">
            {vendor.notes}
          </p>
        )}

        {showActions && (
          <div className="flex items-center justify-end space-x-2 pt-4 border-t border-gray-100">
            <button
              onClick={() => onSelect?.(vendor)}
              className="px-3 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
            >
              View Details
            </button>
            {onEdit && (
              <button
                onClick={() => onEdit(vendor)}
                className="px-3 py-2 text-sm font-medium text-blue-700 bg-blue-100 rounded-md hover:bg-blue-200 transition-colors"
              >
                Edit
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
