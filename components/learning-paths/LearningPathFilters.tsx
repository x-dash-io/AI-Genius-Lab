"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useCallback, useState, useTransition, useEffect } from "react";
import { SearchInput } from "@/components/ui/search-input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { X } from "lucide-react";

export function LearningPathFilters() {
  const router = useRouter();
  const pathname = usePathname() ?? "/";
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  
  const currentSearch = searchParams?.get("search") || "";
  const currentSort = searchParams?.get("sort") || "newest";
  
  const [sortBy, setSortBy] = useState(currentSort);
  const [isFiltering, setIsFiltering] = useState(false);

  // Sync state with URL params
  useEffect(() => {
    setSortBy(currentSort);
  }, [currentSort]);

  // Reset filtering state when transition completes
  useEffect(() => {
    if (!isPending) {
      setIsFiltering(false);
    }
  }, [isPending]);

  const handleSearch = useCallback((value: string) => {
    setIsFiltering(true);
    startTransition(() => {
      const params = new URLSearchParams(searchParams?.toString() ?? "");
      if (value) {
        params.set("search", value);
      } else {
        params.delete("search");
      }
      router.push(`${pathname}?${params.toString()}`);
    });
  }, [router, pathname, searchParams]);

  const handleSortChange = useCallback((value: string) => {
    setSortBy(value);
    setIsFiltering(true);
    startTransition(() => {
      const params = new URLSearchParams(searchParams?.toString() ?? "");
      if (value && value !== "newest") {
        params.set("sort", value);
      } else {
        params.delete("sort");
      }
      router.push(`${pathname}?${params.toString()}`);
    });
  }, [router, pathname, searchParams]);

  const handleClearAll = useCallback(() => {
    setSortBy("newest");
    setIsFiltering(true);
    startTransition(() => {
      router.push(pathname);
    });
  }, [router, pathname]);

  const hasFilters = currentSearch || currentSort !== "newest";
  const showLoading = isPending && isFiltering;

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <SearchInput
            placeholder="Search learning paths..."
            value={currentSearch}
            onSearch={handleSearch}
            isLoading={showLoading}
            debounceMs={400}
          />
        </div>
        <div className="flex gap-2">
          <Select value={sortBy} onValueChange={handleSortChange}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Newest First</SelectItem>
              <SelectItem value="oldest">Oldest First</SelectItem>
              <SelectItem value="courses">Most Courses</SelectItem>
              <SelectItem value="title">Title A-Z</SelectItem>
            </SelectContent>
          </Select>
          {hasFilters && (
            <Button
              variant="outline"
              onClick={handleClearAll}
              disabled={showLoading}
              className="gap-2"
            >
              <X className="h-4 w-4" />
              Clear
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
