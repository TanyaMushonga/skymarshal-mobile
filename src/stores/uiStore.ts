import { create } from 'zustand';

interface UIState {
  violationDetailId: string | null;
  detectionDetailId: string | null;
  patrolDetailId: string | null;
  telemetryPatrolId: string | null;
  isTabBarVisible: boolean;
  vehicleScanVisible: boolean;
  paymentModalVisible: boolean;
  paymentPlate: string | null;
  paymentViolationId: string | null;
  paymentAmount: number | null;
  openViolationDetail: (id: string) => void;
  openDetectionDetail: (id: string) => void;
  openPatrolDetail: (id: string) => void;
  openTelemetry: (id: string) => void;
  openPayment: (plate: string, amount: number, violationId?: string) => void;
  setTabBarVisible: (visible: boolean) => void;
  setVehicleScanVisible: (visible: boolean) => void;
  setPaymentModalVisible: (visible: boolean) => void;
  closeDetail: () => void;
  closeAll: () => void;
  history: Partial<UIState>[];
}

const getSnapshot = (state: UIState): Partial<UIState> => ({
  violationDetailId: state.violationDetailId,
  detectionDetailId: state.detectionDetailId,
  patrolDetailId: state.patrolDetailId,
  telemetryPatrolId: state.telemetryPatrolId,
  vehicleScanVisible: state.vehicleScanVisible,
  paymentModalVisible: state.paymentModalVisible,
  paymentPlate: state.paymentPlate,
  paymentViolationId: state.paymentViolationId,
  paymentAmount: state.paymentAmount,
});

const isAnyModalOpen = (state: UIState) =>
  !!(
    state.violationDetailId ||
    state.detectionDetailId ||
    state.patrolDetailId ||
    state.telemetryPatrolId ||
    state.vehicleScanVisible ||
    state.paymentModalVisible
  );

export const useUIStore = create<UIState>((set) => ({
  violationDetailId: null,
  detectionDetailId: null,
  patrolDetailId: null,
  telemetryPatrolId: null,
  isTabBarVisible: true,
  vehicleScanVisible: false,
  history: [],
  paymentModalVisible: false,
  paymentPlate: null,
  paymentViolationId: null,
  paymentAmount: null,
  openViolationDetail: (id) =>
    set((state) => {
      const history = isAnyModalOpen(state)
        ? [...state.history, getSnapshot(state)]
        : state.history;
      return {
        ...state,
        history,
        violationDetailId: id,
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
      // If opening, push history. If closing explicitly via this setter, behavior is ambiguous,
      // but usually setters are used for opening. For closing, closeDetail is preferred.
      // We will assume this is mostly used for opening or simple toggles.
      // To be safe, if visible=true and something is open, push.
      const history =
        visible && isAnyModalOpen(state) ? [...state.history, getSnapshot(state)] : state.history;
      return { ...state, history, vehicleScanVisible: visible };
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
      detectionDetailId: null,
      patrolDetailId: null,
      telemetryPatrolId: null,
      vehicleScanVisible: false,
      paymentModalVisible: false,
      paymentPlate: null,
      paymentViolationId: null,
      paymentAmount: null,
      history: [],
    }),
}));
