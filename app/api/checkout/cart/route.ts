import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createPayPalOrder } from "@/lib/paypal";
import { getCartFromCookies } from "@/lib/cart/utils";

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { courseIds } = body;

    if (!courseIds || !Array.isArray(courseIds) || courseIds.length === 0) {
      return NextResponse.json({ error: "Course IDs are required" }, { status: 400 });
    }

    // Fetch courses
    const courses = await prisma.course.findMany({
      where: { id: { in: courseIds } },
    });

    if (courses.length !== courseIds.length) {
      return NextResponse.json({ error: "Some courses not found" }, { status: 404 });
    }

    // Check for existing purchases
    const existingPurchases = await prisma.purchase.findMany({
      where: {
        userId: session.user.id,
        courseId: { in: courseIds },
        status: "paid",
      },
    });

    const purchasedCourseIds = new Set(existingPurchases.map((p) => p.courseId));
    const coursesToPurchase = courses.filter((c) => !purchasedCourseIds.has(c.id));

    if (coursesToPurchase.length === 0) {
      return NextResponse.json(
        { error: "You already own all selected courses" },
        { status: 400 }
      );
    }

    // Create purchases
    const purchases = await Promise.all(
      coursesToPurchase.map((course) =>
        prisma.purchase.upsert({
          where: {
            userId_courseId: {
              userId: session.user.id,
              courseId: course.id,
            },
          },
          update: {
            status: "pending",
            provider: "paypal",
            amountCents: course.priceCents,
          },
          create: {
            userId: session.user.id,
            courseId: course.id,
            amountCents: course.priceCents,
            currency: "usd",
            status: "pending",
            provider: "paypal",
          },
        })
      )
    );

    const totalAmountCents = purchases.reduce((sum, p) => sum + p.amountCents, 0);
    const purchaseIds = purchases.map((p) => p.id).join(",");
    const appUrl = process.env.NEXTAUTH_URL ?? "http://localhost:3000";

    const { orderId, approvalUrl } = await createPayPalOrder({
      amountCents: totalAmountCents,
      currency: "usd",
      returnUrl: `${appUrl}/api/payments/paypal/capture?purchases=${encodeURIComponent(purchaseIds)}`,
      cancelUrl: `${appUrl}/cart?checkout=cancelled`,
      purchaseId: purchases[0].id,
    });

    // Update all purchases with order ID
    await prisma.purchase.updateMany({
      where: {
        id: { in: purchases.map((p) => p.id) },
      },
      data: {
        providerRef: orderId,
      },
    });

    return NextResponse.json({
      orderId,
      approvalUrl,
    });
  } catch (error) {
    console.error("Error creating cart checkout:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to create checkout" },
      { status: 500 }
    );
  }
}
