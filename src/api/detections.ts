import api from './client';
import { endpoints } from '@/constants/config';
import type { Detection, PaginatedResponse } from '@/types/api';

export interface DetectionFilters {
  patrol?: string;
  limit?: number;
  offset?: number;
}

export const detectionsApi = {
  /**
   * Get list of detections
   */
  async list(filters?: DetectionFilters): Promise<PaginatedResponse<Detection>> {
    const response = await api.get<PaginatedResponse<Detection>>(endpoints.DETECTIONS, {
      params: filters,
    });
    return response.data;
  },

  /**
   * Get single detection by ID
   */
  async get(id: string): Promise<Detection> {
    const response = await api.get<Detection>(`${endpoints.DETECTIONS}${id}/`);
    return response.data;
  },
};
