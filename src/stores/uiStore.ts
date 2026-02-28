import { create } from 'zustand';

interface UIState {
  violationDetailId: string | null;
  droneDetailId: string | null;
  detectionDetailId: string | null;
  patrolDetailId: string | null;
  telemetryPatrolId: string | null;
  isTabBarVisible: boolean;
  vehicleScanVisible: boolean;
  streamsModalVisible: boolean;
  targetStreamId: string | null;
  paymentModalVisible: boolean;
  paymentPlate: string | null;
  paymentViolationId: string | null;
  paymentAmount: number | null;
  vehicleRefreshTrigger: number;
  triggerVehicleRefresh: () => void;
  openViolationDetail: (id: string) => void;
  openDroneDetail: (id: string) => void;
  openDetectionDetail: (id: string) => void;
  openPatrolDetail: (id: string) => void;
  openTelemetry: (id: string) => void;
  openPayment: (plate: string, amount: number, violationId?: string) => void;
  setTabBarVisible: (visible: boolean) => void;
  setVehicleScanVisible: (visible: boolean) => void;
  setStreamsModalVisible: (visible: boolean, streamId?: string) => void;
  setPaymentModalVisible: (visible: boolean) => void;
  closeDetail: () => void;
  closeAll: () => void;
  history: Partial<UIState>[];
}

const getSnapshot = (state: UIState): Partial<UIState> => ({
  violationDetailId: state.violationDetailId,
  droneDetailId: state.droneDetailId,
  detectionDetailId: state.detectionDetailId,
  patrolDetailId: state.patrolDetailId,
  telemetryPatrolId: state.telemetryPatrolId,
  vehicleScanVisible: state.vehicleScanVisible,
  streamsModalVisible: state.streamsModalVisible,
  targetStreamId: state.targetStreamId,
  paymentModalVisible: state.paymentModalVisible,
  paymentPlate: state.paymentPlate,
  paymentViolationId: state.paymentViolationId,
  paymentAmount: state.paymentAmount,
  vehicleRefreshTrigger: state.vehicleRefreshTrigger,
});

const isAnyModalOpen = (state: UIState) =>
  !!(
    state.violationDetailId ||
    state.droneDetailId ||
    state.detectionDetailId ||
    state.patrolDetailId ||
    state.telemetryPatrolId ||
    state.vehicleScanVisible ||
    state.streamsModalVisible ||
    state.paymentModalVisible
  );

export const useUIStore = create<UIState>((set) => ({
  violationDetailId: null,
  droneDetailId: null,
  detectionDetailId: null,
  patrolDetailId: null,
  telemetryPatrolId: null,
  isTabBarVisible: true,
  vehicleScanVisible: false,
  streamsModalVisible: false,
  targetStreamId: null,
  history: [],
  paymentModalVisible: false,
  paymentPlate: null,
  paymentViolationId: null,
  paymentAmount: null,
  vehicleRefreshTrigger: 0,
  triggerVehicleRefresh: () =>
    set((state) => ({ vehicleRefreshTrigger: state.vehicleRefreshTrigger + 1 })),
  openViolationDetail: (id) =>
    set((state) => {
      const history = isAnyModalOpen(state)
        ? [...state.history, getSnapshot(state)]
        : state.history;
      return {
        ...state,
        history,
        violationDetailId: id,
        droneDetailId: null,
        detectionDetailId: null,
        patrolDetailId: null,
        telemetryPatrolId: null,
        vehicleScanVisible: false,
        paymentModalVisible: false,
      };
    }),
  openDroneDetail: (id) =>
    set((state) => {
      const history = isAnyModalOpen(state)
        ? [...state.history, getSnapshot(state)]
        : state.history;
      return {
        ...state,
        history,
        droneDetailId: id,
        violationDetailId: null,
        detectionDetailId: null,
        patrolDetailId: null,
        telemetryPatrolId: null,
        vehicleScanVisible: false,
        paymentModalVisible: false,
      };
    }),
  openDetectionDetail: (id) =>
    set((state) => {
      const history = isAnyModalOpen(state)
        ? [...state.history, getSnapshot(state)]
        : state.history;
      return {
        ...state,
        history,
        detectionDetailId: id,
        violationDetailId: null,
        patrolDetailId: null,
        telemetryPatrolId: null,
        vehicleScanVisible: false,
        paymentModalVisible: false,
      };
    }),
  openPatrolDetail: (id) =>
    set((state) => {
      const history = isAnyModalOpen(state)
        ? [...state.history, getSnapshot(state)]
        : state.history;
      return {
        ...state,
        history,
        patrolDetailId: id,
        violationDetailId: null,
        detectionDetailId: null,
        telemetryPatrolId: null,
        vehicleScanVisible: false,
        paymentModalVisible: false,
      };
    }),
  openTelemetry: (id) =>
    set((state) => {
      const history = isAnyModalOpen(state)
        ? [...state.history, getSnapshot(state)]
        : state.history;
      return {
        ...state,
        history,
        telemetryPatrolId: id,
        violationDetailId: null,
        detectionDetailId: null,
        patrolDetailId: null,
        vehicleScanVisible: false,
        paymentModalVisible: false,
      };
    }),
  openPayment: (plate, amount, violationId) =>
    set((state) => {
      const history = isAnyModalOpen(state)
        ? [...state.history, getSnapshot(state)]
        : state.history;
      return {
        ...state,
        history,
        paymentModalVisible: true,
        paymentPlate: plate,
        paymentAmount: amount,
        paymentViolationId: violationId || null,
      };
    }),
  setTabBarVisible: (visible) => set({ isTabBarVisible: visible }),
  setVehicleScanVisible: (visible) =>
    set((state) => {
      const history =
        visible && isAnyModalOpen(state) ? [...state.history, getSnapshot(state)] : state.history;
      return { ...state, history, vehicleScanVisible: visible };
    }),
  setStreamsModalVisible: (visible, streamId) =>
    set((state) => {
      const history =
        visible && isAnyModalOpen(state) ? [...state.history, getSnapshot(state)] : state.history;
      return { ...state, history, streamsModalVisible: visible, targetStreamId: streamId || null };
    }),
  setPaymentModalVisible: (visible) => set({ paymentModalVisible: visible }),
  closeDetail: () =>
    set((state) => {
      if (state.history.length > 0) {
        const previousState = state.history[state.history.length - 1];
        const newHistory = state.history.slice(0, -1);
        console.log('[UIStore] Popping modal history. Remaining stack:', newHistory.length);
        return {
          ...state,
          ...previousState,
          history: newHistory,
        };
      }
      return {
        ...state,
        violationDetailId: null,
        detectionDetailId: null,
        patrolDetailId: null,
        telemetryPatrolId: null,
        vehicleScanVisible: false,
        streamsModalVisible: false,
        targetStreamId: null,
        paymentModalVisible: false,
        paymentPlate: null,
        paymentViolationId: null,
        paymentAmount: null,
        history: [],
      };
    }),
  closeAll: () =>
    set({
      violationDetailId: null,
      droneDetailId: null,
      detectionDetailId: null,
      patrolDetailId: null,
      telemetryPatrolId: null,
      vehicleScanVisible: false,
      streamsModalVisible: false,
      targetStreamId: null,
      paymentModalVisible: false,
      paymentPlate: null,
      paymentViolationId: null,
      paymentAmount: null,
      history: [],
    }),
}));
