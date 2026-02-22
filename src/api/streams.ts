import api from './client';
import { endpoints } from '@/constants/config';

export interface Stream {
  id: string; // UUID
  stream_id: string;
  drone_id: string;
  drone_name: string;
  rtsp_url: string;
  is_active: boolean;
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
};
