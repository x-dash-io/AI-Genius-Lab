"use client";

import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { Cart, CartItem } from "@/lib/cart/types";
import { toast } from "@/lib/toast";
import { safeJsonParse } from "@/lib/utils";
import {
  addToCartAction,
  removeFromCartAction,
  updateCartQuantityAction,
  clearCartAction
} from "@/lib/cart/actions";

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
      const result = await addToCartAction(courseId);

      if (result.error) {
        throw new Error(result.error);
      }

      if (result.cart) {
        setCart(result.cart);
      }

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
      const result = await removeFromCartAction(courseId);

      if (result.error) {
        throw new Error(result.error);
      }

      if (result.cart) {
        setCart(result.cart);
      }

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
      const result = await clearCartAction();

      if (result.error) {
        throw new Error(result.error);
      }

      if (result.cart) {
        setCart(result.cart);
      }

      toast({
        title: "Cart cleared",
        description: "All items have been removed from your cart",
        variant: "success",
      });
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
      const result = await updateCartQuantityAction(courseId, quantity);

      if (result.error) {
        throw new Error(result.error);
      }

      if (result.cart) {
        setCart(result.cart);
      }
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
        const result = await removeFromCartAction(courseId);
        if (result.cart) {
          setCart(result.cart);
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
