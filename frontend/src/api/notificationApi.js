import { apiClient, unwrap } from './client';

export const notificationApi = {
  getNotifications: () => unwrap(apiClient.get('/api/notifications')),
  getUnreadCount: () => unwrap(apiClient.get('/api/notifications/unread-count')),
  markAsRead: (id) => unwrap(apiClient.put(`/api/notifications/${id}/read`)),
  markAllAsRead: () => unwrap(apiClient.put('/api/notifications/read-all')),
};
