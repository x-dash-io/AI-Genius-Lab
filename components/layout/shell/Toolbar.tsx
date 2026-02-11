import { type ReactNode } from "react";
import { cn } from "@/lib/utils";

interface ToolbarProps {
  children: ReactNode;
  className?: string;
}

export function Toolbar({ children, className }: ToolbarProps) {
  return (
    <section className={cn("ui-surface flex flex-wrap items-center gap-3 rounded-[var(--radius-md)] border p-3", className)}>
      {children}
    </section>
  );
}

