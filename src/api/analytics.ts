import api from './client';
import { endpoints } from '@/constants/config';
import type { DashboardStats, OfficerStats } from '@/types/api';

export const analyticsApi = {
  /**
   * Get dashboard statistics
   */
  async getDashboard(): Promise<DashboardStats> {
    const response = await api.get<DashboardStats>(endpoints.DASHBOARD_SUMMARY);
    return response.data;
  },

  /**
   * Get current officer statistics
   */
  async getMyStats(): Promise<OfficerStats> {
    const response = await api.get<OfficerStats>(endpoints.OFFICER_STATS);
    return response.data;
  },
};
