import { NextRequest, NextResponse } from "next/server";
import { verifyPayPalWebhook } from "@/lib/paypal";
import { prisma } from "@/lib/prisma";
import { updateSubscriptionExpiry } from "@/lib/subscription";

// Store processed webhook IDs to prevent duplicates
const processedWebhooks = new Set<string>();

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

    // Idempotency check - prevent processing duplicate webhooks
    if (processedWebhooks.has(transmissionId)) {
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

    // Find our subscription using PayPal's subscription ID
    const subscription = await prisma.subscription.findFirst({
      where: {
        providerRef: subscriptionData.id,
        provider: "paypal",
      },
    });

    if (!subscription) {
      console.error("Subscription not found for PayPal ID:", subscriptionData.id);
      return NextResponse.json({ error: "Subscription not found" }, { status: 404 });
    }

    // Use database transaction for consistency
    await prisma.$transaction(async (tx) => {
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
    });

    // Mark webhook as processed
    processedWebhooks.add(transmissionId);
    
    // Clean up old webhook IDs (keep last 1000)
    if (processedWebhooks.size > 1000) {
      const entries = Array.from(processedWebhooks);
      processedWebhooks.clear();
      entries.slice(-500).forEach(id => processedWebhooks.add(id));
    }

    return NextResponse.json({ received: true, eventType });
  } catch (error) {
    console.error("PayPal webhook error:", error);
    return NextResponse.json(
      { error: "Webhook processing failed" },
      { status: 500 }
    );
  }
}
