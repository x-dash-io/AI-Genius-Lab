import { NextRequest, NextResponse } from "next/server";
import { getCartFromCookies, setCartInCookies, addItemToCart, removeItemFromCart, clearCart } from "@/lib/cart/utils";
import { CartItem } from "@/lib/cart/types";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const cart = getCartFromCookies();
    return NextResponse.json(cart);
  } catch (error) {
    console.error("Error getting cart:", error);
    return NextResponse.json({ items: [], totalCents: 0, itemCount: 0 }, { status: 200 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, courseId } = body;

    if (!action) {
      return NextResponse.json({ error: "Action is required" }, { status: 400 });
    }

    const currentCart = getCartFromCookies();

    if (action === "add") {
      if (!courseId) {
        return NextResponse.json({ error: "Course ID is required" }, { status: 400 });
      }

      // Fetch course details
      const course = await prisma.course.findUnique({
        where: { id: courseId },
        select: {
          id: true,
          slug: true,
          title: true,
          priceCents: true,
          image: true,
        },
      });

      if (!course) {
        return NextResponse.json({ error: "Course not found" }, { status: 404 });
      }

      // Check if already in cart
      if (currentCart.items.some((item) => item.courseId === courseId)) {
        return NextResponse.json({ error: "Course already in cart" }, { status: 400 });
      }

      const newItem: CartItem = {
        courseId: course.id,
        courseSlug: course.slug,
        title: course.title,
        priceCents: course.priceCents,
        image: course.image || undefined,
      };

      const updatedItems = addItemToCart(currentCart.items, newItem);
      setCartInCookies(updatedItems);

      const totalCents = updatedItems.reduce((sum, item) => sum + item.priceCents, 0);
      return NextResponse.json({
        items: updatedItems,
        totalCents,
        itemCount: updatedItems.length,
      });
    }

    if (action === "remove") {
      if (!courseId) {
        return NextResponse.json({ error: "Course ID is required" }, { status: 400 });
      }

      const updatedItems = removeItemFromCart(currentCart.items, courseId);
      setCartInCookies(updatedItems);

      const totalCents = updatedItems.reduce((sum, item) => sum + item.priceCents, 0);
      return NextResponse.json({
        items: updatedItems,
        totalCents,
        itemCount: updatedItems.length,
      });
    }

    if (action === "clear") {
      setCartInCookies(clearCart());
      return NextResponse.json({
        items: [],
        totalCents: 0,
        itemCount: 0,
      });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error) {
    console.error("Error updating cart:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to update cart" },
      { status: 500 }
    );
  }
}
