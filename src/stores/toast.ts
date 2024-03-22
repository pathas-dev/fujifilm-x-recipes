import { create } from 'zustand';

export const toastType = {
  error: 'Error',
  success: 'Success',
} as const;

type ToastMessage = {
  message: string;
  type: (typeof toastType)[keyof typeof toastType];
};

type ToastStore = {
  toast: ToastMessage;
  setMessage: (newToastMessage: Partial<ToastMessage>) => void;
  clear: () => void;
};

const defaultToastMessage: ToastMessage = {
  message: '',
  type: 'Success',
};

const useToastStore = create<ToastStore>((set) => ({
  toast: { message: '', type: 'Success' },
  setMessage: (newToastMessage = { message: '', type: 'Success' }) =>
    set((state) => ({ toast: { ...state.toast, ...newToastMessage } })),
  clear: () => set(() => ({ toast: defaultToastMessage })),
}));

export default useToastStore;
