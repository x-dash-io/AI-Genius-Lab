"use client";

/** LEGACY UI COMPONENT
 * Kept for backward compatibility with pre-refactor list pages.
 * Do not use for new UI work; use base `Skeleton` and tokenized layouts.
 */
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

interface FilterSkeletonProps {
  count?: number;
  showHeader?: boolean;
}

export function FilterSkeleton({ count = 5, showHeader = true }: FilterSkeletonProps) {
  return (
    <div className="space-y-4">
      {Array.from({ length: count }).map((_, i) => (
        <Card key={i}>
          {showHeader && (
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="space-y-2 flex-1">
                  <Skeleton className="h-6 w-48" />
                  <Skeleton className="h-4 w-64" />
                  <div className="flex items-center gap-4 mt-2">
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-4 w-32" />
                  </div>
                </div>
                <Skeleton className="h-9 w-24" />
              </div>
            </CardHeader>
          )}
          {!showHeader && (
            <CardContent className="py-4">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <Skeleton className="h-5 w-48" />
                  <Skeleton className="h-4 w-32" />
                </div>
                <Skeleton className="h-8 w-20" />
              </div>
            </CardContent>
          )}
        </Card>
      ))}
    </div>
  );
}

export function TableFilterSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="space-y-4">
      {/* Table header */}
      <div className="flex items-center gap-4 border-b pb-2">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-4 w-20 ml-auto" />
      </div>
      {/* Table rows */}
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex items-center gap-4 py-3 border-b">
          <Skeleton className="h-4 w-48" />
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-8 w-20 ml-auto" />
        </div>
      ))}
    </div>
  );
}
