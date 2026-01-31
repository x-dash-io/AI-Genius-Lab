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
      <div className="relative grid grid-cols-2 p-1 rounded-full bg-zinc-900/80 border border-zinc-700/50 w-full max-w-[420px] backdrop-blur-xl shadow-[0_4px_24px_rgba(0,0,0,0.3),inset_0_1px_0_rgba(255,255,255,0.05)]">
        {/* Animated background pill */}
        <motion.div
          className="absolute top-1 bottom-1 rounded-full bg-gradient-to-r from-emerald-500 to-emerald-600 shadow-[0_0_20px_rgba(16,185,129,0.4)]"
          initial={false}
          animate={{
            left: interval === "monthly" ? "4px" : "50%",
            right: interval === "monthly" ? "50%" : "4px",
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
              className="relative flex items-center justify-center gap-2 py-3.5 px-5 text-sm font-semibold outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-900 rounded-full z-10 transition-colors duration-200"
              data-testid={`interval-toggle-${option.value}`}
            >
              <motion.span 
                className="flex items-center gap-2"
                animate={{ 
                  color: isActive ? "#ffffff" : "rgba(161, 161, 170, 1)" 
                }}
                transition={{ duration: 0.2 }}
              >
                {option.label}
                {option.badge && (
                  <span className="inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold tracking-wide bg-emerald-400/20 text-emerald-300 border border-emerald-400/30">
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
