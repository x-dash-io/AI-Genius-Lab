import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getCartFromCookies, setCartInCookies, addItemToCart, removeItemFromCart, updateItemQuantity, clearCart } from "@/lib/cart/utils";
import { CartItem } from "@/lib/cart/types";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const cart = await getCartFromCookies();
    
    // If user is logged in, filter out already purchased courses
    const session = await getServerSession(authOptions);
    if (session?.user && cart.items.length > 0) {
      const courseIds = cart.items.map((item) => item.courseId);
      
      // Get purchased courses
      const purchases = await prisma.purchase.findMany({
        where: {
          userId: session.user.id,
          courseId: { in: courseIds },
          status: "paid",
        },
        select: { courseId: true },
      });
      
      const purchasedIds = new Set(purchases.map((p) => p.courseId));
      
      // Filter out purchased items
      if (purchasedIds.size > 0) {
        const filteredItems = cart.items.filter(
          (item) => !purchasedIds.has(item.courseId)
        );
        
        // Update cart if items were removed
        if (filteredItems.length !== cart.items.length) {
          await setCartInCookies(filteredItems);
          const totalCents = filteredItems.reduce(
            (sum, item) => sum + item.priceCents * item.quantity,
            0
          );
          const itemCount = filteredItems.reduce(
            (sum, item) => sum + item.quantity,
            0
          );
          
          return NextResponse.json({
            items: filteredItems,
            totalCents,
            itemCount,
            removedPurchased: true,
          });
        }
      }
    }
    
    return NextResponse.json(cart);
  } catch (error) {
    console.error("Error getting cart:", error);
    return NextResponse.json({ items: [], totalCents: 0, itemCount: 0 }, { status: 200 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, courseId, quantity } = body;

    if (!action) {
      return NextResponse.json({ error: "Action is required" }, { status: 400 });
    }

    const currentCart = await getCartFromCookies();

    if (action === "add") {
      if (!courseId) {
        return NextResponse.json({ error: "Course ID is required" }, { status: 400 });
      }

      // Check if user already owns this course
      const session = await getServerSession(authOptions);
      if (session?.user) {
        const existingPurchase = await prisma.purchase.findFirst({
          where: {
            userId: session.user.id,
            courseId,
            status: "paid",
          },
        });
        
        if (existingPurchase) {
          return NextResponse.json(
            { error: "You already own this course" },
            { status: 400 }
          );
        }
      }

      // Fetch course details with inventory
      const course = await prisma.course.findUnique({
        where: { id: courseId },
        select: {
          id: true,
          slug: true,
          title: true,
          priceCents: true,
          inventory: true,
        },
      });

      if (!course) {
        return NextResponse.json({ error: "Course not found" }, { status: 404 });
      }

      // Check inventory availability
      const existingCartItem = currentCart.items.find((item) => item.courseId === courseId);
      const currentQuantity = existingCartItem?.quantity || 0;
      const requestedQuantity = currentQuantity + 1;

      if (course.inventory !== null && requestedQuantity > course.inventory) {
        return NextResponse.json(
          { error: `Only ${course.inventory} available in inventory` },
          { status: 400 }
        );
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
      return NextResponse.json({
        items: updatedItems,
        totalCents,
        itemCount,
      });
    }

    if (action === "updateQuantity") {
      if (!courseId || quantity === undefined) {
        return NextResponse.json({ error: "Course ID and quantity are required" }, { status: 400 });
      }

      // Fetch course inventory
      const course = await prisma.course.findUnique({
        where: { id: courseId },
        select: { inventory: true },
      });

      if (!course) {
        return NextResponse.json({ error: "Course not found" }, { status: 404 });
      }

      // Check inventory limits
      if (course.inventory !== null && quantity > course.inventory) {
        return NextResponse.json(
          { error: `Only ${course.inventory} available in inventory` },
          { status: 400 }
        );
      }

      const updatedItems = updateItemQuantity(currentCart.items, courseId, quantity);
      await setCartInCookies(updatedItems);

      const totalCents = updatedItems.reduce((sum, item) => sum + item.priceCents * item.quantity, 0);
      const itemCount = updatedItems.reduce((sum, item) => sum + item.quantity, 0);
      return NextResponse.json({
        items: updatedItems,
        totalCents,
        itemCount,
      });
    }

    if (action === "remove") {
      if (!courseId) {
        return NextResponse.json({ error: "Course ID is required" }, { status: 400 });
      }

      const updatedItems = removeItemFromCart(currentCart.items, courseId);
      await setCartInCookies(updatedItems);

      const totalCents = updatedItems.reduce((sum, item) => sum + item.priceCents * item.quantity, 0);
      const itemCount = updatedItems.reduce((sum, item) => sum + item.quantity, 0);
      return NextResponse.json({
        items: updatedItems,
        totalCents,
        itemCount,
      });
    }

    if (action === "clear") {
      await setCartInCookies(clearCart());
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
