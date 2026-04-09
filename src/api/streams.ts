import api from './client';
import { endpoints } from '@/constants/config';

export interface Stream {
  id: string; // UUID
  stream_id: string;
  drone_id: string;
  drone_name: string;
  is_active: boolean;
  stream_mode: 'LIVE' | 'SIMULATED';
  resolution: string;
  frame_rate: number;
}

export const streamsApi = {
  /**
   * Get list of active streams
   */
  getStreams: async (isActive = true): Promise<Stream[]> => {
    const response = await api.get<any>(endpoints.STREAMS, {
      params: { is_active: isActive },
    });
    return response.data.results || response.data;
  },

  /**
   * Start stream processing (analytics)
   */
  startStream: async (id: string): Promise<void> => {
    await api.post(endpoints.STREAM_START(id));
  },

  /**
   * Stop stream processing (analytics)
   */
  stopStream: async (id: string): Promise<void> => {
    await api.post(endpoints.STREAM_STOP(id));
  },
  /**
   * Simulate a stream for an existing stream object
   */
  simulateStream: async (id: string, patrolId?: string): Promise<void> => {
    await api.post(endpoints.STREAM_SIMULATE(id), { patrol_id: patrolId });
  },

  /**
   * Simulate a stream for a specific drone ID (creates stream if needed)
   */
  simulateForDrone: async (droneId: string, patrolId?: string): Promise<void> => {
    await api.post(endpoints.STREAM_SIMULATE_FOR_DRONE, {
      drone_id: droneId,
      patrol_id: patrolId,
    });
  },

  /**
   * Switch to live feed mode
   */
  switchToLive: async (id: string | number): Promise<void> => {
    await api.post(endpoints.STREAM_LIVE_FEED(id));
  },
};
