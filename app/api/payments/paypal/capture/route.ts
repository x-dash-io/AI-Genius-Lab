import { NextResponse } from "next/server";
import { capturePayPalOrder } from "@/lib/paypal";
import { prisma } from "@/lib/prisma";

function getCaptureId(payload: any) {
  return payload?.purchase_units?.[0]?.payments?.captures?.[0]?.id ?? null;
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const orderId = url.searchParams.get("token");

  if (!orderId) {
    return NextResponse.redirect(new URL("/courses", url));
  }

  const purchase = await prisma.purchase.findFirst({
    where: { providerRef: orderId },
    include: { course: true },
  });

  if (!purchase) {
    return NextResponse.redirect(new URL("/courses", url));
  }

  if (purchase.status !== "paid") {
    const capture = await capturePayPalOrder(orderId);

    if (capture?.status !== "COMPLETED") {
      // Send failure email if user exists
      const user = await prisma.user.findUnique({
        where: { id: purchase.userId },
        select: { email: true },
      });

      if (user && purchase.course) {
        try {
          const { sendPurchaseFailedEmail } = await import("@/lib/email");
          await sendPurchaseFailedEmail(
            user.email,
            purchase.course.title,
            "Payment capture failed"
          );
        } catch (error) {
          console.error("Failed to send failure email:", error);
        }
      }

      return NextResponse.redirect(
        new URL(`/courses/${purchase.course.slug}?checkout=failed`, url)
      );
    }

    await prisma.purchase.update({
      where: { id: purchase.id },
      data: { status: "paid" },
    });

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

    if (user && purchase.course) {
      try {
        const { sendPurchaseConfirmationEmail, sendEnrollmentEmail } = await import("@/lib/email");
        await Promise.all([
          sendPurchaseConfirmationEmail(user.email, purchase.course.title, purchase.amountCents),
          sendEnrollmentEmail(user.email, purchase.course.title),
        ]);
      } catch (error) {
        console.error("Failed to send email notifications:", error);
        // Don't fail the capture if email fails
      }
    }

    await prisma.payment.create({
      data: {
        userId: purchase.userId,
        purchaseId: purchase.id,
        provider: "paypal",
        providerRef: getCaptureId(capture) ?? orderId,
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

    // Track analytics
    try {
      const { trackPurchase } = await import("@/lib/analytics");
      trackPurchase(purchase.courseId, purchase.amountCents, purchase.userId);
    } catch (error) {
      console.error("Failed to track purchase analytics:", error);
    }
  }

  return NextResponse.redirect(
    new URL(`/library/${purchase.course.slug}?checkout=success`, url)
  );
}
