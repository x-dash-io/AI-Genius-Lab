"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useState, useEffect } from "react";

export function PurchaseFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState(searchParams.get("status") || "all");
  const [provider, setProvider] = useState(searchParams.get("provider") || "all");
  const [search, setSearch] = useState(searchParams.get("search") || "");

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (status && status !== "all") params.set("status", status);
    if (provider && provider !== "all") params.set("provider", provider);
    if (search) params.set("search", search);
    router.push(`/admin/purchases?${params.toString()}`);
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-wrap gap-4">
      <div className="flex-1 min-w-[200px]">
        <Input
          name="search"
          placeholder="Search by user email or course name..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>
      <Select value={status} onValueChange={setStatus}>
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="All Status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Status</SelectItem>
          <SelectItem value="pending">Pending</SelectItem>
          <SelectItem value="paid">Paid</SelectItem>
        </SelectContent>
      </Select>
      <Select value={provider} onValueChange={setProvider}>
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="All Providers" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Providers</SelectItem>
          <SelectItem value="paypal">PayPal</SelectItem>
          <SelectItem value="stripe">Stripe</SelectItem>
        </SelectContent>
      </Select>
      <Button type="submit">Apply Filters</Button>
    </form>
  );
}
