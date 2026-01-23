"use client";

import { useEffect, useRef } from "react";
import { useCart } from "./CartProvider";

interface CartClearerProps {
  courseIds: string[];
}

/**
 * Client component that clears purchased items from cart on mount.
 * Used on the purchase success page to clean up the cart after checkout.
 */
export function CartClearer({ courseIds }: CartClearerProps) {
  const { removePurchasedItems } = useCart();
  const hasCleared = useRef(false);

  useEffect(() => {
    // Only run once per mount
    if (hasCleared.current || courseIds.length === 0) {
      return;
    }

    hasCleared.current = true;
    
    // Clear purchased items from cart
    removePurchasedItems(courseIds).catch((error) => {
      console.error("Failed to clear purchased items from cart:", error);
    });
  }, [courseIds, removePurchasedItems]);

  // This component doesn't render anything visible
  return null;
}
