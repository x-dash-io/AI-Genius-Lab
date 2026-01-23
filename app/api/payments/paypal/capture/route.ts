import { NextResponse } from "next/server";
import { capturePayPalOrder } from "@/lib/paypal";
import { prisma } from "@/lib/prisma";

function getCaptureId(payload: any) {
  return payload?.purchase_units?.[0]?.payments?.captures?.[0]?.id ?? null;
}

function getBaseUrl(requestUrl: URL): string {
  // Use NEXTAUTH_URL if available (preferred)
  if (process.env.NEXTAUTH_URL) {
    return process.env.NEXTAUTH_URL;
  }
  
  // Otherwise, construct from request URL but ensure HTTP for localhost
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
      include: { course: true },
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
          console.error("Failed to send failure email:", error);
        }
      }

      return NextResponse.redirect(
        new URL(`/learning-paths?checkout=failed`, baseUrl)
      );
    }

    // Process all purchases
    await Promise.all(
      purchases.map(async (purchase) => {
        if (purchase.status !== "paid") {
          await prisma.purchase.update({
            where: { id: purchase.id },
            data: { status: "paid" },
          });

          // Decrement inventory if course has limited inventory
          if (purchase.course.inventory !== null) {
            await prisma.course.update({
              where: { id: purchase.courseId },
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
              userId: purchase.userId,
              courseId: purchase.courseId,
              purchaseId: purchase.id,
            },
          });

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
                courseTitle: purchase.course.title,
                courseSlug: purchase.course.slug,
              },
            },
          });

          try {
            const { trackPurchase } = await import("@/lib/analytics");
            trackPurchase(purchase.courseId, purchase.amountCents, purchase.userId);
          } catch (error) {
            console.error("Failed to track purchase analytics:", error);
          }
        }
      })
    );

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
        const courseTitles = purchases.map((p) => p.course.title).join(", ");
        const totalAmount = purchases.reduce((sum, p) => sum + p.amountCents, 0);
        const invoiceNumber = generateInvoiceNumber(purchases[0].id);
        const purchaseDate = payment?.createdAt || purchases[0].createdAt;
        
        await Promise.all([
          sendPurchaseConfirmationEmail(user.email, courseTitles, totalAmount),
          ...purchases.map((p) => sendEnrollmentEmail(user.email, p.course.title)),
          sendInvoiceEmail(
            user.email,
            user.name || "Customer",
            invoiceNumber,
            purchaseDate,
            purchases.map((p) => ({
              title: p.course.title,
              description: p.course.description || undefined,
              amountCents: p.amountCents,
              currency: p.currency,
            })),
            formatPaymentMethod(payment?.provider),
            payment?.providerRef || undefined
          ),
        ]);
      } catch (error) {
        console.error("Failed to send email notifications:", error);
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
    include: { course: true },
  });

  if (!purchase) {
    return NextResponse.redirect(new URL("/courses", baseUrl));
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
        new URL(`/courses/${purchase.course.slug}?checkout=failed`, baseUrl)
      );
    }

    await prisma.purchase.update({
      where: { id: purchase.id },
      data: { status: "paid" },
    });

    // Decrement inventory if course has limited inventory
    if (purchase.course.inventory !== null) {
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

    // Fetch payment for invoice
    const payment = await prisma.payment.findFirst({
      where: { purchaseId: purchase.id },
      orderBy: { createdAt: "desc" },
    });

    // Send email notifications
    const user = await prisma.user.findUnique({
      where: { id: purchase.userId },
      select: { email: true, name: true },
    });

    if (user && purchase.course) {
      try {
        const { sendPurchaseConfirmationEmail, sendEnrollmentEmail, sendInvoiceEmail } = await import("@/lib/email");
        const invoiceNumber = generateInvoiceNumber(purchase.id);
        const purchaseDate = payment?.createdAt || purchase.createdAt;
        
        await Promise.all([
          sendPurchaseConfirmationEmail(user.email, purchase.course.title, purchase.amountCents),
          sendEnrollmentEmail(user.email, purchase.course.title),
          sendInvoiceEmail(
            user.email,
            user.name || "Customer",
            invoiceNumber,
            purchaseDate,
            [{
              title: purchase.course.title,
              description: purchase.course.description || undefined,
              amountCents: purchase.amountCents,
              currency: purchase.currency,
            }],
            formatPaymentMethod(payment?.provider),
            payment?.providerRef || undefined
          ),
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
          courseTitle: purchase.course.title,
          courseSlug: purchase.course.slug,
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

  // Redirect to success page with invoice
  return NextResponse.redirect(
    new URL(`/purchase/success?purchase=${encodeURIComponent(purchase.id)}`, baseUrl)
  );
}
