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
    router.push(`/checkout/subscription?${params.toString()}`, { scroll: false });
  };

  const options = [
    { value: "monthly", label: "Monthly Billing" },
    { value: "annual", label: "Annual Billing", badge: "Save 20%" },
  ];

  return (
    <div className="flex justify-center mb-6">
      <div className="grid grid-cols-2 p-1.5 rounded-2xl bg-muted/40 border border-border/40 relative w-full max-w-[450px] shadow-sm backdrop-blur-sm">
        {options.map((option) => {
          const isActive = interval === option.value;
          return (
            <button
              key={option.value}
              onClick={() => handleIntervalChange(option.value)}
              className={cn(
                "relative flex items-center justify-center gap-2.5 py-3 px-4 text-sm font-bold outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded-xl flex-1 group transition-colors duration-500",
                isActive
                  ? "text-white"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <span className="relative z-10 flex items-center gap-2">
                {option.label}
                {option.badge && (
                  <span className={cn(
                    "inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-black uppercase tracking-tight transition-all duration-500",
                     isActive
                      ? "bg-white/15 text-white ring-1 ring-white/20"
                      : "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400 ring-1 ring-emerald-200/50 dark:ring-emerald-800/50"
                  )}>
                    {option.badge}
                  </span>
                )}
              </span>

              {isActive && (
                <motion.div
                  layoutId="active-pill"
                  className="absolute inset-0 rounded-xl bg-blue-600 shadow-md ring-1 ring-blue-500/20 z-0"
                  initial={false}
                  transition={{
                    type: "spring",
                    stiffness: 400,
                    damping: 30,
                    mass: 1
                  }}
                />
              )}

              {!isActive && (
                <div className="absolute inset-0 rounded-xl bg-foreground/0 group-hover:bg-foreground/[0.03] transition-colors duration-300 z-0" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
