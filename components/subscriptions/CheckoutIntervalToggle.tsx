"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export function CheckoutIntervalToggle() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const interval = searchParams.get("interval") || "monthly";
  const planId = searchParams.get("planId");

  const handleIntervalChange = (newInterval: string) => {
    if (!planId) return;
    const params = new URLSearchParams(searchParams);
    params.set("interval", newInterval);
    router.push(`/checkout/subscription?${params.toString()}`);
  };

  const options = [
    { value: "monthly", label: "Monthly Billing" },
    { value: "annual", label: "Annual Billing", badge: "Save 20%" },
  ];

  return (
    <div className="flex justify-center mb-8">
      <div className="grid grid-cols-2 p-1.5 rounded-xl bg-muted/50 border border-border/50 relative w-full max-w-[400px]">
        {options.map((option) => {
          const isActive = interval === option.value;
          return (
            <button
              key={option.value}
              onClick={() => handleIntervalChange(option.value)}
              className={cn(
                "relative z-10 flex items-center justify-center gap-2 py-2.5 text-sm font-medium transition-colors duration-200 outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-lg",
                isActive ? "text-white" : "text-muted-foreground hover:text-foreground"
              )}
            >
              <span>{option.label}</span>
              {option.badge && (
                <span className={cn(
                  "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-bold transition-colors",
                   isActive ? "bg-white/20 text-white" : "bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-400"
                )}>
                  {option.badge}
                </span>
              )}
              {isActive && (
                <motion.div
                  layoutId="active-interval-pill"
                  className="absolute inset-0 z-[-1] rounded-lg bg-blue-600 shadow-sm"
                  transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
