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
  const bodyText = await request.text();
  const event = JSON.parse(bodyText) as PayPalEvent;

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
    return NextResponse.json({ error: "Missing PayPal headers" }, { status: 400 });
  }

  const verified = await verifyPayPalWebhook({
    transmissionId,
    transmissionTime,
    transmissionSig,
    certUrl,
    authAlgo,
    webhookEvent: event,
  });

  if (!verified) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  if (
    event.event_type !== "PAYMENT.CAPTURE.COMPLETED" &&
    event.event_type !== "CHECKOUT.ORDER.APPROVED"
  ) {
    return NextResponse.json({ received: true });
  }

  const orderId = getOrderId(event);
  if (!orderId) {
    return NextResponse.json({ error: "Missing order id" }, { status: 400 });
  }

  const purchase = await prisma.purchase.findFirst({
    where: { providerRef: orderId },
  });

  if (!purchase || purchase.status === "paid") {
    return NextResponse.json({ received: true });
  }

  await prisma.purchase.update({
    where: { id: purchase.id },
    data: { status: "paid" },
  });

  // Fetch course to check inventory
  const courseForInventory = await prisma.course.findUnique({
    where: { id: purchase.courseId },
    select: { inventory: true },
  });

  // Decrement inventory if course has limited inventory
  if (courseForInventory && courseForInventory.inventory !== null) {
    await prisma.course.update({
      where: { id: purchase.courseId },
      data: {
        inventory: {
          decrement: 1,
        },
      },
    });
  }

  const enrollment = await prisma.enrollment.upsert({
    where: {
      userId_courseId: {
        userId: purchase.userId,
        courseId: purchase.courseId,
      },
    },
    update: { purchaseId: purchase.id },
    create: {
      userId: purchase.userId,
      courseId: purchase.courseId,
      purchaseId: purchase.id,
    },
  });

  // Send email notifications
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
      const { sendPurchaseConfirmationEmail, sendEnrollmentEmail } = await import("@/lib/email");
      await Promise.all([
        sendPurchaseConfirmationEmail(user.email, course.title, purchase.amountCents),
        sendEnrollmentEmail(user.email, course.title),
      ]);
    } catch (error) {
      console.error("Failed to send email notifications:", error);
      // Don't fail the webhook if email fails
    }
  }

  await prisma.payment.create({
    data: {
      userId: purchase.userId,
      purchaseId: purchase.id,
      provider: "paypal",
      providerRef: orderId,
      amountCents: purchase.amountCents,
      currency: purchase.currency,
      status: "paid",
    },
  });

  await prisma.activityLog.create({
    data: {
      userId: purchase.userId,
      type: "purchase_completed",
      metadata: {
        purchaseId: purchase.id,
        courseId: purchase.courseId,
      },
    },
  });

  return NextResponse.json({ received: true });
}
