import * as React from "react";
import { ChevronLeft, ChevronRight, MoreHorizontal } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

export const Pagination = ({ className, ...props }: React.ComponentProps<"nav">) => (
  <nav role="navigation" aria-label="Pagination" className={cn("mx-auto flex w-full justify-center", className)} {...props} />
);

export const PaginationContent = React.forwardRef<HTMLUListElement, React.ComponentProps<"ul">>(
  ({ className, ...props }, ref) => <ul ref={ref} className={cn("flex flex-row items-center gap-1", className)} {...props} />
);
PaginationContent.displayName = "PaginationContent";

export const PaginationItem = React.forwardRef<HTMLLIElement, React.ComponentProps<"li">>(
  ({ className, ...props }, ref) => <li ref={ref} className={cn("", className)} {...props} />
);
PaginationItem.displayName = "PaginationItem";

export function PaginationLink({ isActive, className, ...props }: React.ComponentProps<typeof Button> & { isActive?: boolean }) {
  return (
    <Button
      aria-current={isActive ? "page" : undefined}
      variant={isActive ? "default" : "ghost"}
      size="sm"
      className={cn("h-8 min-w-8 px-2", className)}
      {...props}
    />
  );
}

export const PaginationPrevious = (props: React.ComponentProps<typeof PaginationLink>) => (
  <PaginationLink aria-label="Go to previous page" className="gap-1 pl-2" {...props}>
    <ChevronLeft className="h-4 w-4" />
    Prev
  </PaginationLink>
);

export const PaginationNext = (props: React.ComponentProps<typeof PaginationLink>) => (
  <PaginationLink aria-label="Go to next page" className="gap-1 pr-2" {...props}>
    Next
    <ChevronRight className="h-4 w-4" />
  </PaginationLink>
);

export const PaginationEllipsis = ({ className, ...props }: React.ComponentProps<"span">) => (
  <span aria-hidden className={cn("flex h-8 w-8 items-center justify-center", className)} {...props}>
    <MoreHorizontal className="h-4 w-4" />
  </span>
);
