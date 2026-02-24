import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createPayPalOrder } from "@/lib/paypal";
import { getCourseAccessState, isAdmin } from "@/lib/access";
import { getCartFromCookies } from "@/lib/cart/utils";

function generateId(prefix: string) {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

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

    // Fetch courses
    const courses = await prisma.course.findMany({
      where: { id: { in: courseIds } },
    });

    if (courses.length !== courseIds.length) {
      return NextResponse.json({ error: "Some courses not found" }, { status: 404 });
    }

    const accessStates = await Promise.all(
      courses.map(async (course) => ({
        course,
        access: await getCourseAccessState(
          session.user.id,
          session.user.role,
          course.id
        ),
      }))
    );

    const coursesToPurchase = accessStates
      .filter(({ access }) => !access.granted)
      .map(({ course }) => course);

    if (coursesToPurchase.length === 0) {
      return NextResponse.json(
        { error: "All selected courses are already available in your library." },
        { status: 400 }
      );
    }

    // Get Cart for Coupon Info
    const cart = await getCartFromCookies();
    let coupon = null;
    let discountTotal = 0;

    if (cart.couponCode) {
      coupon = await prisma.coupon.findUnique({
        where: { code: cart.couponCode },
      });

      if (coupon && coupon.isActive) {
        // Validate coupon again just to be safe
        const now = new Date();
        if ((coupon.startDate <= now) && (!coupon.endDate || coupon.endDate >= now)) {
          if (!coupon.maxUses || coupon.usedCount < coupon.maxUses) {
            // Calculate discount
            const totalCents = coursesToPurchase.reduce((sum, c) => sum + c.priceCents, 0);
            if (!coupon.minOrderAmount || totalCents >= coupon.minOrderAmount) {
              if (coupon.discountType === "FIXED") {
                discountTotal = Math.min(coupon.discountAmount, totalCents);
              } else {
                discountTotal = Math.round(totalCents * (coupon.discountAmount / 100));
                if (coupon.maxDiscountAmount) {
                  discountTotal = Math.min(discountTotal, coupon.maxDiscountAmount);
                }
              }
            }
          }
        }
      }
    }

    // Check inventory availability
    const outOfStockCourses = coursesToPurchase.filter(
      (course) => course.inventory !== null && course.inventory <= 0
    );

    if (outOfStockCourses.length > 0) {
      return NextResponse.json(
        {
          error: `Some courses are out of stock: ${outOfStockCourses.map((course) => course.title).join(", ")}`,
          outOfStock: outOfStockCourses.map((course) => course.id),
        },
        { status: 400 }
      );
    }

    // Calculate pro-rated discount per item
    // Simplification: We will just deduct detailed amounts if possible, or just store the final amount paid per item
    // Pro-rating: itemPrice - (itemPrice / totalOriginalPrice * totalDiscount)
    const totalOriginalPrice = coursesToPurchase.reduce((sum, c) => sum + c.priceCents, 0);

    const purchaseDrafts = coursesToPurchase.map((course) => {
      let amountToPay = course.priceCents;
      let itemDiscount = 0;

      if (discountTotal > 0 && totalOriginalPrice > 0) {
        const ratio = course.priceCents / totalOriginalPrice;
        itemDiscount = Math.round(discountTotal * ratio);
        amountToPay = Math.max(0, course.priceCents - itemDiscount);
      }

      return { course, amountToPay, itemDiscount };
    });

    const totalAmountCents = purchaseDrafts.reduce((sum, draft) => sum + draft.amountToPay, 0);

    // Create purchases
    const purchases = await Promise.all(
      purchaseDrafts.map(({ course, amountToPay, itemDiscount }) =>
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
            providerRef: null,
            amountCents: amountToPay,
            couponId: coupon?.id,
            priceOriginalCents: course.priceCents,
            priceDiscountCents: itemDiscount,
            pricingSnapshot: {
              couponId: coupon?.id ?? null,
              couponCode: coupon?.code ?? null,
              discountType: coupon?.discountType ?? null,
              discountAmount: coupon?.discountAmount ?? null,
              discountAppliedCents: itemDiscount,
              totalOrderDiscountCents: discountTotal,
              originalPriceCents: course.priceCents,
              finalPriceCents: amountToPay,
            },
          },
          create: {
            id: generateId("purchase"),
            userId: session.user.id,
            courseId: course.id,
            amountCents: amountToPay,
            currency: "usd",
            status: "pending",
            provider: "paypal",
            couponId: coupon?.id,
            priceOriginalCents: course.priceCents,
            priceDiscountCents: itemDiscount,
            pricingSnapshot: {
              couponId: coupon?.id ?? null,
              couponCode: coupon?.code ?? null,
              discountType: coupon?.discountType ?? null,
              discountAmount: coupon?.discountAmount ?? null,
              discountAppliedCents: itemDiscount,
              totalOrderDiscountCents: discountTotal,
              originalPriceCents: course.priceCents,
              finalPriceCents: amountToPay,
            },
          },
        })
      )
    );

    const courseMap = new Map(coursesToPurchase.map((course) => [course.id, course]));

    if (totalAmountCents === 0) {
      await Promise.all(
        purchases.map(async (purchase) => {
          const purchasedCourse = courseMap.get(purchase.courseId);

          await prisma.purchase.update({
            where: { id: purchase.id },
            data: {
              status: "paid",
              provider: "free",
              providerRef: null,
              amountCents: 0,
            },
          });

          if (purchasedCourse && purchasedCourse.inventory !== null) {
            await prisma.course.updateMany({
              where: {
                id: purchasedCourse.id,
                inventory: { gt: 0 },
              },
              data: {
                inventory: {
                  decrement: 1,
                },
              },
            });
          }

          await prisma.enrollment.upsert({
            where: {
              userId_courseId: {
                userId: purchase.userId,
                courseId: purchase.courseId,
              },
            },
            update: { purchaseId: purchase.id },
            create: {
              id: generateId("enrollment"),
              userId: purchase.userId,
              courseId: purchase.courseId,
              purchaseId: purchase.id,
            },
          });

          const existingPaidPayment = await prisma.payment.findFirst({
            where: {
              purchaseId: purchase.id,
              status: "paid",
            },
          });

          if (!existingPaidPayment) {
            await prisma.payment.create({
              data: {
                id: generateId("payment"),
                userId: purchase.userId,
                purchaseId: purchase.id,
                provider: "free",
                providerRef: null,
                amountCents: 0,
                currency: purchase.currency,
                status: "paid",
              },
            });
          }

          await prisma.activityLog.create({
            data: {
              id: generateId("activity"),
              userId: purchase.userId,
              type: "purchase_completed",
              metadata: {
                purchaseId: purchase.id,
                courseId: purchase.courseId,
                courseTitle: purchasedCourse?.title ?? "Course",
                courseSlug: purchasedCourse?.slug ?? "",
              },
            },
          });

          try {
            const { trackPurchase } = await import("@/lib/analytics");
            trackPurchase(purchase.courseId, 0, purchase.userId);
          } catch (error) {
            console.error("Failed to track free cart purchase analytics:", error);
          }
        })
      );

      const purchasesQuery = purchases.map((purchase) => purchase.id).join(",");
      return NextResponse.json({
        redirectUrl: `/purchase/success?purchases=${purchasesQuery}`,
      });
    }

    // Increment coupon usage if used (optimistic usage count, finalized on webhook?)
    // Actually, we should probably increment usage ONLY when paid. 
    // But PayPal flow is async. We might link it now.
    // If we increment now, and they cancel, it's bad.
    // Better to increment in the webhook when 'paid'.
    // However, validation 'usedCount' check earlier might fail if many pending. 
    // For now, let's leave incrementing to the payment success handler (webhook).

    // Total might differ slightly due to rounding, but it's what we are charging.

    const purchaseIds = purchases.map((purchase) => purchase.id).join(",");
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
        id: { in: purchases.map((purchase) => purchase.id) },
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
