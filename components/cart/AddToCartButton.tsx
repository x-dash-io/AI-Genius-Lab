"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ShoppingCart, Loader2, Check } from "lucide-react";
import { useCart } from "./CartProvider";
import { motion } from "framer-motion";

interface AddToCartButtonProps {
  courseId: string;
  priceCents: number;
  variant?: "default" | "outline" | "ghost" | "destructive" | "secondary" | "link";
  size?: "default" | "sm" | "lg" | "icon";
  className?: string;
}

export function AddToCartButton({
  courseId,
  priceCents,
  variant = "default",
  size = "default",
  className,
}: AddToCartButtonProps) {
  const { cart, addToCart } = useCart();
  const [isAdding, setIsAdding] = useState(false);
  const [isAdded, setIsAdded] = useState(false);

  const isInCart = cart.items.some((item) => item.courseId === courseId);

  const handleAddToCart = async () => {
    if (isInCart) return;

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

  if (isInCart) {
    return (
      <Button variant="outline" size={size} className={className} disabled>
        <Check className="h-4 w-4 mr-2" />
        In Cart
      </Button>
    );
  }

  return (
    <Button
      variant={variant}
      size={size}
      className={className}
      onClick={handleAddToCart}
      disabled={isAdding || isAdded}
    >
      {isAdding ? (
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
