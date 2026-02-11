"use client";

import * as React from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

export type ToastActionElement = React.ReactElement;

export interface ToastProps {
  id: string;
  title?: React.ReactNode;
  description?: React.ReactNode;
  action?: ToastActionElement;
  variant?: "default" | "destructive" | "success" | "warning";
  duration?: number;
  onClose?: () => void;
}

const toastVariants: Record<NonNullable<ToastProps["variant"]>, string> = {
  default: "border-border bg-card text-card-foreground",
  destructive: "border-destructive/40 bg-destructive text-destructive-foreground",
  success: "border-success/35 bg-success text-success-foreground",
  warning: "border-warning/40 bg-warning text-warning-foreground",
};

export function Toast({
  title,
  description,
  action,
  variant = "default",
  duration = 5000,
  onClose,
}: ToastProps) {
  const [isVisible, setIsVisible] = React.useState(true);

  React.useEffect(() => {
    if (duration <= 0) {
      return;
    }

    const timeout = window.setTimeout(() => {
      setIsVisible(false);
      window.setTimeout(() => onClose?.(), 180);
    }, duration);

    return () => window.clearTimeout(timeout);
  }, [duration, onClose]);

  if (!isVisible) {
    return null;
  }

  return (
    <div
      role="status"
      className={cn(
        "ui-surface min-w-72 max-w-md rounded-[var(--radius-md)] border p-4 shadow-lg animate-in fade-in-0 slide-in-from-top-2",
        toastVariants[variant]
      )}
    >
      <div className="flex items-start gap-3">
        <div className="flex-1 space-y-1">
          {title ? <div className="text-sm font-semibold">{title}</div> : null}
          {description ? <div className="text-sm opacity-90">{description}</div> : null}
          {action ? <div className="pt-1">{action}</div> : null}
        </div>

        <button
          type="button"
          onClick={() => {
            setIsVisible(false);
            window.setTimeout(() => onClose?.(), 180);
          }}
          className="rounded-md p-1 opacity-70 hover:opacity-100"
          aria-label="Close notification"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

export function ToastContainer({ toasts }: { toasts: ToastProps[] }) {
  return (
    <div className="fixed right-4 top-4 z-[var(--z-toast)] flex max-w-md flex-col gap-2">
      {toasts.map((toast) => (
        <Toast key={toast.id} {...toast} />
      ))}
    </div>
  );
}
