import { type ReactNode } from "react";
import { cn } from "@/lib/utils";

interface ContentRegionProps {
  children: ReactNode;
  className?: string;
}

export function ContentRegion({ children, className }: ContentRegionProps) {
  return <section className={cn("grid gap-6", className)}>{children}</section>;
}

