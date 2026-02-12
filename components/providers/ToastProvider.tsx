"use client";

import { useEffect, useState } from "react";
import { subscribe, getToasts, type Toast } from "@/lib/toast";
import { ToastContainer } from "@/components/ui/toast";

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>(() => getToasts());

  useEffect(() => {
    const unsubscribe = subscribe(setToasts);
    return unsubscribe;
  }, []);

  return (
    <>
      {children}
      <ToastContainer toasts={toasts} />
    </>
  );
}
