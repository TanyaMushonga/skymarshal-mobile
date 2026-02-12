import { useToastStore } from '@/stores/toastStore';

export const useToast = () => {
  const { toasts, showToast, hideToast, isVisible } = useToastStore();

  return {
    toasts,
    showToast,
    hideToast,
    isVisible,
  };
};
