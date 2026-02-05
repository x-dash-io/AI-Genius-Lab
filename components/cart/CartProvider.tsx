"use client";

import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { Cart, CartItem } from "@/lib/cart/types";
import { toast } from "@/lib/toast";
import { safeJsonParse } from "@/lib/utils";

interface CartContextType {
  cart: Cart;
  isLoading: boolean;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  addToCart: (courseId: string) => Promise<void>;
  removeFromCart: (courseId: string) => Promise<void>;
  updateQuantity: (courseId: string, quantity: number) => Promise<void>;
  clearCart: () => Promise<void>;
  refreshCart: () => Promise<void>;
  removePurchasedItems: (courseIds: string[]) => Promise<void>;
  applyCoupon: (code: string) => Promise<{ error?: string }>;
  removeCoupon: () => Promise<void>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cart, setCart] = useState<Cart>({ items: [], totalCents: 0, itemCount: 0, couponCode: null, discountTotal: 0, finalTotal: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(false);

  const fetchCart = useCallback(async () => {
    try {
      const response = await fetch("/api/cart");
      if (response.ok) {
        const data = await safeJsonParse(response);
        setCart(data);
      }
    } catch (error) {
      console.error("Error fetching cart:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  const addToCart = useCallback(async (courseId: string) => {
    try {
      const response = await fetch("/api/cart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "add", courseId }),
      });

      const data = await safeJsonParse(response);

      if (!response.ok) {
        throw new Error(data.error || "Failed to add to cart");
      }

      setCart(data);
      toast({
        title: "Added to cart",
        description: "Course added to your shopping cart",
        variant: "success",
      });
      setIsOpen(true);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to add to cart";
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
      throw error;
    }
  }, []);

  const removeFromCart = useCallback(async (courseId: string) => {
    try {
      const response = await fetch("/api/cart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "remove", courseId }),
      });

      const data = await safeJsonParse(response);

      if (!response.ok) {
        throw new Error(data.error || "Failed to remove from cart");
      }

      setCart(data);
      toast({
        title: "Removed from cart",
        description: "Course removed from your shopping cart",
        variant: "success",
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to remove from cart";
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    }
  }, []);

  const clearCart = useCallback(async () => {
    try {
      const response = await fetch("/api/cart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "clear" }),
      });

      const data = await safeJsonParse(response);

      if (!response.ok) {
        throw new Error(data.error || "Failed to clear cart");
      }

      setCart(data);
      toast({
        title: "Cart cleared",
        description: "All items have been removed from your cart",
        variant: "success",
      });
      setIsOpen(false);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to clear cart";
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    }
  }, []);

  const refreshCart = useCallback(async () => {
    await fetchCart();
  }, [fetchCart]);

  const updateQuantity = useCallback(async (courseId: string, quantity: number) => {
    try {
      const response = await fetch("/api/cart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "updateQuantity", courseId, quantity }),
      });

      const data = await safeJsonParse(response);

      if (!response.ok) {
        throw new Error(data.error || "Failed to update quantity");
      }

      setCart(data);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to update quantity";
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    }
  }, []);

  const removePurchasedItems = useCallback(async (courseIds: string[]) => {
    try {
      // Remove each course ID from the cart
      for (const courseId of courseIds) {
        const response = await fetch("/api/cart", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: "remove", courseId }),
        });

        if (response.ok) {
          const data = await safeJsonParse(response);
          setCart(data);
        }
      }
    } catch (error) {
      console.error("Error removing purchased items from cart:", error);
      // Refresh cart to sync state
      await fetchCart();
    }
  }, [fetchCart]);

  const applyCoupon = useCallback(async (code: string) => {
    try {
      const response = await fetch("/api/cart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "applyCoupon", couponCode: code }),
      });
      const data = await safeJsonParse(response);

      if (!response.ok) {
        return { error: data.error || "Failed to apply coupon" };
      }

      setCart(data);
      toast({
        title: "Coupon applied!",
        description: `Discount applied successfully`,
        variant: "success",
      });
      return {};
    } catch (error) {
      return { error: "Failed to apply coupon" };
    }
  }, []);

  const removeCoupon = useCallback(async () => {
    try {
      const response = await fetch("/api/cart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "removeCoupon" }),
      });
      const data = await safeJsonParse(response);
      setCart(data);
      toast({
        title: "Coupon removed",
        description: "Discount code has been removed",
        variant: "success",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to remove coupon",
        variant: "destructive",
      });
    }
  }, []);

  return (
    <CartContext.Provider
      value={{
        cart,
        isLoading,
        isOpen,
        setIsOpen,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        refreshCart,
        removePurchasedItems,
        applyCoupon,
        removeCoupon,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
