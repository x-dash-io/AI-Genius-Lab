"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useCallback, useState, useTransition, useEffect } from "react";
import { motion } from "framer-motion";
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
  const pathname = usePathname() ?? "/";
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const currentSearch = searchParams?.get("search") || "";
  const currentCategory = searchParams?.get("category") || "all";
  const currentPrice = searchParams?.get("price") || "all";
  const currentSort = searchParams?.get("sort") || "newest";

  const [category, setCategory] = useState(currentCategory);
  const [price, setPrice] = useState(currentPrice);
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
    setPrice(currentPrice);
    setSortBy(currentSort);
  }, [currentCategory, currentPrice, currentSort]);

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

  const handlePriceChange = useCallback((value: string) => {
    setPrice(value);
    setIsFiltering(true);
    startTransition(() => {
      const params = new URLSearchParams(searchParams?.toString() ?? "");
      if (value && value !== "all") {
        params.set("price", value);
      } else {
        params.delete("price");
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
    setCategory("all");
    setPrice("all");
    setSortBy("newest");
    setIsFiltering(true);
    startTransition(() => {
      router.push(pathname);
    });
  }, [router, pathname]);

  const hasFilters = currentSearch || currentCategory !== "all" || currentPrice !== "all" || currentSort !== "newest";
  const showLoading = isPending && isFiltering;

  return (
    <div className="space-y-6">
      <div className="flex flex-col lg:flex-row gap-4">
        {/* Search Container - Refined */}
        <div className="flex-1 min-w-0">
          <div className="relative group">
            <SearchInput
              placeholder="Search by keyword, topic, or instructor..."
              value={currentSearch}
              onSearch={handleSearch}
              isLoading={showLoading}
              debounceMs={400}
              className="w-full h-12 bg-background border-2 border-border/50 hover:border-primary/50 focus:border-primary focus:ring-4 focus:ring-primary/10 shadow-sm rounded-xl transition-all duration-300 placeholder:text-muted-foreground/60"
            />
          </div>
        </div>

        {/* Filters Group - Glassmorphic Controls */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-3 p-1 rounded-2xl glass border-white/5 bg-accent/5 flex-wrap">
            <Select value={category} onValueChange={handleCategoryChange} disabled={isLoadingCategories}>
              <SelectTrigger className="w-full sm:w-[180px] h-10 border border-border/50 bg-background hover:bg-accent/50 hover:border-primary/50 rounded-xl font-bold text-xs uppercase tracking-widest transition-all shadow-sm">
                <SelectValue placeholder={isLoadingCategories ? "Loading..." : "Category"} />
              </SelectTrigger>
              <SelectContent className="rounded-2xl border-border/70 bg-card p-1">
                <SelectItem value="all" className="rounded-lg font-bold">All Categories</SelectItem>
                {categories.map((cat) => (
                  <SelectItem key={cat.slug} value={cat.slug} className="rounded-lg font-medium">
                    {cat.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <div className="w-px h-6 bg-border/30 hidden sm:block" />

            <Select value={price} onValueChange={handlePriceChange}>
              <SelectTrigger className="w-full sm:w-[140px] h-10 border border-border/50 bg-background hover:bg-accent/50 hover:border-primary/50 rounded-xl font-bold text-xs uppercase tracking-widest transition-all shadow-sm">
                <SelectValue placeholder="Price" />
              </SelectTrigger>
              <SelectContent className="rounded-2xl border-border/70 bg-card p-1">
                <SelectItem value="all" className="rounded-lg font-bold">Any Price</SelectItem>
                <SelectItem value="free" className="rounded-lg font-medium">Complimentary</SelectItem>
                <SelectItem value="paid" className="rounded-lg font-medium">Premium Access</SelectItem>
                <SelectItem value="under-50" className="rounded-lg font-medium">Under $50</SelectItem>
                <SelectItem value="over-50" className="rounded-lg font-medium">$50 & Above</SelectItem>
              </SelectContent>
            </Select>

            <div className="w-px h-6 bg-border/30 hidden md:block" />

            <Select value={sortBy} onValueChange={handleSortChange}>
              <SelectTrigger className="w-full sm:w-[150px] h-10 border border-border/50 bg-background hover:bg-accent/50 hover:border-primary/50 rounded-xl font-bold text-xs uppercase tracking-widest transition-all shadow-sm">
                <SelectValue placeholder="Sort" />
              </SelectTrigger>
              <SelectContent className="rounded-2xl border-border/70 bg-card p-1">
                <SelectItem value="newest" className="rounded-lg font-medium tracking-tight">Recently Added</SelectItem>
                <SelectItem value="oldest" className="rounded-lg font-medium tracking-tight">Earliest First</SelectItem>
                <SelectItem value="price-low" className="rounded-lg font-medium tracking-tight">Price: Low to High</SelectItem>
                <SelectItem value="price-high" className="rounded-lg font-medium tracking-tight">Price: High to Low</SelectItem>
                <SelectItem value="title" className="rounded-lg font-medium tracking-tight">Alphabetical: A-Z</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {hasFilters && (
            <Button
              variant="ghost"
              onClick={handleClearAll}
              disabled={showLoading}
              className="h-12 w-12 rounded-xl bg-accent/20 hover:bg-destructive/10 hover:text-destructive border border-transparent hover:border-destructive/20 transition-all duration-300 group"
              title="Reset everything"
            >
              <X className="h-5 w-5 transition-transform group-hover:rotate-90" />
            </Button>
          )}
        </div>
      </div>

      {/* Active filters display - Minimalist Pill System */}
      {hasFilters && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-3 flex-wrap animate-in fade-in slide-in-from-top-2"
        >
          <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/40">
            <SlidersHorizontal className="h-3 w-3" />
            <span>Refined By</span>
          </div>

          {currentSearch && (
            <Badge variant="secondary" className="pl-3 pr-1 py-1 gap-2 rounded-full font-bold text-xs bg-primary/10 text-primary border-primary/20 hover:bg-primary/20 transition-colors">
              <span className="opacity-60 font-medium">Search:</span>
              <span>{currentSearch}</span>
              <button
                onClick={() => handleSearch("")}
                className="p-1 rounded-full hover:bg-primary/20 transition-colors"
                aria-label="Remove search filter"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}

          {currentCategory !== "all" && (
            <Badge variant="secondary" className="pl-3 pr-1 py-1 gap-2 rounded-full font-bold text-xs bg-primary/10 text-primary border-primary/20 hover:bg-primary/20 transition-colors">
              <span className="opacity-60 font-medium">Topic:</span>
              <span>{categories.find((c) => c.slug === currentCategory)?.name || currentCategory}</span>
              <button
                onClick={() => handleCategoryChange("all")}
                className="p-1 rounded-full hover:bg-primary/20 transition-colors"
                aria-label="Remove category filter"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}

          {currentPrice !== "all" && (
            <Badge variant="secondary" className="pl-3 pr-1 py-1 gap-2 rounded-full font-bold text-xs bg-primary/10 text-primary border-primary/20 hover:bg-primary/20 transition-colors">
              <span className="opacity-60 font-medium">Pricing:</span>
              <span className="capitalize">{currentPrice.replace("-", " ")}</span>
              <button
                onClick={() => handlePriceChange("all")}
                className="p-1 rounded-full hover:bg-primary/20 transition-colors"
                aria-label="Remove price filter"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
        </motion.div>
      )}
    </div>
  );
}
