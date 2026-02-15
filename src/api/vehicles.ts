import api from './client';
import type { VehicleLookupResponse } from '@/types/api';

export const vehiclesApi = {
  /**
   * Lookup vehicle details by plate number (Manual entry)
   */
  lookupByPlate: async (plate: string): Promise<VehicleLookupResponse> => {
    const response = await api.get<VehicleLookupResponse>(`/api/vehicles/lookup/`, {
      params: { plate },
    });
    return response.data;
  },

  /**
   * Lookup vehicle details by scanning a photo (ALPR)
   */
  lookupByImage: async (imageUri: string): Promise<VehicleLookupResponse> => {
    const formData = new FormData();

    // @ts-ignore - FormData expects specific structure in RN for files
    formData.append('image', {
      uri: imageUri,
      type: 'image/jpeg',
      name: 'plate_photo.jpg',
    });

    const response = await api.post<VehicleLookupResponse>(`/api/vehicles/lookup/`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },
};
