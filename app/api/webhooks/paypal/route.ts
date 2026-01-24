import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyPayPalWebhook } from "@/lib/paypal";

type PayPalEvent = {
  event_type?: string;
  resource?: {
    id?: string;
    supplementary_data?: {
      related_ids?: {
        order_id?: string;
      };
    };
  };
};

function getOrderId(event: PayPalEvent) {
  return (
    event.resource?.supplementary_data?.related_ids?.order_id ??
    event.resource?.id ??
    null
  );
}

export async function POST(request: Request) {
  try {
    const bodyText = await request.text();
    const event = JSON.parse(bodyText) as PayPalEvent;

    console.log(`[WEBHOOK] PayPal event received: ${event.event_type}`);

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
      console.error("[WEBHOOK] Missing PayPal headers");
      return NextResponse.json({ error: "Missing PayPal headers" }, { status: 400 });
    }

    console.log(`[WEBHOOK] Verifying webhook signature...`);
    const verified = await verifyPayPalWebhook({
      transmissionId,
      transmissionTime,
      transmissionSig,
      certUrl,
      authAlgo,
      webhookEvent: event,
    });

    if (!verified) {
      console.error("[WEBHOOK] Invalid signature verification failed");
      return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
    }

    console.log(`[WEBHOOK] Signature verified successfully`);

    if (
      event.event_type !== "PAYMENT.CAPTURE.COMPLETED" &&
      event.event_type !== "CHECKOUT.ORDER.APPROVED"
    ) {
      console.log(`[WEBHOOK] Ignoring event type: ${event.event_type}`);
      return NextResponse.json({ received: true });
    }

    const orderId = getOrderId(event);
    if (!orderId) {
      console.error("[WEBHOOK] Missing order id in event");
      return NextResponse.json({ error: "Missing order id" }, { status: 400 });
    }

    console.log(`[WEBHOOK] Looking up purchase for order: ${orderId}`);

    const purchase = await prisma.purchase.findFirst({
      where: { providerRef: orderId },
    });

    if (!purchase) {
      console.error(`[WEBHOOK] Purchase not found for orderId: ${orderId}`);
      return NextResponse.json({ received: true });
    }

    if (purchase.status === "paid") {
      console.warn(`[WEBHOOK] Purchase ${purchase.id} already marked as paid`);
      return NextResponse.json({ received: true });
    }

    console.log(`[WEBHOOK] Updating purchase ${purchase.id} status to paid`);
    await prisma.purchase.update({
      where: { id: purchase.id },
      data: { status: "paid" },
    });
    console.log(`[WEBHOOK] Purchase ${purchase.id} status updated successfully`);

    // Fetch course to check inventory
    console.log(`[WEBHOOK] Fetching course ${purchase.courseId} for inventory check`);
    const courseForInventory = await prisma.course.findUnique({
      where: { id: purchase.courseId },
      select: { inventory: true },
    });

    // Decrement inventory if course has limited inventory
    if (courseForInventory && courseForInventory.inventory !== null) {
      console.log(`[WEBHOOK] Decrementing inventory for course ${purchase.courseId} from ${courseForInventory.inventory}`);
      await prisma.course.update({
        where: { id: purchase.courseId },
        data: {
          inventory: {
            decrement: 1,
          },
        },
      });
    }

    console.log(`[WEBHOOK] Creating/updating enrollment for user ${purchase.userId} in course ${purchase.courseId}`);
    const enrollment = await prisma.enrollment.upsert({
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
    console.log(`[WEBHOOK] Enrollment ${enrollment.id} created/updated successfully`);

    // Send email notifications
    console.log(`[WEBHOOK] Fetching user and course details for email`);
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
        console.log(`[WEBHOOK] Sending confirmation emails to ${user.email}`);
        const { sendPurchaseConfirmationEmail, sendEnrollmentEmail } = await import("@/lib/email");
        await Promise.all([
          sendPurchaseConfirmationEmail(user.email, course.title, purchase.amountCents),
          sendEnrollmentEmail(user.email, course.title),
        ]);
        console.log(`[WEBHOOK] Emails sent successfully`);
      } catch (error) {
        console.error("[WEBHOOK] Failed to send email notifications:", error);
        // Don't fail the webhook if email fails
      }
    } else {
      console.warn(`[WEBHOOK] Could not send emails - user or course not found`);
    }

    console.log(`[WEBHOOK] Creating payment record`);
    await prisma.payment.create({
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

    console.log(`[WEBHOOK] Creating activity log`);
    await prisma.activityLog.create({
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

    console.log(`[WEBHOOK] Purchase ${purchase.id} processing completed successfully`);
    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("[WEBHOOK] Critical error processing webhook:", error);
    if (error instanceof Error) {
      console.error("[WEBHOOK] Error message:", error.message);
      console.error("[WEBHOOK] Error stack:", error.stack);
    }
    // Still return success to PayPal to avoid redelivery
    // The error is logged and can be investigated
    return NextResponse.json({ received: true, error: "Processing error logged" }, { status: 200 });
  }
}
