import { NotificationService } from '../services/apiService';

export const fetchNotifications = async (params?: { page?: number; pageSize?: number }) => {
    return await NotificationService.getNotifications(params);
};

export const markNotification = async (id: string, payload: { isRead?: boolean; isArchived?: boolean }) => {
    if (payload.isRead) {
        return await NotificationService.markAsRead(id);
    }
    // TODO: Add archive functionality to NotificationService
    throw new Error('Archive functionality not yet implemented in API service');
};


