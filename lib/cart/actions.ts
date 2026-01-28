"use server";

import { revalidatePath } from "next/cache";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma, withRetry } from "@/lib/prisma";
import {
  getCartFromCookies,
  setCartInCookies,
  addItemToCart,
  removeItemFromCart,
  updateItemQuantity,
  clearCart,
} from "./utils";
import { CartItem } from "./types";

export async function addToCartAction(courseId: string) {
  try {
    const currentCart = await getCartFromCookies();

    // Check if user already owns this course
    const session = await getServerSession(authOptions);
    if (session?.user) {
      const existingPurchase = await withRetry(() =>
        prisma.purchase.findFirst({
          where: {
            userId: session.user.id,
            courseId,
            status: "paid",
          },
        })
      );

      if (existingPurchase) {
        return { error: "You already own this course" };
      }
    }

    // Fetch course details with inventory
    const course = await withRetry(() =>
      prisma.course.findUnique({
        where: { id: courseId },
        select: {
          id: true,
          slug: true,
          title: true,
          priceCents: true,
          inventory: true,
        },
      })
    );

    if (!course) {
      return { error: "Course not found" };
    }

    // Check inventory availability
    const existingCartItem = currentCart.items.find(
      (item) => item.courseId === courseId
    );
    const currentQuantity = existingCartItem?.quantity || 0;
    const requestedQuantity = currentQuantity + 1;

    if (course.inventory !== null && requestedQuantity > course.inventory) {
      return { error: `Only ${course.inventory} available in inventory` };
    }

    const newItem: CartItem = {
      courseId: course.id,
      courseSlug: course.slug,
      title: course.title,
      priceCents: course.priceCents,
      quantity: 1,
      availableInventory: course.inventory,
    };

    const updatedItems = addItemToCart(currentCart.items, newItem);
    await setCartInCookies(updatedItems);

    const totalCents = updatedItems.reduce((sum, item) => sum + item.priceCents * item.quantity, 0);
    const itemCount = updatedItems.reduce((sum, item) => sum + item.quantity, 0);

    revalidatePath("/cart");
    return { success: true, cart: { items: updatedItems, totalCents, itemCount } };
  } catch (error) {
    console.error("Error adding to cart:", error);
    return { error: "Failed to add to cart" };
  }
}

export async function removeFromCartAction(courseId: string) {
  try {
    const currentCart = await getCartFromCookies();
    const updatedItems = removeItemFromCart(currentCart.items, courseId);
    await setCartInCookies(updatedItems);

    const totalCents = updatedItems.reduce((sum, item) => sum + item.priceCents * item.quantity, 0);
    const itemCount = updatedItems.reduce((sum, item) => sum + item.quantity, 0);

    revalidatePath("/cart");
    return { success: true, cart: { items: updatedItems, totalCents, itemCount } };
  } catch (error) {
    console.error("Error removing from cart:", error);
    return { error: "Failed to remove from cart" };
  }
}

export async function updateCartQuantityAction(courseId: string, quantity: number) {
  try {
    const currentCart = await getCartFromCookies();

    // Fetch course inventory
    const course = await withRetry(() => prisma.course.findUnique({
      where: { id: courseId },
      select: { inventory: true },
    }));

    if (!course) {
      return { error: "Course not found" };
    }

    // Check inventory limits
    if (course.inventory !== null && quantity > course.inventory) {
      return { error: `Only ${course.inventory} available in inventory` };
    }

    const updatedItems = updateItemQuantity(currentCart.items, courseId, quantity);
    await setCartInCookies(updatedItems);

    const totalCents = updatedItems.reduce((sum, item) => sum + item.priceCents * item.quantity, 0);
    const itemCount = updatedItems.reduce((sum, item) => sum + item.quantity, 0);

    revalidatePath("/cart");
    return { success: true, cart: { items: updatedItems, totalCents, itemCount } };
  } catch (error) {
    console.error("Error updating cart quantity:", error);
    return { error: "Failed to update quantity" };
  }
}

export async function clearCartAction() {
  try {
    await setCartInCookies(clearCart());
    revalidatePath("/cart");
    return { success: true, cart: { items: [], totalCents: 0, itemCount: 0 } };
  } catch (error) {
    console.error("Error clearing cart:", error);
    return { error: "Failed to clear cart" };
  }
}
