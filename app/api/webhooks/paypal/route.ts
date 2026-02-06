import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { verifyPayPalWebhook, getPayPalSubscription } from "@/lib/paypal";

type PayPalEvent = {
  event_type?: string;
  resource?: any;
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
    console.log(`[WEBHOOK] Full body: ${bodyText}`);
    console.log(`[WEBHOOK] Headers: ${JSON.stringify({ transmissionId, transmissionTime, transmissionSig, certUrl, authAlgo })}`);

    // Handle Subscription Events
    if (event.event_type?.startsWith("BILLING.SUBSCRIPTION.")) {
      const subscriptionResource = event.resource;
      let customId = subscriptionResource.custom_id;
      const paypalSubId = subscriptionResource.id;

      if (!customId && paypalSubId) {
        const subByPaypalId = await prisma.subscription.findUnique({
          where: { paypalSubscriptionId: paypalSubId },
        });
        if (subByPaypalId) {
          customId = subByPaypalId.id;
        }
      }

      if (!customId) {
        console.warn(`[WEBHOOK] Missing custom_id in subscription event and could not find by PayPal ID`);
        return NextResponse.json({ received: true });
      }

      console.log(
        `[WEBHOOK] Processing subscription event ${event.event_type} for ${customId}. PayPal ID: ${paypalSubId}`
      );
      console.log(`[WEBHOOK] Subscription Resource: ${JSON.stringify(subscriptionResource)}`);

      switch (event.event_type) {
        case "BILLING.SUBSCRIPTION.ACTIVATED":
        case "BILLING.SUBSCRIPTION.UPDATED":
          const startTime = new Date(
            subscriptionResource.start_time || Date.now()
          );
          const endTime = subscriptionResource.billing_info?.next_billing_time
            ? new Date(subscriptionResource.billing_info.next_billing_time)
            : new Date(Date.now() + 31 * 24 * 60 * 60 * 1000); // Fallback 31 days

          // If it's an update, we might need to sync the plan too
          let updateData: any = {
            status: "active",
            paypalSubscriptionId: paypalSubId,
            currentPeriodStart: startTime,
            currentPeriodEnd: endTime,
          };

          if (subscriptionResource.plan_id) {
            const plan = await prisma.subscriptionPlan.findFirst({
              where: {
                OR: [
                  { paypalMonthlyPlanId: subscriptionResource.plan_id },
                  { paypalAnnualPlanId: subscriptionResource.plan_id }
                ]
              }
            });
            if (plan) {
              updateData.planId = plan.id;
              updateData.interval = plan.paypalAnnualPlanId === subscriptionResource.plan_id ? "annual" : "monthly";
            }
          }

          const sub = await prisma.subscription.update({
            where: { id: customId },
            data: updateData,
          });

          console.log(`[WEBHOOK] Subscription ${sub.id} activated successfully`);

          // Cancel any other active/pending subscriptions for this user
          // This handles plan changes where old subscription should be replaced
          const otherSubs = await prisma.subscription.findMany({
            where: {
              userId: sub.userId,
              id: { not: sub.id },
              status: { in: ["active", "cancelled", "past_due", "pending"] },
            },
          });

          console.log(`[WEBHOOK] Found ${otherSubs.length} other subscriptions to clean up`);

          for (const other of otherSubs) {
            try {
              // Cancel pending subscriptions immediately (abandoned plan changes)
              if (other.status === "pending") {
                console.log(`[WEBHOOK] Cleaning up abandoned pending subscription ${other.id}`);
                await prisma.subscription.update({
                  where: { id: other.id },
                  data: { status: "expired" },
                });
                continue;
              }

              // For active subscriptions, cancel in PayPal first
              if (other.paypalSubscriptionId) {
                console.log(`[WEBHOOK] Cancelling old PayPal subscription ${other.paypalSubscriptionId}`);
                const { cancelPayPalSubscription } = await import("@/lib/paypal");
                await cancelPayPalSubscription(
                  other.paypalSubscriptionId,
                  "Replaced by new subscription"
                );
              }

              await prisma.subscription.update({
                where: { id: other.id },
                data: { status: "expired" },
              });
              console.log(`[WEBHOOK] Old subscription ${other.id} marked as expired`);
            } catch (err) {
              console.error(`[WEBHOOK] Failed to cancel old sub ${other.id}:`, err);
            }
          }

          // Revalidate subscription-related pages to update UI
          try {
            revalidatePath("/profile/subscription");
            revalidatePath("/profile");
            revalidatePath("/pricing");
            revalidatePath("/dashboard");
            console.log(`[WEBHOOK] Revalidated subscription pages for user ${sub.userId}`);
          } catch (err) {
            console.error(`[WEBHOOK] Failed to revalidate paths:`, err);
          }
          break;

        case "BILLING.SUBSCRIPTION.CANCELLED":
          const cancelledSub = await prisma.subscription.update({
            where: { id: customId },
            data: {
              status: "cancelled",
              cancelAtPeriodEnd: true,
            },
          });

          // Revalidate subscription-related pages
          try {
            revalidatePath("/profile/subscription");
            revalidatePath("/profile");
            console.log(`[WEBHOOK] Revalidated pages after cancellation for user ${cancelledSub.userId}`);
          } catch (err) {
            console.error(`[WEBHOOK] Failed to revalidate paths:`, err);
          }
          break;

        case "BILLING.SUBSCRIPTION.EXPIRED":
        case "BILLING.SUBSCRIPTION.SUSPENDED":
          await prisma.subscription.update({
            where: { id: customId },
            data: { status: "expired" },
          });
          break;
      }

      return NextResponse.json({ received: true });
    }

    // Handle Recurring Payment Completion
    if (event.event_type === "PAYMENT.SALE.COMPLETED") {
      const saleResource = event.resource;
      const paypalSubId = saleResource.billing_agreement_id;

      if (paypalSubId) {
        console.log(
          `[WEBHOOK] Recurring payment completed for subscription: ${paypalSubId}`
        );
        const sub = await prisma.subscription.findUnique({
          where: { paypalSubscriptionId: paypalSubId },
        });

        if (sub) {
          // Record payment
          await prisma.subscriptionPayment.create({
            data: {
              subscriptionId: sub.id,
              amountCents: Math.round(parseFloat(saleResource.amount.total) * 100),
              currency: saleResource.amount.currency_code.toLowerCase(),
              status: "completed",
              paypalSaleId: saleResource.id,
            }
          });

          try {
            const paypalSub = await getPayPalSubscription(paypalSubId);
            const nextBillingTime = paypalSub.billing_info?.next_billing_time;
            if (nextBillingTime) {
              await prisma.subscription.update({
                where: { id: sub.id },
                data: {
                  status: "active",
                  currentPeriodEnd: new Date(nextBillingTime),
                },
              });
              console.log(
                `[WEBHOOK] Subscription ${sub.id} extended until ${nextBillingTime}`
              );
            }
          } catch (error) {
            console.error(
              `[WEBHOOK] Failed to fetch PayPal subscription details to extend period:`,
              error
            );
          }
        }
      }
      return NextResponse.json({ received: true });
    }

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

    console.log(`[WEBHOOK] Looking up purchases for order: ${orderId}`);

    const purchases = await prisma.purchase.findMany({
      where: { providerRef: orderId },
      include: {
        Course: {
          select: {
            id: true,
            title: true,
            inventory: true,
            slug: true,
          }
        },
        User: {
          select: {
            id: true,
            email: true,
            name: true,
          }
        }
      }
    });

    if (purchases.length === 0) {
      console.error(`[WEBHOOK] No purchases found for orderId: ${orderId}`);
      return NextResponse.json({ received: true });
    }

    console.log(`[WEBHOOK] Found ${purchases.length} purchases to process`);

    // Process all purchases in the order
    for (const purchase of purchases) {
      if (purchase.status === "paid") {
        console.warn(`[WEBHOOK] Purchase ${purchase.id} already marked as paid, skipping`);
        continue;
      }

      console.log(`[WEBHOOK] Processing purchase ${purchase.id} for course ${purchase.courseId}`);

      // Update purchase status
      await prisma.purchase.update({
        where: { id: purchase.id },
        data: { status: "paid" },
      });

      // Decrement inventory if course has limited inventory
      if (purchase.Course && purchase.Course.inventory !== null) {
        console.log(`[WEBHOOK] Decrementing inventory for course ${purchase.courseId}`);
        await prisma.course.update({
          where: { id: purchase.courseId },
          data: {
            inventory: {
              decrement: 1,
            },
          },
        });
      }

      // Create enrollment
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
      console.log(`[WEBHOOK] Enrollment ${enrollment.id} created/updated`);

      // Create payment record
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

      // Create activity log
      await prisma.activityLog.create({
        data: {
          id: `activity_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
          userId: purchase.userId,
          type: "purchase_completed",
          metadata: {
            purchaseId: purchase.id,
            courseId: purchase.courseId,
            courseTitle: purchase.Course?.title,
          },
        },
      });

      console.log(`[WEBHOOK] Purchase ${purchase.id} processed successfully`);
    }

    // Send consolidated email notifications
    const firstPurchase = purchases[0];
    if (firstPurchase.User) {
      try {
        console.log(`[WEBHOOK] Sending confirmation emails to ${firstPurchase.User.email}`);
        const { sendPurchaseConfirmationEmail, sendEnrollmentEmail } = await import("@/lib/email");

        const courseTitles = purchases.map((p: any) => p.Course?.title || "Course").join(", ");
        const totalAmount = purchases.reduce((sum: number, p: any) => sum + p.amountCents, 0);

        await sendPurchaseConfirmationEmail(firstPurchase.User.email, courseTitles, totalAmount);

        // Individual enrollment emails for each course
        for (const p of purchases) {
          if (p.Course?.title) {
            await sendEnrollmentEmail(firstPurchase.User.email, p.Course.title);
          }
        }
        console.log(`[WEBHOOK] Consolidated emails sent successfully`);
      } catch (error) {
        console.error("[WEBHOOK] Failed to send email notifications:", error);
      }
    }
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
