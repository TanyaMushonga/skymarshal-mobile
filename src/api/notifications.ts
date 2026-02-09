import api from './client';
import { endpoints } from '@/constants/config';
import type { Notification, PaginatedResponse } from '@/types/api';

export interface NotificationFilters {
  is_read?: boolean;
  type?: string;
  limit?: number;
  offset?: number;
}

export const notificationsApi = {
  /**
   * Get list of notifications
   */
  async list(filters?: NotificationFilters): Promise<PaginatedResponse<Notification>> {
    const response = await api.get<PaginatedResponse<Notification>>(endpoints.NOTIFICATIONS, {
      params: filters,
    });
    return response.data;
  },

  /**
   * Get single notification by ID
   */
  async get(id: string): Promise<Notification> {
    const response = await api.get<Notification>(`${endpoints.NOTIFICATIONS}${id}/`);
    return response.data;
  },

  /**
   * Mark single notification as read
   */
  async markRead(id: string): Promise<Notification> {
    const response = await api.post<Notification>(endpoints.NOTIFICATION_MARK_READ(id));
    return response.data;
  },

  /**
   * Mark all notifications as read
   */
  async markAllRead(): Promise<{ message: string }> {
    const response = await api.post(endpoints.NOTIFICATIONS_MARK_ALL_READ);
    return response.data;
  },

  /**
   * Delete single notification
   */
  async delete(id: string): Promise<void> {
    await api.delete(`${endpoints.NOTIFICATIONS}${id}/`);
  },

  /**
   * Bulk delete notifications
   */
  async bulkDelete(ids: string[]): Promise<void> {
    await api.post(endpoints.NOTIFICATIONS_BULK_DELETE, { ids });
  },

  /**
   * Get unread count
   */
  async getUnreadCount(): Promise<number> {
    const response = await api.get<PaginatedResponse<Notification>>(endpoints.NOTIFICATIONS, {
      params: { is_read: false, limit: 1 },
    });
    return response.data.count;
  },
};
