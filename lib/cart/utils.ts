import { Cart, CartItem } from "./types";
import { cookies } from "next/headers";

const CART_COOKIE_NAME = "cart";
const CART_COOKIE_MAX_AGE = 60 * 60 * 24 * 30; // 30 days

export async function getCartFromCookies(): Promise<Cart> {
  try {
    const cookieStore = await cookies();
    const cartCookie = cookieStore.get(CART_COOKIE_NAME);
    
    if (!cartCookie?.value) {
      return { items: [], totalCents: 0, itemCount: 0 };
    }

    try {
      const parsed = JSON.parse(cartCookie.value);
      // Ensure parsed value is an array
      const items: CartItem[] = Array.isArray(parsed) ? parsed : [];
      // Ensure each item has quantity (for backward compatibility)
      const normalizedItems = items.map(item => ({
        ...item,
        quantity: item.quantity || 1,
        availableInventory: item.availableInventory ?? null,
      }));
      const totalCents = normalizedItems.reduce((sum, item) => sum + (item.priceCents || 0) * (item.quantity || 1), 0);
      const itemCount = normalizedItems.reduce((sum, item) => sum + (item.quantity || 1), 0);
      return {
        items: normalizedItems,
        totalCents,
        itemCount,
      };
    } catch (parseError) {
      console.error("Error parsing cart cookie:", parseError);
      return { items: [], totalCents: 0, itemCount: 0 };
    }
  } catch (error) {
    console.error("Error getting cart from cookies:", error);
    return { items: [], totalCents: 0, itemCount: 0 };
  }
}

export async function setCartInCookies(items: CartItem[]): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(CART_COOKIE_NAME, JSON.stringify(items), {
    maxAge: CART_COOKIE_MAX_AGE,
    httpOnly: false, // Allow client-side access for cart updates
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
  });
}

export function addItemToCart(currentItems: CartItem[], newItem: CartItem): CartItem[] {
  // Check if item already exists - if so, increase quantity
  const existingIndex = currentItems.findIndex((item) => item.courseId === newItem.courseId);
  if (existingIndex >= 0) {
    const updated = [...currentItems];
    const existingItem = updated[existingIndex];
    // Check inventory limits
    if (existingItem.availableInventory !== null && existingItem.quantity >= existingItem.availableInventory) {
      return currentItems; // Can't add more, return unchanged
    }
    updated[existingIndex] = {
      ...existingItem,
      quantity: existingItem.quantity + 1,
    };
    return updated;
  }
  return [...currentItems, { ...newItem, quantity: newItem.quantity || 1 }];
}

export function updateItemQuantity(currentItems: CartItem[], courseId: string, newQuantity: number): CartItem[] {
  if (newQuantity <= 0) {
    return removeItemFromCart(currentItems, courseId);
  }
  
  const updated = [...currentItems];
  const itemIndex = updated.findIndex((item) => item.courseId === courseId);
  if (itemIndex >= 0) {
    const item = updated[itemIndex];
    // Check inventory limits
    if (item.availableInventory !== null && newQuantity > item.availableInventory) {
      return currentItems; // Can't exceed inventory, return unchanged
    }
    updated[itemIndex] = {
      ...item,
      quantity: newQuantity,
    };
  }
  return updated;
}

export function removeItemFromCart(currentItems: CartItem[], courseId: string): CartItem[] {
  return currentItems.filter((item) => item.courseId !== courseId);
}

export function clearCart(): CartItem[] {
  return [];
}

/**
 * Check if a cart item is valid based on inventory availability
 * @param item - The cart item to validate
 * @returns true if the item is valid (has inventory available), false otherwise
 */
export function isCartItemValid(item: CartItem): boolean {
  // If inventory is null, it's unlimited - always valid
  if (item.availableInventory === null) {
    return true;
  }
  
  // If inventory is 0, item is out of stock - invalid
  if (item.availableInventory === 0) {
    return false;
  }
  
  // If current quantity exceeds available inventory, invalid
  if (item.quantity > item.availableInventory) {
    return false;
  }
  
  return true;
}

/**
 * Check if a cart item can have its quantity increased
 * @param item - The cart item to check
 * @returns true if quantity can be increased, false otherwise
 */
export function canIncreaseQuantity(item: CartItem): boolean {
  if (item.availableInventory === null) {
    return true; // Unlimited inventory
  }
  return (item.quantity || 1) < item.availableInventory;
}
