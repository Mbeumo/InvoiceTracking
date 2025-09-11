import React from 'react';
import { Invoice } from '../types/DatabaseModels';
import { Calendar, DollarSign, User, AlertCircle, CheckCircle, Clock } from 'lucide-react';

interface InvoiceWidgetProps {
  invoice: Invoice;
  onSelect?: (invoice: Invoice) => void;
  onEdit?: (invoice: Invoice) => void;
  onApprove?: (invoice: Invoice) => void;
  showActions?: boolean;
  compact?: boolean;
}

export const InvoiceWidget: React.FC<InvoiceWidgetProps> = ({
  invoice,
  onSelect,
  onEdit,
  onApprove,
  showActions = true,
  compact = false
}) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return 'text-green-600 bg-green-100';
      case 'approved': return 'text-blue-600 bg-blue-100';
      case 'pending_approval': return 'text-yellow-600 bg-yellow-100';
      case 'rejected': return 'text-red-600 bg-red-100';
      case 'overdue': return 'text-red-700 bg-red-200';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'text-red-700';
      case 'high': return 'text-red-600';
      case 'medium': return 'text-yellow-600';
      case 'low': return 'text-green-600';
      default: return 'text-gray-600';
    }
  };

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency
    }).format(amount);
  };

  const isOverdue = new Date(invoice.dueDate) < new Date() && invoice.status !== 'paid';

  if (compact) {
    return (
      <div 
        className="flex items-center justify-between p-3 bg-white border rounded-lg hover:shadow-md transition-shadow cursor-pointer"
        onClick={() => onSelect?.(invoice)}
      >
        <div className="flex items-center space-x-3">
          <div className="flex-shrink-0">
            {invoice.status === 'paid' ? (
              <CheckCircle className="w-5 h-5 text-green-600" />
            ) : isOverdue ? (
              <AlertCircle className="w-5 h-5 text-red-600" />
            ) : (
              <Clock className="w-5 h-5 text-yellow-600" />
            )}
          </div>
          <div>
            <p className="font-medium text-gray-900">{invoice.number}</p>
            <p className="text-sm text-gray-500">{invoice.vendorName}</p>
          </div>
        </div>
        <div className="text-right">
          <p className="font-medium text-gray-900">
            {formatCurrency(invoice.totalAmount, invoice.currency)}
          </p>
          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(invoice.status)}`}>
            {invoice.status.replace('_', ' ')}
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
              {invoice.number}
            </h3>
            <p className="text-gray-600">{invoice.vendorName}</p>
          </div>
          <div className="flex items-center space-x-2">
            <span className={`inline-flex px-3 py-1 text-sm font-medium rounded-full ${getStatusColor(invoice.status)}`}>
              {invoice.status.replace('_', ' ')}
            </span>
            <span className={`text-sm font-medium ${getPriorityColor(invoice.priority || 'medium')}`}>
              {invoice.priority || 'medium'}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="flex items-center space-x-2">
            <DollarSign className="w-4 h-4 text-gray-400" />
            <div>
              <p className="text-sm text-gray-500">Amount</p>
              <p className="font-medium text-gray-900">
                {formatCurrency(invoice.totalAmount, invoice.currency)}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Calendar className="w-4 h-4 text-gray-400" />
            <div>
              <p className="text-sm text-gray-500">Due Date</p>
              <p className={`font-medium ${isOverdue ? 'text-red-600' : 'text-gray-900'}`}>
                {new Date(invoice.dueDate).toLocaleDateString()}
              </p>
            </div>
          </div>
        </div>

        {invoice.assignedTo && (
          <div className="flex items-center space-x-2 mb-4">
            <User className="w-4 h-4 text-gray-400" />
            <div>
              <p className="text-sm text-gray-500">Assigned to</p>
              <p className="font-medium text-gray-900">{invoice.assignedTo}</p>
            </div>
          </div>
        )}

        {invoice.description && (
          <p className="text-sm text-gray-600 mb-4 line-clamp-2">
            {invoice.description}
          </p>
        )}

        {showActions && (
          <div className="flex items-center justify-end space-x-2 pt-4 border-t border-gray-100">
            <button
              onClick={() => onSelect?.(invoice)}
              className="px-3 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
            >
              View Details
            </button>
            {onEdit && (
              <button
                onClick={() => onEdit(invoice)}
                className="px-3 py-2 text-sm font-medium text-blue-700 bg-blue-100 rounded-md hover:bg-blue-200 transition-colors"
              >
                Edit
              </button>
            )}
            {onApprove && invoice.status === 'pending_approval' && (
              <button
                onClick={() => onApprove(invoice)}
                className="px-3 py-2 text-sm font-medium text-green-700 bg-green-100 rounded-md hover:bg-green-200 transition-colors"
              >
                Approve
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
