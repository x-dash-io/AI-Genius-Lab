"use client";

// Simple toast notification system
// For production, consider using react-hot-toast or sonner

let toastIdCounter = 0;
let toastListeners: Array<(toasts: Toast[]) => void> = [];
let toasts: Toast[] = [];

export interface Toast {
  id: string;
  title?: string;
  description?: string;
  variant?: "default" | "destructive" | "success" | "warning";
  duration?: number;
}

function notifyListeners() {
  toastListeners.forEach((listener) => listener([...toasts]));
}

export function toast(toastData: Omit<Toast, "id">) {
  const id = `toast-${++toastIdCounter}`;
  const newToast: Toast = { ...toastData, id };
  
  toasts.push(newToast);
  notifyListeners();

  // Auto remove after duration
  const duration = toastData.duration ?? 5000;
  if (duration > 0) {
    setTimeout(() => {
      dismiss(id);
    }, duration);
  }

  return id;
}

export function dismiss(id: string) {
  toasts = toasts.filter((t) => t.id !== id);
  notifyListeners();
}

export function subscribe(listener: (toasts: Toast[]) => void) {
  toastListeners.push(listener);
  return () => {
    toastListeners = toastListeners.filter((l) => l !== listener);
  };
}

export function getToasts() {
  return [...toasts];
}
