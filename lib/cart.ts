"use server";

import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";

export interface CartItem {
  courseId: string;
  courseSlug: string;
  title: string;
  priceCents: number;
  description?: string;
  imageUrl?: string;
}

const CART_COOKIE_NAME = "cart";
const CART_MAX_AGE = 60 * 60 * 24 * 30; // 30 days

export async function getCart(): Promise<CartItem[]> {
  const cookieStore = await cookies();
  const cartCookie = cookieStore.get(CART_COOKIE_NAME);
  
  if (!cartCookie?.value) {
    return [];
  }

  try {
    return JSON.parse(cartCookie.value) as CartItem[];
  } catch {
    return [];
  }
}

export async function addToCart(item: CartItem): Promise<CartItem[]> {
  const cart = await getCart();
  
  // Check if course already in cart
  if (cart.some((i) => i.courseId === item.courseId)) {
    return cart;
  }

  const updatedCart = [...cart, item];
  await saveCart(updatedCart);
  return updatedCart;
}

export async function removeFromCart(courseId: string): Promise<CartItem[]> {
  const cart = await getCart();
  const updatedCart = cart.filter((item) => item.courseId !== courseId);
  await saveCart(updatedCart);
  return updatedCart;
}

export async function clearCart(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(CART_COOKIE_NAME);
}

async function saveCart(cart: CartItem[]): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(CART_COOKIE_NAME, JSON.stringify(cart), {
    maxAge: CART_MAX_AGE,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
  });
}

export async function getCartTotal(cart: CartItem[]): Promise<number> {
  return cart.reduce((sum, item) => sum + item.priceCents, 0);
}

/**
 * Filter out courses user already owns from cart
 */
export async function filterOwnedCourses(
  cart: CartItem[],
  userId: string
): Promise<CartItem[]> {
  if (cart.length === 0) {
    return cart;
  }

  const courseIds = cart.map((item) => item.courseId);
  const existingPurchases = await prisma.purchase.findMany({
    where: {
      userId,
      courseId: { in: courseIds },
      status: "paid",
    },
    select: { courseId: true },
  });

  const ownedCourseIds = new Set(existingPurchases.map((p) => p.courseId));
  return cart.filter((item) => !ownedCourseIds.has(item.courseId));
}
