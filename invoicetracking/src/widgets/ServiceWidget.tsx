import React from 'react';
import { Service } from '../types/DatabaseModels';
import { Building2, DollarSign, Calendar, Shield, CheckCircle, XCircle } from 'lucide-react';

interface ServiceWidgetProps {
  service: Service;
  onSelect?: (service: Service) => void;
  onEdit?: (service: Service) => void;
  showActions?: boolean;
  compact?: boolean;
}

export const ServiceWidget: React.FC<ServiceWidgetProps> = ({
  service,
  onSelect,
  onEdit,
  showActions = true,
  compact = false
}) => {
  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency
    }).format(amount);
  };

  if (compact) {
    return (
      <div 
        className="flex items-center justify-between p-3 bg-white border rounded-lg hover:shadow-md transition-shadow cursor-pointer"
        onClick={() => onSelect?.(service)}
      >
        <div className="flex items-center space-x-3">
          <div 
            className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center"
            style={{ backgroundColor: service.color + '20', color: service.color }}
          >
            <Building2 className="w-4 h-4" />
          </div>
          <div>
            <p className="font-medium text-gray-900">{service.name}</p>
            <p className="text-sm text-gray-500">{service.code}</p>
          </div>
        </div>
        <div className="text-right">
          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
            service.isActive ? 'text-green-600 bg-green-100' : 'text-red-600 bg-red-100'
          }`}>
            {service.isActive ? 'Active' : 'Inactive'}
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow">
      <div className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-start space-x-4">
            <div 
              className="flex-shrink-0 w-12 h-12 rounded-lg flex items-center justify-center"
              style={{ backgroundColor: service.color + '20', color: service.color }}
            >
              <Building2 className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-1">
                {service.name}
              </h3>
              <p className="text-gray-600">{service.code}</p>
            </div>
          </div>
          <span className={`inline-flex px-3 py-1 text-sm font-medium rounded-full ${
            service.isActive ? 'text-green-600 bg-green-100' : 'text-red-600 bg-red-100'
          }`}>
            {service.isActive ? 'Active' : 'Inactive'}
          </span>
        </div>

        {service.description && (
          <p className="text-gray-600 mb-4">
            {service.description}
          </p>
        )}

        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="flex items-center space-x-2">
            <DollarSign className="w-4 h-4 text-gray-400" />
            <div>
              <p className="text-sm text-gray-500">Approval Threshold</p>
              <p className="font-medium text-gray-900">
                {formatCurrency(service.approvalThreshold || 0, service.defaultCurrency)}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Calendar className="w-4 h-4 text-gray-400" />
            <div>
              <p className="text-sm text-gray-500">Payment Terms</p>
              <p className="font-medium text-gray-900">{service.paymentTerms} days</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <p className="text-sm text-gray-500">Cost Center</p>
            <p className="font-medium text-gray-900">{service.costCenter}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Default Currency</p>
            <p className="font-medium text-gray-900">{service.defaultCurrency}</p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 mb-4">
          {service.canCreateInvoices && (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
              <CheckCircle className="w-3 h-3 mr-1" />
              Can Create Invoices
            </span>
          )}
          {service.canApproveInvoices && (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
              <Shield className="w-3 h-3 mr-1" />
              Can Approve Invoices
            </span>
          )}
          {service.requiresManagerApproval && (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
              <Shield className="w-3 h-3 mr-1" />
              Requires Manager Approval
            </span>
          )}
        </div>

        {showActions && (
          <div className="flex items-center justify-end space-x-2 pt-4 border-t border-gray-100">
            <button
              onClick={() => onSelect?.(service)}
              className="px-3 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
            >
              View Details
            </button>
            {onEdit && (
              <button
                onClick={() => onEdit(service)}
                className="px-3 py-2 text-sm font-medium text-blue-700 bg-blue-100 rounded-md hover:bg-blue-200 transition-colors"
              >
                Edit Service
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
