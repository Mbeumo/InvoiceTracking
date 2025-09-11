import { User } from '../types/DatabaseModels';

export const mockUsers: User[] = [
  {
    id: 'user-1',
    employeeId: 'EMP001',
    name: 'Alice Johnson',
    email: 'alice.johnson@company.com',
    phone: '+1-555-1001',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alice',
    serviceId: 'accounting',
    role: 'admin',
    managerId: 'user-1',
    location: 'New York Office',
    timezone: 'America/New_York',
    isActive: true,
    emailVerified: true,
    requirePasswordChange: false,
    lastLogin: '2024-01-26T09:30:00Z',
    failedLoginAttempts: 0,
    createdAt: '2023-01-01T10:00:00Z',
    updatedAt: '2024-01-26T09:30:00Z',
    passwordHash: 'password',
    permissions: ['create_invoice', 'edit_invoice', 'delete_invoice',],
    notes: 'System administrator with full access'
  },
  {
    id: 'user-2',
    employeeId: 'EMP002',
    name: 'Bob Smith',
    email: 'bob.smith@company.com',
    phone: '+1-555-1002',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Bob',
    serviceId: 'finance',
    role: 'manager',
    managerId: 'user-1',
    location: 'San Francisco Office',
    timezone: 'America/Los_Angeles',
    isActive: true,
    emailVerified: true,
    passwordHash: 'password',
    permissions: ['create_invoice', 'delete_invoice', 'view_all_invoices', 'manage_users', 'export_data'],
    lastLogin: '2024-01-25T14:15:00Z',
    requirePasswordChange: false,
    failedLoginAttempts: 0,
    createdAt: '2023-01-15T11:30:00Z',
    updatedAt: '2024-01-25T14:15:00Z',
    notes: 'Finance manager responsible for approvals'
  },
  {
    id: 'user-3',
    employeeId: 'EMP003',
    name: 'Carol Davis',
    email: 'carol.davis@company.com',
    phone: '+1-555-1003',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Carol',
    serviceId: 'purchasing',
    role: 'employee',
    managerId: 'user-2',
    location: 'Chicago Office',
    timezone: 'America/Chicago',
    isActive: true,
    emailVerified: true,
    requirePasswordChange: false,
    lastLogin: '2024-01-26T08:45:00Z',
    failedLoginAttempts: 0,
    createdAt: '2023-02-01T09:00:00Z',
    updatedAt: '2024-01-26T08:45:00Z',
    permissions: ['create_invoice', 'export_data'],
    passwordHash: 'password',
    notes: 'Purchasing specialist handling vendor invoices'
  }
];

export const mockUserPermissions = [
  // Admin permissions
  { userId: 'user-1', permissions: 'create_invoice' },
  { userId: 'user-1', permissions: 'edit_invoice' },
  { userId: 'user-1', permissions: 'delete_invoice' },
  { userId: 'user-1', permissions: 'view_all_invoices' },
  { userId: 'user-1', permissions: 'manage_users' },
  { userId: 'user-1', permissions: 'view_reports' },
  { userId: 'user-1', permissions: 'view_analytics' },
  { userId: 'user-1', permission: 'export_data' },
  
  // Manager permissions
  { userId: 'user-2', permission: 'create_invoice' },
  { userId: 'user-2', permission: 'edit_invoice' },
  { userId: 'user-2', permission: 'view_all_invoices' },
  { userId: 'user-2', permission: 'view_reports' },
  { userId: 'user-2', permission: 'view_analytics' },
  
  // Employee permissions
  { userId: 'user-3', permission: 'create_invoice' },
  { userId: 'user-3', permission: 'view_invoices' },
];
