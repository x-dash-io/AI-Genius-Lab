import { type ReactNode } from "react";
import { Breadcrumbs, type BreadcrumbItem } from "@/components/ui/breadcrumbs";
import { cn } from "@/lib/utils";

interface PageHeaderProps {
  title: string;
  description?: string;
  breadcrumbs?: BreadcrumbItem[];
  actions?: ReactNode;
  className?: string;
}

export function PageHeader({
  title,
  description,
  breadcrumbs,
  actions,
  className,
}: PageHeaderProps) {
  return (
    <header className={cn("space-y-4", className)}>
      {breadcrumbs?.length ? <Breadcrumbs items={breadcrumbs} /> : null}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="max-w-3xl space-y-2">
          <h1 className="font-display text-3xl font-semibold tracking-tight sm:text-4xl">{title}</h1>
          {description ? <p className="text-sm text-muted-foreground sm:text-base">{description}</p> : null}
        </div>
        {actions ? <div className="flex flex-wrap items-center gap-2">{actions}</div> : null}
      </div>
    </header>
  );
}

