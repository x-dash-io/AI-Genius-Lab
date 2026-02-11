import { type ReactNode } from "react";
import { cn } from "@/lib/utils";

type ShellArea = "public" | "app" | "admin";

interface AppShellProps {
  area: ShellArea;
  children: ReactNode;
  className?: string;
}

const areaClassMap: Record<ShellArea, string> = {
  public: "bg-background text-foreground",
  app: "bg-background text-foreground",
  admin: "bg-background text-foreground",
};

export function AppShell({ area, children, className }: AppShellProps) {
  return (
    <div data-app-shell={area} className={cn("min-h-screen", areaClassMap[area], className)}>
      {children}
    </div>
  );
}

