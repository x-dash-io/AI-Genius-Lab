"use client";

import { useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { toastSuccess } from "@/lib/toast";

export function SubscriptionSuccessToast() {
  const searchParams = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    const success = searchParams?.get("subscription") === "success";
    if (success) {
      toastSuccess(
        "Subscription Successful!",
        "Your plan is being updated. You will have access shortly.",
        5000
      );

      // Clean up the URL by removing the subscription parameter
      const params = new URLSearchParams(searchParams?.toString() ?? "");
      params.delete("subscription");
      const newPath = params.toString() ? `?${params.toString()}` : "";
      router.replace(window.location.pathname + newPath, { scroll: false });
    }
  }, [searchParams, router]);

  return null;
}
