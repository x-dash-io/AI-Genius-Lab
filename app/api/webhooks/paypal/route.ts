import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyPayPalWebhook } from "@/lib/paypal";
import { checkRateLimit } from "@/lib/api-helpers";
import type { PayPalWebhookEvent } from "@/lib/paypal-types";
import { logger } from "@/lib/logger";

function getOrderId(event: PayPalWebhookEvent): string | null {
  return (
    event.resource?.supplementary_data?.related_ids?.order_id ??
    event.resource?.id ??
    null
  );
}

export async function POST(request: Request) {
  // Rate limiting for webhook endpoint (more lenient for webhooks)
  const rateLimitResponse = await checkRateLimit(request as any, "api");
  if (rateLimitResponse) {
    return rateLimitResponse;
  }

  try {
    const bodyText = await request.text();
    const event = JSON.parse(bodyText) as PayPalWebhookEvent;

    logger.info("PayPal webhook event received", { eventType: event.event_type });

    const transmissionId = request.headers.get("paypal-transmission-id");
    const transmissionTime = request.headers.get("paypal-transmission-time");
    const transmissionSig = request.headers.get("paypal-transmission-sig");
    const certUrl = request.headers.get("paypal-cert-url");
    const authAlgo = request.headers.get("paypal-auth-algo");

    if (
      !transmissionId ||
      !transmissionTime ||
      !transmissionSig ||
      !certUrl ||
      !authAlgo
    ) {
      logger.error("Missing PayPal webhook headers", { transmissionId });
      return NextResponse.json({ error: "Missing PayPal headers" }, { status: 400 });
    }

    logger.debug("Verifying PayPal webhook signature", { transmissionId });
    const verified = await verifyPayPalWebhook({
      transmissionId,
      transmissionTime,
      transmissionSig,
      certUrl,
      authAlgo,
      webhookEvent: event,
    });

    if (!verified) {
      logger.error("PayPal webhook signature verification failed", { transmissionId });
      return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
    }

    logger.info("PayPal webhook signature verified", { transmissionId });

    if (
      event.event_type !== "PAYMENT.CAPTURE.COMPLETED" &&
      event.event_type !== "CHECKOUT.ORDER.APPROVED"
    ) {
      logger.debug("Ignoring PayPal webhook event type", { eventType: event.event_type });
      return NextResponse.json({ received: true });
    }

    const orderId = getOrderId(event);
    if (!orderId) {
      logger.error("Missing order ID in PayPal webhook event", { eventType: event.event_type });
      return NextResponse.json({ error: "Missing order id" }, { status: 400 });
    }

    logger.info("Processing PayPal webhook", { orderId, eventType: event.event_type });

    // Use transaction to prevent race condition with capture endpoint
    const result = await prisma.$transaction(async (tx) => {
      // Find purchase within transaction
      const purchase = await tx.purchase.findFirst({
        where: { providerRef: orderId },
        include: { Course: true },
      });

      if (!purchase) {
        logger.error("Purchase not found for PayPal order", { orderId });
        return { success: false, alreadyProcessed: false };
      }

      // Check if already processed (idempotency check within transaction)
      if (purchase.status === "paid") {
        logger.warn("Purchase already processed", { purchaseId: purchase.id, orderId });
        return { success: true, alreadyProcessed: true, purchase };
      }

      logger.info("Updating purchase status", { purchaseId: purchase.id, orderId });
      
      // Update purchase status atomically
      await tx.purchase.update({
        where: { id: purchase.id },
        data: { status: "paid" },
      });
      logger.info("Purchase status updated", { purchaseId: purchase.id });

      // Decrement inventory atomically with validation
      if (purchase.Course.inventory !== null) {
        logger.debug("Decrementing course inventory", { courseId: purchase.courseId });
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
          logger.warn("Course out of stock during webhook processing", { courseId: purchase.courseId });
          // Don't throw - allow enrollment but log warning
        }
      }

      // Create/update enrollment
      logger.debug("Creating/updating enrollment", { userId: purchase.userId, courseId: purchase.courseId });
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
      logger.debug("Enrollment created/updated", { userId: purchase.userId, courseId: purchase.courseId });

      // Create payment record
      logger.debug("Creating payment record", { purchaseId: purchase.id });
      await tx.payment.create({
        data: {
          id: `payment_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
          userId: purchase.userId,
          purchaseId: purchase.id,
          provider: "paypal",
          providerRef: orderId,
          amountCents: purchase.amountCents,
          currency: purchase.currency,
          status: "paid",
        },
      });

      // Create activity log
      logger.debug("Creating activity log", { userId: purchase.userId });
      await tx.activityLog.create({
        data: {
          id: `activity_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
          userId: purchase.userId,
          type: "purchase_completed",
          metadata: {
            purchaseId: purchase.id,
            courseId: purchase.courseId,
          },
        },
      });

      return { success: true, alreadyProcessed: false, purchase };
    });

    // If already processed, return success
    if (result.alreadyProcessed) {
      return NextResponse.json({ received: true });
    }

    // If processing failed, return success to avoid redelivery (but log error)
    if (!result.success || !result.purchase) {
      logger.error("Failed to process purchase in webhook", { orderId });
      return NextResponse.json({ received: true });
    }

    const purchase = result.purchase;

    // Send email notifications (outside transaction - non-critical)
    logger.debug("Fetching user and course details for email", { purchaseId: purchase.id });
    const user = await prisma.user.findUnique({
      where: { id: purchase.userId },
      select: { email: true },
    });

    const course = await prisma.course.findUnique({
      where: { id: purchase.courseId },
      select: { title: true },
    });

    if (user && course) {
      try {
        logger.info("Sending purchase confirmation emails", { userId: purchase.userId, email: user.email });
        const { sendPurchaseConfirmationEmail, sendEnrollmentEmail } = await import("@/lib/email");
        await Promise.all([
          sendPurchaseConfirmationEmail(user.email, course.title, purchase.amountCents),
          sendEnrollmentEmail(user.email, course.title),
        ]);
        logger.info("Purchase confirmation emails sent", { userId: purchase.userId });
      } catch (error) {
        logger.error("Failed to send email notifications", { userId: purchase.userId }, error instanceof Error ? error : undefined);
        // Don't fail the webhook if email fails
      }
    } else {
      logger.warn("Could not send emails - user or course not found", { userId: purchase.userId, courseId: purchase.courseId });
    }

    logger.info("PayPal webhook processing completed", { purchaseId: purchase.id, orderId });
    return NextResponse.json({ received: true });
  } catch (error) {
    logger.error("Critical error processing PayPal webhook", {}, error instanceof Error ? error : undefined);
    if (error instanceof Error) {
      
      // Return 500 for transient errors to trigger PayPal retry
      // Return 200 for business logic errors to avoid infinite retries
      const isTransientError = 
        error.message.includes("connection") ||
        error.message.includes("timeout") ||
        error.message.includes("ECONNREFUSED") ||
        error.message.includes("ETIMEDOUT");
      
      if (isTransientError) {
        logger.warn("Transient error in PayPal webhook, will retry", {}, error);
        return NextResponse.json(
          { error: "Transient error, will retry" },
          { status: 500 }
        );
      }
    }
    
    // For non-transient errors, return 200 to avoid infinite retries
    // But log the error for investigation
    logger.error("Non-transient error in PayPal webhook", {}, error instanceof Error ? error : undefined);
    return NextResponse.json(
      { received: true, error: "Processing error logged" },
      { status: 200 }
    );
  }
}
