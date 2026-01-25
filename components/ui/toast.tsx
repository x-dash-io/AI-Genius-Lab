"use client";

import * as React from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Alert, AlertDescription } from "./alert";

export interface ToastProps {
  id: string;
  title?: string;
  description?: string;
  variant?: "default" | "destructive" | "success" | "warning";
  duration?: number;
  onClose?: () => void;
}

export function Toast({
  id,
  title,
  description,
  variant = "default",
  duration = 5000,
  onClose,
}: ToastProps) {
  const [isVisible, setIsVisible] = React.useState(true);

  React.useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => {
        setIsVisible(false);
        setTimeout(() => onClose?.(), 300); // Wait for animation
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [duration, onClose]);

  if (!isVisible) return null;

  const variantStyles = {
    default: "bg-blue-600 dark:bg-blue-950 text-white border-blue-500 dark:border-blue-800",
    destructive: "bg-red-600 dark:bg-red-950 text-white border-red-500 dark:border-red-800",
    success: "bg-green-600 dark:bg-green-950 text-white border-green-500 dark:border-green-800",
    warning: "bg-yellow-600 dark:bg-yellow-950 text-white border-yellow-500 dark:border-yellow-800",
  };

  return (
    <Alert
      variant={variant}
      className={cn(
        "min-w-[300px] shadow-lg",
        variantStyles[variant || "default"],
        isVisible ? "animate-in slide-in-from-top-5" : "animate-out slide-out-to-top-5"
      )}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          {title && <div className="font-semibold mb-1 text-white">{title}</div>}
          {description && <AlertDescription className="text-white/90">{description}</AlertDescription>}
        </div>
        <button
          onClick={() => {
            setIsVisible(false);
            setTimeout(() => onClose?.(), 300);
          }}
          className="ml-4 text-white/70 hover:text-white"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </Alert>
  );
}

export function ToastContainer({ toasts }: { toasts: ToastProps[] }) {
  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col gap-2 max-w-md">
      {toasts.map((toast) => (
        <Toast key={toast.id} {...toast} />
      ))}
    </div>
  );
}
