"use client";

import { type ReactNode } from "react";
import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import { ChevronDown } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export interface AuthStep {
  id: string;
  label: string;
}

interface AuthCardProps {
  title: string;
  description: string;
  chips?: ReadonlyArray<{
    icon: LucideIcon;
    label: string;
  }>;
  steps?: AuthStep[];
  currentStepId?: string;
  children: ReactNode;
  className?: string;
}

export function AuthCard({
  title,
  description,
  chips,
  steps,
  currentStepId,
  children,
  className,
}: AuthCardProps) {
  return (
    <Card className={cn("ui-surface supports-hover-card w-full border-border/85 shadow-[var(--shadow-lg)]", className)}>
      <CardHeader className="space-y-4 p-6 sm:p-8">
        <div className="space-y-1.5 text-center">
          <CardTitle className="font-display text-3xl font-semibold tracking-tight sm:text-[2rem]">{title}</CardTitle>
          <p className="text-sm text-muted-foreground sm:text-base">{description}</p>
        </div>

        {chips?.length ? (
          <AuthTrustChips chips={chips} />
        ) : null}

        {steps?.length && currentStepId ? (
          <AuthMiniStepper steps={steps} currentStepId={currentStepId} />
        ) : null}
      </CardHeader>
      <CardContent className="grid gap-5 p-6 pt-0 sm:gap-6 sm:px-8 sm:pb-8">{children}</CardContent>
    </Card>
  );
}

interface AuthMiniStepperProps {
  steps: AuthStep[];
  currentStepId: string;
}

export function AuthMiniStepper({ steps, currentStepId }: AuthMiniStepperProps) {
  const currentIndex = Math.max(
    0,
    steps.findIndex((step) => step.id === currentStepId)
  );

  return (
    <ol
      className="grid gap-2"
      style={{ gridTemplateColumns: `repeat(${steps.length}, minmax(0, 1fr))` }}
      aria-label="Progress"
    >
      {steps.map((step, index) => {
        const isComplete = index < currentIndex;
        const isCurrent = index === currentIndex;

        return (
          <li key={step.id} className="flex min-w-0 flex-col gap-1.5">
            <span
              className={cn(
                "h-1.5 rounded-full border border-transparent",
                isComplete || isCurrent ? "bg-primary" : "bg-muted"
              )}
              aria-hidden="true"
            />
            <span
              className={cn(
                "truncate text-[0.66rem] font-medium uppercase tracking-[0.16em]",
                isCurrent ? "text-foreground" : "text-muted-foreground"
              )}
              title={step.label}
            >
              {step.label}
            </span>
          </li>
        );
      })}
    </ol>
  );
}

interface AuthTrustChipsProps {
  chips: ReadonlyArray<{
    icon: LucideIcon;
    label: string;
  }>;
}

export function AuthTrustChips({ chips }: AuthTrustChipsProps) {
  return (
    <div className="flex flex-wrap items-center justify-center gap-2">
      {chips.map(({ icon: Icon, label }) => (
        <span
          key={label}
          className="inline-flex min-h-9 items-center gap-1.5 rounded-full border bg-background/85 px-3 text-[0.7rem] font-medium text-muted-foreground"
        >
          <Icon className="h-3.5 w-3.5" />
          {label}
        </span>
      ))}
    </div>
  );
}

interface AuthHelpItem {
  label: string;
  href: string;
  variant?: "primary" | "secondary";
}

interface AuthHelpAccordionProps {
  items: AuthHelpItem[];
}

export function AuthHelpAccordion({ items }: AuthHelpAccordionProps) {
  return (
    <details className="group rounded-[var(--radius-md)] border bg-background/88 p-3">
      <summary className="flex min-h-10 cursor-pointer list-none items-center justify-between gap-3 text-sm font-medium marker:content-none">
        Need help?
        <ChevronDown className="h-4 w-4 text-muted-foreground transition-transform duration-150 group-open:rotate-180" />
      </summary>
      <div className="mt-3 grid gap-2 border-t pt-3 text-sm">
        {items.map((item) => (
          <Link
            key={item.label}
            href={item.href}
            className={cn(
              "inline-flex min-h-10 items-center justify-between rounded-[var(--radius-sm)] px-2 py-2 font-medium",
              item.variant === "primary"
                ? "text-primary hover:bg-accent/60"
                : "text-muted-foreground hover:bg-accent/60 hover:text-foreground"
            )}
          >
            {item.label}
          </Link>
        ))}
      </div>
    </details>
  );
}
