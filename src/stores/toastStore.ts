import { create } from 'zustand';
import { ToastType, ToastMessage } from '@/components/common/Toast';

interface ToastState {
  toasts: ToastMessage[];
  showToast: (type: ToastType, heading: string, message: string) => void;
  hideToast: (id: string) => void;
  isVisible: boolean;
}

export const useToastStore = create<ToastState>((set) => ({
  toasts: [],
  isVisible: false,
  showToast: (type, heading, message) => {
    const id = Math.random().toString(36).substring(2, 9);
    set((state) => ({
      toasts: [...state.toasts, { id, type, heading, message }],
      isVisible: true,
    }));
  },
  hideToast: (id) => {
    set((state) => {
      const remainingToasts = state.toasts.filter((toast) => toast.id !== id);
      return {
        toasts: remainingToasts,
        isVisible: remainingToasts.length > 0,
      };
    });
  },
}));
