import api from './client';
import { endpoints } from '@/constants/config';
import type { Drone, DroneGPS, PaginatedResponse } from '@/types/api';

export interface DroneFilters {
  status?: 'online' | 'offline' | 'maintenance' | 'in_use';
  limit?: number;
  offset?: number;
}

export const dronesApi = {
  /**
   * Get list of drones
   */
  async list(filters?: DroneFilters): Promise<PaginatedResponse<Drone>> {
    const response = await api.get<PaginatedResponse<Drone>>(endpoints.DRONES, {
      params: filters,
    });
    return response.data;
  },

  /**
   * Get available drones (online and not in use)
   */
  async getAvailable(): Promise<Drone[]> {
    const response = await api.get<PaginatedResponse<Drone>>(endpoints.DRONES);
    // Double filter to ensure data integrity
    return response.data.results;
  },

  /**
   * Get single drone by ID
   */
  async get(id: string): Promise<Drone> {
    const response = await api.get<Drone>(`${endpoints.DRONES}${id}/`);
    return response.data;
  },

  /**
   * Get GPS locations for a drone
   */
  async getGPS(id: string, limit = 100): Promise<DroneGPS[]> {
    const response = await api.get<DroneGPS[]>(endpoints.DRONE_HISTORY(id), {
      params: { limit },
    });
    return response.data;
  },
};
