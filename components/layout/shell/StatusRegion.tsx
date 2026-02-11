import { type ReactNode } from "react";
import { cn } from "@/lib/utils";

interface StatusRegionProps {
  children: ReactNode;
  className?: string;
}

export function StatusRegion({ children, className }: StatusRegionProps) {
  return <section className={cn("grid gap-4", className)}>{children}</section>;
}

