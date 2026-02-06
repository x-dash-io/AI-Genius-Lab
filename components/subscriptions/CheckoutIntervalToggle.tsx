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
    { value: "annual", label: "Annual Billing", badge: "SAVE 20%" },
  ];

  return (
    <div className="flex justify-center mb-6">
      <div className="relative grid grid-cols-2 p-1.5 rounded-2xl bg-muted/40 border border-border/40 w-full max-w-[450px] shadow-sm backdrop-blur-sm">
        {/* Animated background pill - positioned absolutely so no layout shift */}
        <motion.div
          className="absolute top-1.5 bottom-1.5 rounded-xl bg-primary shadow-md ring-1 ring-primary/20"
          initial={false}
          animate={{
            left: interval === "monthly" ? "6px" : "calc(50% + 2px)",
            width: "calc(50% - 8px)",
          }}
          transition={{
            type: "spring",
            stiffness: 400,
            damping: 30,
            mass: 1
          }}
        />

        {options.map((option) => {
          const isActive = interval === option.value;
          return (
            <button
              key={option.value}
              onClick={() => handleIntervalChange(option.value)}
              className="relative flex items-center justify-center gap-2.5 py-3 px-4 text-sm font-bold outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded-xl z-10 transition-colors duration-300"
              data-testid={`interval-toggle-${option.value}`}
            >
              <motion.span
                className="flex items-center gap-2"
                animate={{
                  color: isActive ? "#ffffff" : "hsl(var(--muted-foreground))"
                }}
                transition={{ duration: 0.25 }}
              >
                {option.label}
                {option.badge && (
                  <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-black uppercase tracking-tight bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400 ring-1 ring-emerald-200/50 dark:ring-emerald-800/50">
                    {option.badge}
                  </span>
                )}
              </motion.span>
            </button>
          );
        })}
      </div>
    </div>
  );
}