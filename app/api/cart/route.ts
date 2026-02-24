import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getCartFromCookies, setCartInCookies, addItemToCart, removeItemFromCart, updateItemQuantity, clearCart } from "@/lib/cart/utils";
import { CartItem } from "@/lib/cart/types";
import { prisma } from "@/lib/prisma";
import { getCourseAccessState } from "@/lib/access";

export async function GET() {
  try {
    const cart = await getCartFromCookies();
    let normalizedCart = cart;
    let removedFreeCourses = false;
    let removedAlreadyAccessible = false;

    // Free courses should never live in cart; they are directly accessible.
    const nonFreeItems = normalizedCart.items.filter((item) => item.priceCents > 0);
    if (nonFreeItems.length !== normalizedCart.items.length) {
      removedFreeCourses = true;
      normalizedCart = {
        ...normalizedCart,
        items: nonFreeItems,
        totalCents: nonFreeItems.reduce(
          (sum, item) => sum + item.priceCents * item.quantity,
          0
        ),
        itemCount: nonFreeItems.reduce(
          (sum, item) => sum + item.quantity,
          0
        ),
      };
    }

    // If user is logged in, filter out courses they already can access
    const session = await getServerSession(authOptions);
    if (session?.user && normalizedCart.items.length > 0) {
      const accessResults = await Promise.all(
        normalizedCart.items.map(async (item) => ({
          courseId: item.courseId,
          access: await getCourseAccessState(
            session.user.id,
            session.user.role,
            item.courseId
          ),
        }))
      );

      const accessibleCourseIds = new Set(
        accessResults
          .filter(({ access }) => access.granted)
          .map(({ courseId }) => courseId)
      );

      if (accessibleCourseIds.size > 0) {
        const filteredItems = normalizedCart.items.filter(
          (item) => !accessibleCourseIds.has(item.courseId)
        );

        // Update cart if items were removed
        if (filteredItems.length !== normalizedCart.items.length) {
          removedAlreadyAccessible = true;
          normalizedCart = {
            ...normalizedCart,
            items: filteredItems,
            totalCents: filteredItems.reduce(
              (sum, item) => sum + item.priceCents * item.quantity,
              0
            ),
            itemCount: filteredItems.reduce(
              (sum, item) => sum + item.quantity,
              0
            ),
          };
        }
      }
    }

    if (removedFreeCourses || removedAlreadyAccessible) {
      await setCartInCookies(normalizedCart);
      return NextResponse.json({
        ...normalizedCart,
        removedFreeCourses,
        removedAlreadyAccessible,
      });
    }

    return NextResponse.json(normalizedCart);
  } catch (error) {
    console.error("Error getting cart:", error);
    return NextResponse.json({ items: [], totalCents: 0, itemCount: 0 }, { status: 200 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, courseId, quantity, couponCode } = body;

    if (!action) {
      return NextResponse.json({ error: "Action is required" }, { status: 400 });
    }

    const currentCart = await getCartFromCookies();

    // Helper to save cart and return response
    const saveAndReturn = async (items: CartItem[], couponCode: string | null = null, discountTotal: number = 0) => {
      const totalCents = items.reduce((sum, item) => sum + item.priceCents * item.quantity, 0);
      const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);
      const finalTotal = Math.max(0, totalCents - discountTotal);

      const newCart = {
        items,
        totalCents,
        itemCount,
        couponCode: couponCode,
        discountTotal,
        finalTotal,
      };

      await setCartInCookies(newCart);
      return NextResponse.json(newCart);
    };

    if (action === "add") {
      if (!courseId) {
        return NextResponse.json({ error: "Course ID is required" }, { status: 400 });
      }

      // Fetch course
      const course = await prisma.course.findUnique({
        where: { id: courseId },
        select: { id: true, slug: true, title: true, priceCents: true, inventory: true, tier: true },
      });

      if (!course) {
        return NextResponse.json({ error: "Course not found" }, { status: 404 });
      }

      if (course.priceCents === 0) {
        return NextResponse.json(
          { error: "This course is free and already available without checkout." },
          { status: 400 }
        );
      }

      // Check access/ownership
      const session = await getServerSession(authOptions);
      if (session?.user) {
        const access = await getCourseAccessState(
          session.user.id,
          session.user.role,
          course.id
        );

        if (access.granted) {
          const message =
            access.source === "subscription"
              ? "This course is already included in your active subscription."
              : "You already have access to this course.";

          return NextResponse.json({ error: message }, { status: 400 });
        }
      }

      // Inventory check
      const existingCartItem = currentCart.items.find((item) => item.courseId === courseId);
      const currentQuantity = existingCartItem?.quantity || 0;
      if (course.inventory !== null && (currentQuantity + 1) > course.inventory) {
        return NextResponse.json({ error: `Only ${course.inventory} available in inventory` }, { status: 400 });
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
      // Reset coupon on cart change (simple policy) or keep it (complex)?
      // For simplicity, let's keep it but ideally we should re-validate.
      // If we keep existing coupon, we need to re-calc discount if it was percentage.
      // Simplest MVP: Remove coupon on cart modification to ensure validity.
      return saveAndReturn(updatedItems, null, 0);
    }

    if (action === "updateQuantity") {
      if (!courseId || quantity === undefined) return NextResponse.json({ error: "Missing params" }, { status: 400 });

      const course = await prisma.course.findUnique({
        where: { id: courseId },
        select: { inventory: true },
      });
      if (!course) return NextResponse.json({ error: "Course not found" }, { status: 404 });
      if (course.inventory !== null && quantity > course.inventory) {
        return NextResponse.json({ error: `Only ${course.inventory} available` }, { status: 400 });
      }

      const updatedItems = updateItemQuantity(currentCart.items, courseId, quantity);
      return saveAndReturn(updatedItems, null, 0); // Reset coupon
    }

    if (action === "remove") {
      if (!courseId) return NextResponse.json({ error: "Course ID required" }, { status: 400 });
      const updatedItems = removeItemFromCart(currentCart.items, courseId);
      return saveAndReturn(updatedItems, null, 0); // Reset coupon
    }

    if (action === "clear") {
      await setCartInCookies(clearCart());
      return NextResponse.json({ items: [], totalCents: 0, itemCount: 0, couponCode: null, discountTotal: 0, finalTotal: 0 });
    }

    if (action === "applyCoupon") {
      if (!couponCode) return NextResponse.json({ error: "Coupon code required" }, { status: 400 });

      const coupon = await prisma.coupon.findUnique({
        where: { code: couponCode.toUpperCase() },
      });

      if (!coupon) return NextResponse.json({ error: "Invalid coupon code" }, { status: 400 });
      if (!coupon.isActive) return NextResponse.json({ error: "Coupon is inactive" }, { status: 400 });

      const now = new Date();
      if (coupon.startDate > now) return NextResponse.json({ error: "Coupon not yet active" }, { status: 400 });
      if (coupon.endDate && coupon.endDate < now) return NextResponse.json({ error: "Coupon expired" }, { status: 400 });
      if (coupon.maxUses && coupon.usedCount >= coupon.maxUses) return NextResponse.json({ error: "Coupon usage limit reached" }, { status: 400 });

      const totalCents = currentCart.items.reduce((sum, item) => sum + item.priceCents * item.quantity, 0);

      if (coupon.minOrderAmount && totalCents < coupon.minOrderAmount) {
        return NextResponse.json({ error: `Minimum order of ${(coupon.minOrderAmount / 100).toFixed(2)} required` }, { status: 400 });
      }

      let discount = 0;
      if (coupon.discountType === "FIXED") {
        discount = coupon.discountAmount;
      } else {
        discount = Math.round(totalCents * (coupon.discountAmount / 100));
        if (coupon.maxDiscountAmount && discount > coupon.maxDiscountAmount) {
          discount = coupon.maxDiscountAmount;
        }
      }

      // Ensure discount doesn't exceed total
      discount = Math.min(discount, totalCents);

      return saveAndReturn(currentCart.items, coupon.code, discount);
    }

    if (action === "removeCoupon") {
      return saveAndReturn(currentCart.items, null, 0);
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
