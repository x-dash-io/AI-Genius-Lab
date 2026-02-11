import { type ReactNode } from "react";
import { cn } from "@/lib/utils";

interface EmptyStateProps {
  title: string;
  description?: string;
  icon?: ReactNode;
  action?: ReactNode;
  className?: string;
}

export function EmptyState({ title, description, icon, action, className }: EmptyStateProps) {
  return (
    <div
      className={cn(
        "ui-surface flex min-h-56 flex-col items-center justify-center rounded-[var(--radius-lg)] border px-6 py-8 text-center",
        className
      )}
    >
      {icon ? <div className="mb-4 text-muted-foreground">{icon}</div> : null}
      <h3 className="font-display text-lg font-semibold tracking-tight">{title}</h3>
      {description ? <p className="mt-2 max-w-md text-sm text-muted-foreground">{description}</p> : null}
      {action ? <div className="mt-5">{action}</div> : null}
    </div>
  );
}
