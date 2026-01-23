"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, X, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface SearchInputProps {
  placeholder?: string;
  value?: string;
  onSearch: (value: string) => void;
  debounceMs?: number;
  className?: string;
  showClearButton?: boolean;
  isLoading?: boolean;
  autoFocus?: boolean;
}

export function SearchInput({
  placeholder = "Search...",
  value: externalValue = "",
  onSearch,
  debounceMs = 300,
  className,
  showClearButton = true,
  isLoading = false,
  autoFocus = false,
}: SearchInputProps) {
  const [internalValue, setInternalValue] = useState(externalValue);
  const onSearchRef = useRef(onSearch);
  const lastSearchedValue = useRef(externalValue);

  // Keep callback ref updated
  useEffect(() => {
    onSearchRef.current = onSearch;
  }, [onSearch]);

  // Sync with external value changes (e.g., when URL changes)
  useEffect(() => {
    setInternalValue(externalValue);
    lastSearchedValue.current = externalValue;
  }, [externalValue]);

  // Debounced search - only when value actually changes from what was last searched
  useEffect(() => {
    // Don't search if value hasn't changed from last search
    if (internalValue === lastSearchedValue.current) {
      return;
    }

    const timer = setTimeout(() => {
      lastSearchedValue.current = internalValue;
      onSearchRef.current(internalValue);
    }, debounceMs);

    return () => clearTimeout(timer);
  }, [internalValue, debounceMs]);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setInternalValue(e.target.value);
  }, []);

  const handleClear = useCallback(() => {
    setInternalValue("");
    lastSearchedValue.current = "";
    onSearchRef.current("");
  }, []);

  return (
    <div className={cn("relative flex items-center", className)}>
      <div className="absolute left-3 text-muted-foreground">
        {isLoading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Search className="h-4 w-4" />
        )}
      </div>
      <Input
        type="text"
        placeholder={placeholder}
        value={internalValue}
        onChange={handleChange}
        className="pl-10 pr-10"
        autoFocus={autoFocus}
      />
      {showClearButton && internalValue && (
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="absolute right-1 h-7 w-7"
          onClick={handleClear}
        >
          <X className="h-4 w-4" />
          <span className="sr-only">Clear search</span>
        </Button>
      )}
    </div>
  );
}
