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
import { X, SlidersHorizontal } from "lucide-react";
import { Badge } from "@/components/ui/badge";

type Category = {
  id: string;
  name: string;
  slug: string;
  isActive: boolean;
};

export function CourseFilters() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  
  const currentSearch = searchParams.get("search") || "";
  const currentCategory = searchParams.get("category") || "all";
  const currentSort = searchParams.get("sort") || "newest";
  
  const [category, setCategory] = useState(currentCategory);
  const [sortBy, setSortBy] = useState(currentSort);
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
    setCategory(currentCategory);
    setSortBy(currentSort);
  }, [currentCategory, currentSort]);

  // Reset filtering state when transition completes
  useEffect(() => {
    if (!isPending) {
      setIsFiltering(false);
    }
  }, [isPending]);

  const handleSearch = useCallback((value: string) => {
    setIsFiltering(true);
    startTransition(() => {
      const params = new URLSearchParams(searchParams.toString());
      if (value) {
        params.set("search", value);
      } else {
        params.delete("search");
      }
      router.push(`${pathname}?${params.toString()}`);
    });
  }, [router, pathname, searchParams]);

  const handleCategoryChange = useCallback((value: string) => {
    setCategory(value);
    setIsFiltering(true);
    startTransition(() => {
      const params = new URLSearchParams(searchParams.toString());
      if (value && value !== "all") {
        params.set("category", value);
      } else {
        params.delete("category");
      }
      router.push(`${pathname}?${params.toString()}`);
    });
  }, [router, pathname, searchParams]);

  const handleSortChange = useCallback((value: string) => {
    setSortBy(value);
    setIsFiltering(true);
    startTransition(() => {
      const params = new URLSearchParams(searchParams.toString());
      if (value && value !== "newest") {
        params.set("sort", value);
      } else {
        params.delete("sort");
      }
      router.push(`${pathname}?${params.toString()}`);
    });
  }, [router, pathname, searchParams]);

  const handleClearAll = useCallback(() => {
    setCategory("all");
    setSortBy("newest");
    setIsFiltering(true);
    startTransition(() => {
      router.push(pathname);
    });
  }, [router, pathname]);

  const hasFilters = currentSearch || currentCategory !== "all" || currentSort !== "newest";
  const showLoading = isPending && isFiltering;

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <SearchInput
            placeholder="Search courses..."
            value={currentSearch}
            onSearch={handleSearch}
            isLoading={showLoading}
            debounceMs={400}
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          <Select value={category} onValueChange={handleCategoryChange} disabled={isLoadingCategories}>
            <SelectTrigger className="w-[200px]">
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
          <Select value={sortBy} onValueChange={handleSortChange}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Newest</SelectItem>
              <SelectItem value="oldest">Oldest</SelectItem>
              <SelectItem value="price-low">Price: Low to High</SelectItem>
              <SelectItem value="price-high">Price: High to Low</SelectItem>
              <SelectItem value="title">Title A-Z</SelectItem>
            </SelectContent>
          </Select>
          {hasFilters && (
            <Button
              variant="outline"
              onClick={handleClearAll}
              disabled={showLoading}
              size="icon"
              title="Clear all filters"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
      
      {/* Active filters display */}
      {hasFilters && (
        <div className="flex items-center gap-2 flex-wrap">
          <SlidersHorizontal className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm text-muted-foreground">Active filters:</span>
          {currentSearch && (
            <Badge variant="secondary" className="gap-1">
              Search: "{currentSearch}"
              <button
                onClick={() => handleSearch("")}
                className="ml-1 hover:text-foreground"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
          {currentCategory !== "all" && (
            <Badge variant="secondary" className="gap-1">
              {categories.find((c) => c.slug === currentCategory)?.name || currentCategory}
              <button
                onClick={() => handleCategoryChange("all")}
                className="ml-1 hover:text-foreground"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
          {currentSort !== "newest" && (
            <Badge variant="secondary" className="gap-1">
              Sort: {currentSort}
              <button
                onClick={() => handleSortChange("newest")}
                className="ml-1 hover:text-foreground"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
        </div>
      )}
      
    </div>
  );
}
