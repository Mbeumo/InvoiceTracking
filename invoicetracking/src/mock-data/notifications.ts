export const mockNotifications = [
  {
    id: 'notif-1',
    userId: 'user-1',
    type: 'warning',
    title: 'High Risk Invoice Detected',
    message: 'Invoice INV-2024-001 from TechCorp Solutions has been flagged with high fraud risk',
    relatedEntityType: 'invoice',
    relatedEntityId: '1',
    actionUrl: '/invoices/1',
    isRead: false,
    isArchived: false,
    priority: 'high',
    createdAt: '2024-01-26T10:30:00Z'
  },
  {
    id: 'notif-2',
    userId: 'user-2',
    type: 'info',
    title: 'Invoice Approved',
    message: 'Invoice INV-2024-002 has been approved and is ready for payment',
    relatedEntityType: 'invoice',
    relatedEntityId: '2',
    actionUrl: '/invoices/2',
    isRead: true,
    isArchived: false,
    priority: 'medium',
    createdAt: '2024-01-25T14:20:00Z',
    readAt: '2024-01-25T15:00:00Z'
  },
  {
    id: 'notif-3',
    userId: 'user-3',
    type: 'reminder',
    title: 'Invoice Due Soon',
    message: 'Invoice INV-2024-003 is due for payment in 3 days',
    relatedEntityType: 'invoice',
    relatedEntityId: '3',
    actionUrl: '/invoices/3',
    isRead: false,
    isArchived: false,
    priority: 'medium',
    expiresAt: '2024-02-28T23:59:59Z',
    createdAt: '2024-01-24T09:00:00Z'
  }
];
