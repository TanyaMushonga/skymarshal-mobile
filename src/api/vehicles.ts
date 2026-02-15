import api from './client';
import { endpoints } from '@/constants/config';
import type { VehicleLookupResponse } from '@/types/api';

export const vehiclesApi = {
  /**
   * Lookup vehicle details by plate number (Manual entry)
   */
  lookupByPlate: async (plate: string): Promise<VehicleLookupResponse> => {
    const response = await api.get<VehicleLookupResponse>(endpoints.VEHICLE_LOOKUP, {
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

    const response = await api.post<VehicleLookupResponse>(endpoints.VEHICLE_LOOKUP, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  /**
   * Clear all outstanding fines for a vehicle
   */
  clearFines: async (plate: string): Promise<{ message: string }> => {
    const response = await api.post<{ message: string }>(endpoints.CLEAR_FINES, { plate });
    return response.data;
  },

  /**
   * Record a payment for a vehicle or specific violation
   */
  recordPayment: async (data: {
    plate: string;
    amount: number;
    currency: 'USD' | 'ZIG';
    method: 'CASH' | 'WIRE_TRANSFER';
    violation_id?: string;
  }): Promise<{ message: string; summary: any }> => {
    const response = await api.post<{ message: string; summary: any }>(
      endpoints.RECORD_PAYMENT,
      data
    );
    return response.data;
  },
};
