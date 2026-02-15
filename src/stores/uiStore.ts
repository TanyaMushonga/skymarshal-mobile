import { create } from 'zustand';

interface UIState {
  violationDetailId: string | null;
  detectionDetailId: string | null;
  patrolDetailId: string | null;
  telemetryPatrolId: string | null;
  isTabBarVisible: boolean;
  openViolationDetail: (id: string) => void;
  openDetectionDetail: (id: string) => void;
  openPatrolDetail: (id: string) => void;
  openTelemetry: (id: string) => void;
  setTabBarVisible: (visible: boolean) => void;
  closeDetail: () => void;
}

export const useUIStore = create<UIState>((set) => ({
  violationDetailId: null,
  detectionDetailId: null,
  patrolDetailId: null,
  telemetryPatrolId: null,
  isTabBarVisible: true,
  openViolationDetail: (id) =>
    set({
      violationDetailId: id,
      detectionDetailId: null,
      patrolDetailId: null,
      telemetryPatrolId: null,
    }),
  openDetectionDetail: (id) =>
    set({
      detectionDetailId: id,
      violationDetailId: null,
      patrolDetailId: null,
      telemetryPatrolId: null,
    }),
  openPatrolDetail: (id) =>
    set({
      patrolDetailId: id,
      violationDetailId: null,
      detectionDetailId: null,
      telemetryPatrolId: null,
    }),
  openTelemetry: (id) =>
    set({
      telemetryPatrolId: id,
      violationDetailId: null,
      detectionDetailId: null,
      patrolDetailId: null,
    }),
  setTabBarVisible: (visible) => set({ isTabBarVisible: visible }),
  closeDetail: () =>
    set({
      violationDetailId: null,
      detectionDetailId: null,
      patrolDetailId: null,
      telemetryPatrolId: null,
    }),
}));
