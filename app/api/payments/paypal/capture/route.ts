import { NextResponse } from "next/server";
import { capturePayPalOrder } from "@/lib/paypal";
import { prisma } from "@/lib/prisma";
import { checkRateLimit } from "@/lib/api-helpers";
import type { PayPalCaptureResponse } from "@/lib/paypal-types";
import { logger } from "@/lib/logger";

function getCaptureId(payload: PayPalCaptureResponse): string | null {
  return payload?.purchase_units?.[0]?.payments?.captures?.[0]?.id ?? null;
}

function getBaseUrl(requestUrl: URL): string {
  // Use NEXTAUTH_URL if available (preferred)
  const nextAuthUrl = process.env.NEXTAUTH_URL;
  if (nextAuthUrl) {
    return nextAuthUrl;
  }
  
  // In production, fail if NEXTAUTH_URL is not set
  if (process.env.NODE_ENV === "production") {
    throw new Error("NEXTAUTH_URL environment variable is required in production");
  }
  
  // Development fallback: construct from request URL but ensure HTTP for localhost
  const origin = requestUrl.origin;
  if (origin.includes('localhost') || origin.includes('127.0.0.1')) {
    return origin.replace('https://', 'http://');
  }
  
  return origin;
}

function generateInvoiceNumber(purchaseId: string): string {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const suffix = purchaseId.slice(-8).toUpperCase();
  return `INV-${year}${month}${day}-${suffix}`;
}

function formatPaymentMethod(provider: string | undefined): string {
  if (!provider) return "PayPal";
  return provider.charAt(0).toUpperCase() + provider.slice(1);
}

export async function GET(request: Request) {
  // Rate limiting for payment capture endpoint
  const rateLimitResponse = await checkRateLimit(request as any, "api");
  if (rateLimitResponse) {
    return rateLimitResponse;
  }

  const url = new URL(request.url);
  const baseUrl = getBaseUrl(url);
  const orderId = url.searchParams.get("token");
  const purchaseIdsParam = url.searchParams.get("purchases");

  if (!orderId) {
    return NextResponse.redirect(new URL("/courses", baseUrl));
  }

  // Handle multiple purchases (learning path enrollment)
  if (purchaseIdsParam) {
    const purchaseIds = purchaseIdsParam.split(",");
    const purchases = await prisma.purchase.findMany({
      where: {
        id: { in: purchaseIds },
        providerRef: orderId,
      },
      include: { Course: true },
    });

    if (purchases.length === 0) {
      return NextResponse.redirect(new URL("/courses", baseUrl));
    }

    const capture = await capturePayPalOrder(orderId);

    if (capture?.status !== "COMPLETED") {
      const user = await prisma.user.findUnique({
        where: { id: purchases[0].userId },
        select: { email: true },
      });

      if (user) {
        try {
          const { sendPurchaseFailedEmail } = await import("@/lib/email");
          await sendPurchaseFailedEmail(
            user.email,
            "Learning Path",
            "Payment capture failed"
          );
        } catch (error) {
          logger.error("Failed to send purchase failure email", { userId: purchases[0].userId }, error instanceof Error ? error : undefined);
        }
      }

      return NextResponse.redirect(
        new URL(`/learning-paths?checkout=failed`, baseUrl)
      );
    }

    // Process all purchases in a transaction to prevent race conditions
    await prisma.$transaction(async (tx) => {
      for (const purchase of purchases) {
        // Check if already processed (idempotency check)
        const existingPurchase = await tx.purchase.findUnique({
          where: { id: purchase.id },
          select: { status: true },
        });

        if (existingPurchase?.status === "paid") {
          continue; // Already processed, skip
        }

        // Update purchase status atomically
        await tx.purchase.update({
          where: { id: purchase.id },
          data: { status: "paid" },
        });

        // Decrement inventory atomically with validation
        if (purchase.Course.inventory !== null) {
          const updatedCourse = await tx.course.updateMany({
            where: {
              id: purchase.courseId,
              inventory: { gt: 0 }, // Only update if inventory > 0
            },
            data: {
              inventory: { decrement: 1 },
            },
          });

          if (updatedCourse.count === 0) {
            throw new Error(`Course ${purchase.courseId} is out of stock`);
          }
        }

        // Create/update enrollment
        await tx.enrollment.upsert({
          where: {
            userId_courseId: {
              userId: purchase.userId,
              courseId: purchase.courseId,
            },
          },
          update: { purchaseId: purchase.id },
          create: {
            id: `enrollment_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
            userId: purchase.userId,
            courseId: purchase.courseId,
            purchaseId: purchase.id,
          },
        });

        // Create payment record
        await tx.payment.create({
          data: {
            id: `payment_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
            userId: purchase.userId,
            purchaseId: purchase.id,
            provider: "paypal",
            providerRef: getCaptureId(capture) ?? orderId,
            amountCents: purchase.amountCents,
            currency: purchase.currency,
            status: "paid",
          },
        });

        // Create activity log
        await tx.activityLog.create({
          data: {
            id: `activity_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
            userId: purchase.userId,
            type: "purchase_completed",
            metadata: {
              purchaseId: purchase.id,
              courseId: purchase.courseId,
              courseTitle: purchase.Course.title,
              courseSlug: purchase.Course.slug,
            },
          },
        });
      }
    });

    // Track analytics outside transaction (non-critical)
    for (const purchase of purchases) {
      try {
        const { trackPurchase } = await import("@/lib/analytics");
        trackPurchase(purchase.courseId, purchase.amountCents, purchase.userId);
      } catch (error) {
        logger.error("Failed to track purchase analytics", { purchaseId: purchase.id }, error instanceof Error ? error : undefined);
      }
    }

    // Fetch payment for invoice
    const payment = await prisma.payment.findFirst({
      where: { purchaseId: purchases[0].id },
      orderBy: { createdAt: "desc" },
    });

    // Send email notifications
    const user = await prisma.user.findUnique({
      where: { id: purchases[0].userId },
      select: { email: true, name: true },
    });

    if (user) {
      try {
        const { sendPurchaseConfirmationEmail, sendEnrollmentEmail, sendInvoiceEmail } = await import("@/lib/email");
        const courseTitles = purchases.map((p) => p.Course.title).join(", ");
        const totalAmount = purchases.reduce((sum, p) => sum + p.amountCents, 0);
        const invoiceNumber = generateInvoiceNumber(purchases[0].id);
        const purchaseDate = payment?.createdAt || purchases[0].createdAt;
        
        await Promise.all([
          sendPurchaseConfirmationEmail(user.email, courseTitles, totalAmount),
          ...purchases.map((p) => sendEnrollmentEmail(user.email, p.Course.title)),
          sendInvoiceEmail(
            user.email,
            user.name || "Customer",
            invoiceNumber,
            purchaseDate,
            purchases.map((p) => ({
              title: p.Course.title,
              description: p.Course.description || undefined,
              amountCents: p.amountCents,
              currency: p.currency,
            })),
            formatPaymentMethod(payment?.provider),
            payment?.providerRef || undefined
          ),
        ]);
      } catch (error) {
        logger.error("Failed to send email notifications", { userId: purchases[0].userId }, error instanceof Error ? error : undefined);
      }
    }

    // Redirect to success page with invoice
    const purchasesQuery = purchaseIds.join(",");
    return NextResponse.redirect(
      new URL(`/purchase/success?purchases=${encodeURIComponent(purchasesQuery)}`, baseUrl)
    );
  }

  // Single purchase (existing flow)
  const purchase = await prisma.purchase.findFirst({
    where: { providerRef: orderId },
    include: { Course: true },
  });

  if (!purchase) {
    return NextResponse.redirect(new URL("/courses", baseUrl));
  }

  // Idempotency check - if already paid, redirect to success
  if (purchase.status === "paid") {
    return NextResponse.redirect(
      new URL(`/purchase/success?purchase=${encodeURIComponent(purchase.id)}`, baseUrl)
    );
  }

  const capture = await capturePayPalOrder(orderId);

  if (capture?.status !== "COMPLETED") {
    // Send failure email if user exists
    const user = await prisma.user.findUnique({
      where: { id: purchase.userId },
      select: { email: true },
    });

    if (user && purchase.Course) {
      try {
        const { sendPurchaseFailedEmail } = await import("@/lib/email");
        await sendPurchaseFailedEmail(
          user.email,
          purchase.Course.title,
          "Payment capture failed"
        );
      } catch (error) {
        console.error("Failed to send failure email:", error);
      }
    }

    return NextResponse.redirect(
      new URL(`/courses/${purchase.Course.slug}?checkout=failed`, baseUrl)
    );
  }

  // Process purchase in transaction to ensure atomicity
  await prisma.$transaction(async (tx) => {
    // Double-check status within transaction (race condition prevention)
    const currentPurchase = await tx.purchase.findUnique({
      where: { id: purchase.id },
      select: { status: true },
    });

    if (currentPurchase?.status === "paid") {
      return; // Already processed by another request
    }

    // Update purchase status
    await tx.purchase.update({
      where: { id: purchase.id },
      data: { status: "paid" },
    });

    // Decrement inventory atomically with validation
    if (purchase.Course.inventory !== null) {
      const updatedCourse = await tx.course.updateMany({
        where: {
          id: purchase.courseId,
          inventory: { gt: 0 }, // Only update if inventory > 0
        },
        data: {
          inventory: { decrement: 1 },
        },
      });

      if (updatedCourse.count === 0) {
        throw new Error(`Course ${purchase.courseId} is out of stock`);
      }
    }

    // Create/update enrollment
    await tx.enrollment.upsert({
      where: {
        userId_courseId: {
          userId: purchase.userId,
          courseId: purchase.courseId,
        },
      },
      update: { purchaseId: purchase.id },
      create: {
        id: `enrollment_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
        userId: purchase.userId,
        courseId: purchase.courseId,
        purchaseId: purchase.id,
      },
    });

    // Create payment record
    await tx.payment.create({
      data: {
        id: `payment_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
        userId: purchase.userId,
        purchaseId: purchase.id,
        provider: "paypal",
        providerRef: getCaptureId(capture) ?? orderId,
        amountCents: purchase.amountCents,
        currency: purchase.currency,
        status: "paid",
      },
    });

    // Create activity log
    await tx.activityLog.create({
      data: {
        id: `activity_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
        userId: purchase.userId,
        type: "purchase_completed",
        metadata: {
          purchaseId: purchase.id,
          courseId: purchase.courseId,
          courseTitle: purchase.Course.title,
          courseSlug: purchase.Course.slug,
        },
      },
    });
  });

  // Fetch payment for invoice (after transaction)
  const payment = await prisma.payment.findFirst({
    where: { purchaseId: purchase.id },
    orderBy: { createdAt: "desc" },
  });

  // Send email notifications (outside transaction - non-critical)
  const user = await prisma.user.findUnique({
    where: { id: purchase.userId },
    select: { email: true, name: true },
  });

  if (user && purchase.Course) {
    try {
      const { sendPurchaseConfirmationEmail, sendEnrollmentEmail, sendInvoiceEmail } = await import("@/lib/email");
      const invoiceNumber = generateInvoiceNumber(purchase.id);
      const purchaseDate = payment?.createdAt || purchase.createdAt;
      
      await Promise.all([
        sendPurchaseConfirmationEmail(user.email, purchase.Course.title, purchase.amountCents),
        sendEnrollmentEmail(user.email, purchase.Course.title),
        sendInvoiceEmail(
          user.email,
          user.name || "Customer",
          invoiceNumber,
          purchaseDate,
          [{
            title: purchase.Course.title,
            description: purchase.Course.description || undefined,
            amountCents: purchase.amountCents,
            currency: purchase.currency,
          }],
          formatPaymentMethod(payment?.provider),
          payment?.providerRef || undefined
        ),
      ]);
    } catch (error) {
      logger.error("Failed to send email notifications", { userId: purchase.userId }, error instanceof Error ? error : undefined);
      // Don't fail the capture if email fails
    }
  }

  // Track analytics (outside transaction - non-critical)
  try {
    const { trackPurchase } = await import("@/lib/analytics");
    trackPurchase(purchase.courseId, purchase.amountCents, purchase.userId);
  } catch (error) {
    logger.error("Failed to track purchase analytics", { purchaseId: purchase.id }, error instanceof Error ? error : undefined);
  }

  // Redirect to success page with invoice
  return NextResponse.redirect(
    new URL(`/purchase/success?purchase=${encodeURIComponent(purchase.id)}`, baseUrl)
  );
}
