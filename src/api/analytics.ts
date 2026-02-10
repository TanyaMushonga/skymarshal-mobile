import api from './client';
import { endpoints } from '@/constants/config';
import type { DashboardStats } from '@/types/api';

export const analyticsApi = {
  /**
   * Get dashboard statistics
   */
  async getDashboard(): Promise<DashboardStats> {
    const response = await api.get<DashboardStats>(endpoints.ADMIN_DASHBOARD);
    return response.data;
  },
};
