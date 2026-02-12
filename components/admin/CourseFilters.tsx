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

type Category = {
  id: string;
  name: string;
  slug: string;
  isActive: boolean;
};

export function CourseFilters() {
  const router = useRouter();
  const pathname = usePathname() ?? "/";
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  
  const currentSearch = searchParams?.get("search") || "";
  const currentStatus = searchParams?.get("status") || "all";
  const currentCategory = searchParams?.get("category") || "all";
  
  const [status, setStatus] = useState(currentStatus);
  const [category, setCategory] = useState(currentCategory);
  const [isFiltering, setIsFiltering] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoadingCategories, setIsLoadingCategories] = useState(true);

  // Fetch categories on mount
  useEffect(() => {
    async function fetchCategories() {
      try {
        const response = await fetch("/api/categories");
        if (response.ok) {
          const data = await response.json();
          setCategories(data.categories || []);
        }
      } catch (error) {
        console.error("Failed to fetch categories:", error);
      } finally {
        setIsLoadingCategories(false);
      }
    }
    fetchCategories();
  }, []);

  // Sync state with URL params
  useEffect(() => {
    setStatus(currentStatus);
    setCategory(currentCategory);
  }, [currentStatus, currentCategory]);

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

  const handleStatusChange = useCallback((value: string) => {
    setStatus(value);
    setIsFiltering(true);
    startTransition(() => {
      const params = new URLSearchParams(searchParams?.toString() ?? "");
      if (value && value !== "all") {
        params.set("status", value);
      } else {
        params.delete("status");
      }
      router.push(`${pathname}?${params.toString()}`);
    });
  }, [router, pathname, searchParams]);

  const handleCategoryChange = useCallback((value: string) => {
    setCategory(value);
    setIsFiltering(true);
    startTransition(() => {
      const params = new URLSearchParams(searchParams?.toString() ?? "");
      if (value && value !== "all") {
        params.set("category", value);
      } else {
        params.delete("category");
      }
      router.push(`${pathname}?${params.toString()}`);
    });
  }, [router, pathname, searchParams]);

  const handleClearAll = useCallback(() => {
    setStatus("all");
    setCategory("all");
    setIsFiltering(true);
    startTransition(() => {
      router.push(pathname);
    });
  }, [router, pathname]);

  const hasFilters = currentSearch || currentStatus !== "all" || currentCategory !== "all";
  const showLoading = isPending && isFiltering;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-4">
        <div className="flex-1 min-w-[250px]">
          <SearchInput
            placeholder="Search by title or description..."
            value={currentSearch}
            onSearch={handleSearch}
            isLoading={showLoading}
            debounceMs={400}
          />
        </div>
        <Select value={status} onValueChange={handleStatusChange}>
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="All Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="published">Published</SelectItem>
            <SelectItem value="draft">Draft</SelectItem>
          </SelectContent>
        </Select>
        <Select value={category} onValueChange={handleCategoryChange} disabled={isLoadingCategories}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder={isLoadingCategories ? "Loading..." : "All Categories"} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {categories.map((cat) => (
              <SelectItem key={cat.slug} value={cat.slug}>
                {cat.name}
              </SelectItem>
            ))}
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
            Clear Filters
          </Button>
        )}
      </div>
    </div>
  );
}
