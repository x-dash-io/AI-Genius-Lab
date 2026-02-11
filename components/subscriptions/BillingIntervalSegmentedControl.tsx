"use client";

import * as RadioGroup from "@radix-ui/react-radio-group";
import { useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";

export type BillingInterval = "monthly" | "annual";

interface BillingIntervalSegmentedControlProps {
  value: BillingInterval;
  onValueChange: (value: BillingInterval) => void;
  className?: string;
}

const options: Array<{
  value: BillingInterval;
  label: string;
  helper?: string;
}> = [
  { value: "monthly", label: "Monthly", helper: "Flexible cadence" },
  { value: "annual", label: "Yearly", helper: "Save 20%" },
];

export function BillingIntervalSegmentedControl({
  value,
  onValueChange,
  className,
}: BillingIntervalSegmentedControlProps) {
  const reduceMotion = useReducedMotion();

  return (
    <RadioGroup.Root
      aria-label="Billing interval"
      value={value}
      onValueChange={(nextValue) => onValueChange(nextValue as BillingInterval)}
      className={cn(
        "ui-surface relative grid w-full max-w-md grid-cols-2 rounded-[var(--radius-md)] border p-1",
        className
      )}
    >
      <div
        aria-hidden="true"
        className={cn(
          "pointer-events-none absolute bottom-1 left-1 top-1 w-[calc(50%_-_0.25rem)] rounded-[calc(var(--radius-md)-0.35rem)] bg-premium-gradient shadow-[var(--shadow-sm)]",
          value === "annual" ? "translate-x-[calc(100%_+_0.25rem)]" : "translate-x-0",
          reduceMotion
            ? ""
            : "transition-transform duration-[var(--duration-slow)] ease-[var(--ease-standard)]"
        )}
      />

      {options.map((option) => {
        const isActive = value === option.value;

        return (
          <RadioGroup.Item
            key={option.value}
            id={`billing-${option.value}`}
            value={option.value}
            className={cn(
              "relative z-10 flex flex-col items-center gap-0.5 rounded-[calc(var(--radius-md)-0.35rem)] px-3 py-2 text-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/60 focus-visible:ring-offset-2",
              isActive ? "text-primary-foreground" : "text-foreground"
            )}
          >
            <span className="text-sm font-semibold leading-tight">{option.label}</span>
            {option.helper ? (
              <span
                className={cn(
                  "text-[0.72rem] leading-tight",
                  isActive ? "text-primary-foreground/80" : "text-muted-foreground"
                )}
              >
                {option.helper}
              </span>
            ) : null}
          </RadioGroup.Item>
        );
      })}
    </RadioGroup.Root>
  );
}
