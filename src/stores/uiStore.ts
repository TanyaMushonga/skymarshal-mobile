import { create } from 'zustand';

interface UIState {
  violationDetailId: string | null;
  detectionDetailId: string | null;
  openViolationDetail: (id: string) => void;
  openDetectionDetail: (id: string) => void;
  closeDetail: () => void;
}

export const useUIStore = create<UIState>((set) => ({
  violationDetailId: null,
  detectionDetailId: null,
  openViolationDetail: (id) => set({ violationDetailId: id, detectionDetailId: null }),
  openDetectionDetail: (id) => set({ detectionDetailId: id, violationDetailId: null }),
  closeDetail: () => set({ violationDetailId: null, detectionDetailId: null }),
}));
