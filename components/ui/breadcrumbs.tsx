import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

export type BreadcrumbItem = {
  label: string;
  href?: string;
};

export function Breadcrumbs({ items, className }: { items: BreadcrumbItem[]; className?: string }) {
  if (!items.length) {
    return null;
  }

  return (
    <nav aria-label="Breadcrumb" className={cn("flex items-center gap-2 text-xs text-muted-foreground", className)}>
      {items.map((item, index) => {
        const isLast = index === items.length - 1;

        return (
          <span key={`${item.label}-${index}`} className="inline-flex items-center gap-2">
            {item.href && !isLast ? (
              <Link href={item.href} className="hover:text-foreground">
                {item.label}
              </Link>
            ) : (
              <span className={cn(isLast && "text-foreground")}>{item.label}</span>
            )}
            {!isLast ? <ChevronRight className="h-3.5 w-3.5" aria-hidden="true" /> : null}
          </span>
        );
      })}
    </nav>
  );
}
