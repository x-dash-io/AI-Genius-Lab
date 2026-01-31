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
      <div className="relative grid grid-cols-2 p-1 rounded-xl bg-secondary/50 border border-border w-full max-w-[420px]">
        {/* Animated background pill */}
        <motion.div
          className="absolute top-1 bottom-1 rounded-lg bg-primary shadow-sm"
          initial={false}
          animate={{
            left: interval === "monthly" ? "4px" : "calc(50%)",
            right: interval === "monthly" ? "calc(50%)" : "4px",
          }}
          transition={{
            type: "spring",
            stiffness: 500,
            damping: 35,
            mass: 0.8
          }}
        />
        
        {options.map((option) => {
          const isActive = interval === option.value;
          return (
            <button
              key={option.value}
              onClick={() => handleIntervalChange(option.value)}
              className="relative flex items-center justify-center gap-2 py-3 px-4 text-sm font-semibold outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background rounded-lg z-10 transition-colors duration-200"
              data-testid={`interval-toggle-${option.value}`}
            >
              <motion.span 
                className="flex items-center gap-2"
                animate={{ 
                  color: isActive ? "hsl(var(--primary-foreground))" : "hsl(var(--muted-foreground))" 
                }}
                transition={{ duration: 0.2 }}
              >
                {option.label}
                {option.badge && (
                  <span className="inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold tracking-wide bg-green-500/20 text-green-400 border border-green-500/30">
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