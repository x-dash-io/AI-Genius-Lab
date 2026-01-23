"use client";

import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { ShoppingCart, Loader2, Check, X } from "lucide-react";
import { useCart } from "./CartProvider";

interface AddToCartButtonProps {
  courseId: string;
  priceCents: number;
  inventory?: number | null; // null = unlimited
  variant?: "default" | "outline" | "ghost" | "destructive" | "secondary" | "link";
  size?: "default" | "sm" | "lg" | "icon";
  className?: string;
}

export function AddToCartButton({
  courseId,
  priceCents,
  inventory,
  variant = "default",
  size = "default",
  className,
}: AddToCartButtonProps) {
  const { cart, addToCart, isLoading } = useCart();
  const [isAdding, setIsAdding] = useState(false);
  const [isAdded, setIsAdded] = useState(false);

  const cartItem = cart.items.find((item) => item.courseId === courseId);
  const isInCart = !!cartItem;
  const currentQuantity = cartItem?.quantity || 0;

  // Check if we can add more (inventory check)
  const canAddMore = useMemo(() => {
    if (inventory === null) return true; // Unlimited inventory
    if (inventory === undefined) return true; // Inventory not provided, assume available
    return currentQuantity < inventory;
  }, [inventory, currentQuantity]);

  const isOutOfStock = inventory !== null && inventory !== undefined && inventory === 0;
  const isAtMaxQuantity = inventory !== null && inventory !== undefined && currentQuantity >= inventory;

  const handleAddToCart = async () => {
    if (isInCart && !canAddMore) return;
    if (isOutOfStock) return;

    setIsAdding(true);
    try {
      await addToCart(courseId);
      setIsAdded(true);
      setTimeout(() => setIsAdded(false), 2000);
    } catch (error) {
      // Error is handled by toast in addToCart
    } finally {
      setIsAdding(false);
    }
  };

  if (isOutOfStock) {
    return (
      <Button variant="outline" size={size} className={className} disabled>
        <X className="h-4 w-4 mr-2" />
        Out of Stock
      </Button>
    );
  }

  if (isInCart) {
    if (isAtMaxQuantity) {
      return (
        <Button variant="outline" size={size} className={className} disabled>
          <Check className="h-4 w-4 mr-2" />
          Max Quantity ({inventory})
        </Button>
      );
    }
    return (
      <Button variant="outline" size={size} className={className} disabled>
        <Check className="h-4 w-4 mr-2" />
        In Cart ({currentQuantity})
      </Button>
    );
  }

  return (
    <Button
      variant={variant}
      size={size}
      className={className}
      onClick={handleAddToCart}
      disabled={isAdding || isAdded || isLoading || !canAddMore}
    >
      {isAdding || isLoading ? (
        <>
          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          Adding...
        </>
      ) : isAdded ? (
        <>
          <Check className="h-4 w-4 mr-2" />
          Added!
        </>
      ) : (
        <>
          <ShoppingCart className="h-4 w-4 mr-2" />
          Add to Cart · ${(priceCents / 100).toFixed(2)}
        </>
      )}
    </Button>
  );
}
