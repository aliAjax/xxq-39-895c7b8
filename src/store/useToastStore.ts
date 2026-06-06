import { create } from 'zustand';

export type ToastType = 'success' | 'error' | 'info';

export interface Toast {
  id: string;
  type: ToastType;
  message: string;
  duration: number;
}

interface ToastStoreState {
  toasts: Toast[];

  showToast: (type: ToastType, message: string, duration?: number) => string;
  hideToast: (id: string) => void;
  clearAll: () => void;
}

let toastIdCounter = 0;

export const useToastStore = create<ToastStoreState>((set, get) => ({
  toasts: [],

  showToast: (type, message, duration = 3000) => {
    const id = `toast-${Date.now()}-${toastIdCounter++}`;
    const toast: Toast = { id, type, message, duration };

    set((state) => ({ toasts: [...state.toasts, toast] }));

    if (duration > 0) {
      setTimeout(() => {
        const currentToasts = get().toasts;
        if (currentToasts.some((t) => t.id === id)) {
          set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) }));
        }
      }, duration);
    }

    return id;
  },

  hideToast: (id) => {
    set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) }));
  },

  clearAll: () => {
    set({ toasts: [] });
  },
}));
