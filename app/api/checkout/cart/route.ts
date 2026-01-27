import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createPayPalOrder } from "@/lib/paypal";
import { isAdmin } from "@/lib/access";

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Block admins from purchasing courses
    if (isAdmin(session.user.role)) {
      return NextResponse.json(
        { error: "Admins cannot purchase courses" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { courseIds } = body;

    if (!courseIds || !Array.isArray(courseIds) || courseIds.length === 0) {
      return NextResponse.json({ error: "Course IDs are required" }, { status: 400 });
    }

    // Fetch courses with validation
    const courses = await prisma.course.findMany({
      where: { 
        id: { in: courseIds },
        isPublished: true, // Only allow purchase of published courses
      },
    });

    if (courses.length !== courseIds.length) {
      const foundIds = new Set(courses.map(c => c.id));
      const missingIds = courseIds.filter(id => !foundIds.has(id));
      return NextResponse.json({ 
        error: "Some courses not found or not published",
        missingCourseIds: missingIds,
      }, { status: 404 });
    }

    // Validate courses are not deleted (check if any have null titles/descriptions)
    const invalidCourses = courses.filter(c => !c.title || !c.slug);
    if (invalidCourses.length > 0) {
      return NextResponse.json({ 
        error: "Some courses are invalid",
        invalidCourseIds: invalidCourses.map(c => c.id),
      }, { status: 400 });
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

    // Check inventory availability
    const outOfStockCourses = coursesToPurchase.filter(
      (course) => course.inventory !== null && course.inventory <= 0
    );

    if (outOfStockCourses.length > 0) {
      return NextResponse.json(
        { 
          error: `Some courses are out of stock: ${outOfStockCourses.map(c => c.title).join(", ")}`,
          outOfStock: outOfStockCourses.map(c => c.id),
        },
        { status: 400 }
      );
    }

    // Create purchases
    const purchases = await Promise.all(
      coursesToPurchase.map((course) => {
        const purchaseId = `purchase_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
        
        return prisma.purchase.upsert({
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
            id: purchaseId,
            userId: session.user.id,
            courseId: course.id,
            amountCents: course.priceCents,
            currency: "usd",
            status: "pending",
            provider: "paypal",
          },
        });
      })
    );

    const totalAmountCents = purchases.reduce((sum, p) => sum + p.amountCents, 0);
    const purchaseIds = purchases.map((p) => p.id).join(",");
    
    // Get app URL from environment - fail if not set in production
    const appUrl = process.env.NEXTAUTH_URL;
    if (!appUrl) {
      if (process.env.NODE_ENV === "production") {
        throw new Error("NEXTAUTH_URL environment variable is required");
      }
      // Only allow localhost fallback in development
      return NextResponse.json(
        {
          error: {
            message: "Server configuration error: NEXTAUTH_URL not set",
            code: "CONFIGURATION_ERROR",
          },
        },
        { status: 500 }
      );
    }

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
