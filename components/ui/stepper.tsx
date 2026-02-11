import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

export interface StepItem {
  id: string;
  label: string;
  description?: string;
}

interface StepperProps {
  steps: StepItem[];
  currentStep: string;
  className?: string;
}

export function Stepper({ steps, currentStep, className }: StepperProps) {
  const currentIndex = steps.findIndex((step) => step.id === currentStep);

  return (
    <ol className={cn("grid gap-3 sm:grid-cols-2 lg:grid-cols-4", className)}>
      {steps.map((step, index) => {
        const isComplete = index < currentIndex;
        const isCurrent = step.id === currentStep;

        return (
          <li
            key={step.id}
            className={cn(
              "rounded-[var(--radius-md)] border px-4 py-3",
              isCurrent && "border-primary bg-primary/10",
              isComplete && "border-success/35 bg-success/10"
            )}
            aria-current={isCurrent ? "step" : undefined}
          >
            <div className="flex items-start gap-3">
              <span
                className={cn(
                  "mt-0.5 inline-flex h-6 w-6 items-center justify-center rounded-full border text-xs font-semibold",
                  isCurrent && "border-primary bg-primary text-primary-foreground",
                  isComplete && "border-success bg-success text-success-foreground",
                  !isCurrent && !isComplete && "border-border text-muted-foreground"
                )}
              >
                {isComplete ? <Check className="h-3.5 w-3.5" /> : index + 1}
              </span>
              <span>
                <span className="block text-sm font-semibold">{step.label}</span>
                {step.description ? (
                  <span className="block text-xs text-muted-foreground">{step.description}</span>
                ) : null}
              </span>
            </div>
          </li>
        );
      })}
    </ol>
  );
}
