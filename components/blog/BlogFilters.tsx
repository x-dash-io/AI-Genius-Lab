"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, Filter, X } from "lucide-react";

const categories = [
  "AI & Machine Learning",
  "Web Development",
  "Mobile Development",
  "Data Science",
  "Tech News",
  "Tutorials",
  "Industry Insights",
];

const popularTags = [
  "artificial-intelligence",
  "machine-learning",
  "react",
  "nextjs",
  "typescript",
  "python",
  "javascript",
  "web3",
  "cloud",
  "devops",
];

export function BlogFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [search, setSearch] = useState(searchParams.get("search") || "");
  const [category, setCategory] = useState(searchParams.get("category") || "");
  const [tag, setTag] = useState(searchParams.get("tag") || "");
  const [sort, setSort] = useState(searchParams.get("sort") || "newest");

  useEffect(() => {
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    if (category) params.set("category", category);
    if (tag) params.set("tag", tag);
    if (sort !== "newest") params.set("sort", sort);

    const queryString = params.toString();
    const newPath = queryString ? `/blog?${queryString}` : "/blog";
    
    if (newPath !== window.location.pathname + window.location.search) {
      router.push(newPath);
    }
  }, [search, category, tag, sort, router]);

  const clearFilters = () => {
    setSearch("");
    setCategory("");
    setTag("");
    setSort("newest");
  };

  const hasActiveFilters = search || category || tag || sort !== "newest";

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex flex-col gap-4">
          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search articles..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Filters Row */}
          <div className="flex flex-wrap gap-3">
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={sort} onValueChange={setSort}>
              <SelectTrigger className="w-[150px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Newest</SelectItem>
                <SelectItem value="oldest">Oldest</SelectItem>
                <SelectItem value="popular">Popular</SelectItem>
              </SelectContent>
            </Select>

            {hasActiveFilters && (
              <Button variant="ghost" onClick={clearFilters}>
                <X className="h-4 w-4 mr-2" />
                Clear
              </Button>
            )}
          </div>

          {/* Popular Tags */}
          <div className="space-y-2">
            <p className="text-sm font-medium text-muted-foreground">Popular Tags:</p>
            <div className="flex flex-wrap gap-2">
              {popularTags.map((popularTag) => (
                <Badge
                  key={popularTag}
                  variant={tag === popularTag ? "default" : "secondary"}
                  className="cursor-pointer hover:bg-primary hover:text-primary-foreground"
                  onClick={() => setTag(tag === popularTag ? "" : popularTag)}
                >
                  #{popularTag}
                </Badge>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
