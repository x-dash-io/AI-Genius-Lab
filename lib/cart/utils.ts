import { Cart, CartItem } from "./types";
import { cookies } from "next/headers";

const CART_COOKIE_NAME = "cart";
const CART_COOKIE_MAX_AGE = 60 * 60 * 24 * 30; // 30 days

export function getCartFromCookies(): Cart {
  const cookieStore = cookies();
  const cartCookie = cookieStore.get(CART_COOKIE_NAME);
  
  if (!cartCookie?.value) {
    return { items: [], totalCents: 0, itemCount: 0 };
  }

  try {
    const items: CartItem[] = JSON.parse(cartCookie.value);
    const totalCents = items.reduce((sum, item) => sum + item.priceCents, 0);
    return {
      items,
      totalCents,
      itemCount: items.length,
    };
  } catch {
    return { items: [], totalCents: 0, itemCount: 0 };
  }
}

export function setCartInCookies(items: CartItem[]): void {
  const cookieStore = cookies();
  cookieStore.set(CART_COOKIE_NAME, JSON.stringify(items), {
    maxAge: CART_COOKIE_MAX_AGE,
    httpOnly: false, // Allow client-side access for cart updates
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
  });
}

export function addItemToCart(currentItems: CartItem[], newItem: CartItem): CartItem[] {
  // Check if item already exists
  if (currentItems.some((item) => item.courseId === newItem.courseId)) {
    return currentItems; // Don't add duplicates
  }
  return [...currentItems, newItem];
}

export function removeItemFromCart(currentItems: CartItem[], courseId: string): CartItem[] {
  return currentItems.filter((item) => item.courseId !== courseId);
}

export function clearCart(): CartItem[] {
  return [];
}
