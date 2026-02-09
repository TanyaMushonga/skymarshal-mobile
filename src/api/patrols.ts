import api from './client';
import { endpoints } from '@/constants/config';
import type { Patrol, StartPatrolRequest, PaginatedResponse } from '@/types/api';

export interface PatrolFilters {
  status?: 'ACTIVE' | 'COMPLETED' | 'CANCELLED';
  officer__email?: string;
  limit?: number;
  offset?: number;
}

export const patrolsApi = {
  /**
   * Get list of patrols
   */
  async list(filters?: PatrolFilters): Promise<PaginatedResponse<Patrol>> {
    const response = await api.get<PaginatedResponse<Patrol>>(endpoints.PATROLS, {
      params: filters,
    });
    return response.data;
  },

  /**
   * Get single patrol by ID
   */
  async get(id: string): Promise<Patrol> {
    const response = await api.get<Patrol>(`${endpoints.PATROLS}${id}/`);
    return response.data;
  },

  /**
   * Get active patrol for current officer
   */
  async getActive(officerEmail: string): Promise<Patrol | null> {
    const response = await api.get<PaginatedResponse<Patrol>>(endpoints.PATROLS, {
      params: {
        status: 'ACTIVE',
        officer__email: officerEmail,
        limit: 1,
      },
    });
    return response.data.results[0] || null;
  },

  /**
   * Start a new patrol
   */
  async start(data: StartPatrolRequest): Promise<Patrol> {
    const response = await api.post<Patrol>(endpoints.PATROL_START, data);
    return response.data;
  },

  /**
   * End an active patrol
   */
  async end(id: string, notes?: string): Promise<Patrol> {
    const response = await api.post<Patrol>(endpoints.PATROL_END(id), { notes });
    return response.data;
  },
};
