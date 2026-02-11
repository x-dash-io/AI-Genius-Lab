"use client";

import { useRouter, useSearchParams } from "next/navigation";
import {
  BillingIntervalSegmentedControl,
  type BillingInterval,
} from "@/components/subscriptions/BillingIntervalSegmentedControl";

export function CheckoutIntervalToggle() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const interval = (searchParams.get("interval") as BillingInterval) || "monthly";
  const planId = searchParams.get("planId");

  const handleIntervalChange = (nextInterval: BillingInterval) => {
    if (!planId) {
      return;
    }

    const params = new URLSearchParams(searchParams);
    params.set("interval", nextInterval);
    router.push(`/checkout/subscription?${params.toString()}`, { scroll: false });
  };

  return (
    <div className="flex justify-center">
      <BillingIntervalSegmentedControl value={interval} onValueChange={handleIntervalChange} />
    </div>
  );
}
