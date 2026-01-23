"use client";

import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { Cart, CartItem } from "@/lib/cart/types";
import { toast } from "@/lib/toast";

interface CartContextType {
  cart: Cart;
  isLoading: boolean;
  addToCart: (courseId: string) => Promise<void>;
  removeFromCart: (courseId: string) => Promise<void>;
  updateQuantity: (courseId: string, quantity: number) => Promise<void>;
  clearCart: () => Promise<void>;
  refreshCart: () => Promise<void>;
  removePurchasedItems: (courseIds: string[]) => Promise<void>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cart, setCart] = useState<Cart>({ items: [], totalCents: 0, itemCount: 0 });
  const [isLoading, setIsLoading] = useState(true);

  const fetchCart = useCallback(async () => {
    try {
      const response = await fetch("/api/cart");
      if (response.ok) {
        const data = await response.json();
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

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to add to cart");
      }

      setCart(data);
      toast({
        title: "Added to cart",
        description: "Course added to your shopping cart",
        variant: "success",
      });
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

      const data = await response.json();

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

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to clear cart");
      }

      setCart(data);
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

      const data = await response.json();

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
          const data = await response.json();
          setCart(data);
        }
      }
    } catch (error) {
      console.error("Error removing purchased items from cart:", error);
      // Refresh cart to sync state
      await fetchCart();
    }
  }, [fetchCart]);

  return (
    <CartContext.Provider
      value={{
        cart,
        isLoading,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        refreshCart,
        removePurchasedItems,
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
