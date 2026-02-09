import api from './client';
import { endpoints } from '@/constants/config';
import type { Violation, PaginatedResponse } from '@/types/api';

export interface ViolationFilters {
  patrol?: string;
  status?: 'NEW' | 'REVIEWED' | 'CONFIRMED' | 'DISMISSED';
  today?: boolean;
  limit?: number;
  offset?: number;
}

export const violationsApi = {
  /**
   * Get list of violations
   */
  async list(filters?: ViolationFilters): Promise<PaginatedResponse<Violation>> {
    const response = await api.get<PaginatedResponse<Violation>>(endpoints.VIOLATIONS, {
      params: filters,
    });
    return response.data;
  },

  /**
   * Get single violation by ID
   */
  async get(id: string): Promise<Violation> {
    const response = await api.get<Violation>(`${endpoints.VIOLATIONS}${id}/`);
    return response.data;
  },
};
