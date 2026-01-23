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

export function UserFilters() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  
  const currentSearch = searchParams.get("search") || "";
  const currentRole = searchParams.get("role") || "all";
  
  const [role, setRole] = useState(currentRole);
  const [isFiltering, setIsFiltering] = useState(false);

  // Sync state with URL params
  useEffect(() => {
    setRole(currentRole);
  }, [currentRole]);

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

  const handleRoleChange = useCallback((value: string) => {
    setRole(value);
    setIsFiltering(true);
    startTransition(() => {
      const params = new URLSearchParams(searchParams.toString());
      if (value && value !== "all") {
        params.set("role", value);
      } else {
        params.delete("role");
      }
      router.push(`${pathname}?${params.toString()}`);
    });
  }, [router, pathname, searchParams]);

  const handleClearAll = useCallback(() => {
    setRole("all");
    setIsFiltering(true);
    startTransition(() => {
      router.push(pathname);
    });
  }, [router, pathname]);

  const hasFilters = currentSearch || currentRole !== "all";
  const showLoading = isPending && isFiltering;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-4">
        <div className="flex-1 min-w-[250px]">
          <SearchInput
            placeholder="Search by name or email..."
            value={currentSearch}
            onSearch={handleSearch}
            isLoading={showLoading}
            debounceMs={400}
          />
        </div>
        <Select value={role} onValueChange={handleRoleChange}>
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="All Roles" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Roles</SelectItem>
            <SelectItem value="customer">Customer</SelectItem>
            <SelectItem value="admin">Admin</SelectItem>
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
