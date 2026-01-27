import { NextRequest, NextResponse } from "next/server";
import { verifyPayPalWebhook } from "@/lib/paypal";
import { prisma } from "@/lib/prisma";
import { updateSubscriptionExpiry } from "@/lib/subscription";

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const webhookEvent = JSON.parse(body);

    // Get PayPal headers for verification
    const headers = Object.fromEntries(request.headers);
    const transmissionId = headers["paypal-transmission-id"];
    const transmissionTime = headers["paypal-transmission-time"];
    const transmissionSig = headers["paypal-transmission-sig"];
    const certUrl = headers["paypal-cert-id"];
    const authAlgo = headers["paypal-auth-algo"];

    if (!transmissionId) {
      console.error("Missing transmission ID");
      return NextResponse.json({ error: "Missing transmission ID" }, { status: 400 });
    }

    // Database-based idempotency check - prevent processing duplicate webhooks
    const existingWebhook = await prisma.webhookLog.findUnique({
      where: { transmissionId },
    });

    if (existingWebhook) {
      console.log("Webhook already processed:", transmissionId);
      return NextResponse.json({ received: true, status: "duplicate" });
    }

    // Verify webhook signature
    const isValid = await verifyPayPalWebhook({
      transmissionId,
      transmissionTime,
      transmissionSig,
      certUrl,
      authAlgo,
      webhookEvent,
    });

    if (!isValid) {
      console.error("Invalid PayPal webhook signature");
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }

    const eventType = webhookEvent.event_type;
    const subscriptionData = webhookEvent.resource;

    // Use database transaction for consistency and idempotency
    await prisma.$transaction(async (tx) => {
      // Double-check idempotency within transaction
      const existingWebhookInTx = await tx.webhookLog.findUnique({
        where: { transmissionId },
      });

      if (existingWebhookInTx) {
        console.log("Webhook already processed (within transaction):", transmissionId);
        return; // Exit transaction early
      }

      // Find our subscription using PayPal's subscription ID
      const subscription = await tx.subscription.findFirst({
        where: {
          providerRef: subscriptionData.id,
          provider: "paypal",
        },
      });

      if (!subscription) {
        console.error("Subscription not found for PayPal ID:", subscriptionData.id);
        throw new Error("Subscription not found");
      }
      // Handle different webhook events
      switch (eventType) {
        case "BILLING.SUBSCRIPTION.ACTIVATED":
          // Subscription activated
          await tx.subscription.update({
            where: { id: subscription.id },
            data: {
              status: "active",
              startDate: new Date(subscriptionData.create_time),
              endDate: new Date(subscriptionData.billing_info.next_billing_time),
            },
          });
          break;

        case "BILLING.SUBSCRIPTION.CANCELLED":
          // Subscription cancelled
          await tx.subscription.update({
            where: { id: subscription.id },
            data: {
              status: "cancelled",
              cancelledAt: new Date(),
            },
          });
          break;

        case "BILLING.SUBSCRIPTION.SUSPENDED":
          // Subscription suspended due to payment failure
          await tx.subscription.update({
            where: { id: subscription.id },
            data: {
              status: "paused",
            },
          });
          break;

        case "PAYMENT.SALE.COMPLETED":
          // Payment successful - update next billing date
          if (subscriptionData.billing_info?.next_billing_time) {
            await updateSubscriptionExpiry(
              subscription.id,
              new Date(subscriptionData.billing_info.next_billing_time)
            );
          }
          break;

        case "BILLING.SUBSCRIPTION.EXPIRED":
          // Subscription expired
          await tx.subscription.update({
            where: { id: subscription.id },
            data: {
              status: "expired",
            },
          });
          break;

        default:
          console.log("Unhandled PayPal webhook event:", eventType);
      }

      // Mark webhook as processed in database (within transaction)
      await tx.webhookLog.create({
        data: {
          transmissionId,
          eventType,
          provider: "paypal",
          payload: webhookEvent,
        },
      });
    });

    return NextResponse.json({ received: true, eventType });
  } catch (error) {
    console.error("PayPal webhook error:", error);
    // Return 500 to trigger PayPal retry for transient errors
    // But return 200 for duplicate/not found to avoid infinite retries
    if (error instanceof Error) {
      if (error.message === "Subscription not found" || error.message.includes("already processed")) {
        return NextResponse.json({ received: true, error: error.message }, { status: 200 });
      }
    }
    return NextResponse.json(
      { error: "Webhook processing failed" },
      { status: 500 }
    );
  }
}
