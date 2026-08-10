import { createContext, useCallback, useContext, useRef, useState } from 'react';
import type { ReactNode } from 'react';

interface ToastState {
  message: string;
  icon: string;
  visible: boolean;
}

interface ToastContextValue {
  toast: ToastState;
  showToast: (message: string, icon?: string) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toast, setToast] = useState<ToastState>({
    message: '',
    icon: 'fa-circle-check text-emerald-400',
    visible: false,
  });
  const timeoutRef = useRef<number | null>(null);

  const showToast = useCallback((message: string, icon = 'fa-circle-check text-emerald-400') => {
    if (timeoutRef.current) window.clearTimeout(timeoutRef.current);
    setToast({ message, icon, visible: true });
    timeoutRef.current = window.setTimeout(() => {
      setToast((t) => ({ ...t, visible: false }));
    }, 2200);
  }, []);

  return (
    <ToastContext.Provider value={{ toast, showToast }}>
      {children}
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within a ToastProvider');
  return ctx;
}
