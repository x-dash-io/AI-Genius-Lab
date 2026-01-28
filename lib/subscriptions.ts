import { prisma } from "@/lib/prisma";
import {
  createPayPalProduct,
  createPayPalPlan,
  cancelPayPalSubscription,
  getPayPalSubscription
} from "@/lib/paypal";
import { SubscriptionTier, SubscriptionStatus, SubscriptionInterval } from "@prisma/client";

/**
 * Sync all active subscription plans from the database to PayPal.
 * This ensures that each plan has a corresponding Product and Billing Plans (Monthly/Annual) in PayPal.
 */
export async function syncSubscriptionPlansToPayPal() {
  const plans = await prisma.subscriptionPlan.findMany({
    where: { isActive: true }
  });

  if (plans.length === 0) {
    return { success: true, count: 0, message: "No active plans to sync." };
  }

  let syncedCount = 0;
  let errorMessages: string[] = [];

  for (const plan of plans) {
    try {
      let productId = plan.paypalProductId;

      // 1. Ensure Product exists in PayPal
      if (!productId) {
        const product = await createPayPalProduct({
          name: `AI Genius Lab - ${plan.name}`,
          description: plan.description || `Subscription for ${plan.name} tier`,
        });

        await prisma.subscriptionPlan.update({
          where: { id: plan.id },
          data: { paypalProductId: product.id }
        });
        productId = product.id;
      }

      // 2. Ensure Monthly Plan exists
      if (!plan.paypalMonthlyPlanId) {
        const payPalPlan = await createPayPalPlan({
          productId: productId!,
          name: `${plan.name} Monthly`,
          description: `Monthly subscription for ${plan.name}`,
          priceCents: plan.priceMonthlyCents,
          intervalUnit: "MONTH",
        });

        await prisma.subscriptionPlan.update({
          where: { id: plan.id },
          data: { paypalMonthlyPlanId: payPalPlan.id }
        });
      }

      // 3. Ensure Annual Plan exists
      if (!plan.paypalAnnualPlanId) {
        const payPalPlan = await createPayPalPlan({
          productId: productId!,
          name: `${plan.name} Annual`,
          description: `Annual subscription for ${plan.name}`,
          priceCents: plan.priceAnnualCents,
          intervalUnit: "YEAR",
        });

        await prisma.subscriptionPlan.update({
          where: { id: plan.id },
          data: { paypalAnnualPlanId: payPalPlan.id }
        });
      }
      syncedCount++;
    } catch (error: any) {
      const msg = `Failed to sync plan ${plan.name}: ${error.message}`;
      console.error(msg);
      errorMessages.push(msg);
    }
  }

  return {
    success: errorMessages.length === 0,
    count: syncedCount,
    errors: errorMessages,
  };
}

/**
 * Get the current active subscription for a user.
 * Returns the subscription if it's active or cancelled but still within the paid period.
 * Also includes pending subscriptions created in the last 24 hours to handle webhook delays.
 */
export async function getUserSubscription(userId: string) {
  return prisma.subscription.findFirst({
    where: {
      userId,
      OR: [
        {
          status: { in: ["active", "cancelled", "past_due"] },
          currentPeriodEnd: { gt: new Date() }
        },
        {
          status: "pending",
          createdAt: { gt: new Date(Date.now() - 24 * 60 * 60 * 1000) }
        }
      ]
    },
    include: { plan: true },
    orderBy: [
      { status: "asc" }, // active/cancelled before pending usually (alphabetical: active, cancelled, pending)
      { createdAt: "desc" }
    ]
  });
}

/**
 * Sync a subscription's status with PayPal.
 * Useful for "pending" subscriptions to check if they've been activated.
 */
export async function refreshSubscriptionStatus(subscriptionId: string) {
  const subscription = await prisma.subscription.findUnique({
    where: { id: subscriptionId },
    include: { plan: true }
  });

  if (!subscription || !subscription.paypalSubscriptionId || subscription.status !== "pending") {
    return subscription;
  }

  try {
    const paypalSub = await getPayPalSubscription(subscription.paypalSubscriptionId);

    if (paypalSub.status === "ACTIVE") {
      const startTime = new Date(paypalSub.start_time || Date.now());
      const endTime = paypalSub.billing_info?.next_billing_time
        ? new Date(paypalSub.billing_info.next_billing_time)
        : new Date(Date.now() + 31 * 24 * 60 * 60 * 1000);

      return await prisma.subscription.update({
        where: { id: subscriptionId },
        data: {
          status: "active",
          currentPeriodStart: startTime,
          currentPeriodEnd: endTime,
        },
        include: { plan: true }
      });
    }
  } catch (error) {
    console.error(`Failed to refresh subscription ${subscriptionId}:`, error);
  }

  return subscription;
}

/**
 * Check if a user has an active subscription of at least a certain tier.
 */
export async function hasSubscriptionTier(userId: string, requiredTier: SubscriptionTier) {
  const subscription = await getUserSubscription(userId);
  if (!subscription) return false;

  const tiers: SubscriptionTier[] = ["starter", "pro", "elite"];
  const userTierIndex = tiers.indexOf(subscription.plan.tier);
  const requiredTierIndex = tiers.indexOf(requiredTier);

  return userTierIndex >= requiredTierIndex;
}

/**
 * Cancel a user's subscription.
 * This marks it as cancelled in our DB and calls PayPal to stop future billing.
 */
export async function cancelSubscription(subscriptionId: string) {
  const subscription = await prisma.subscription.findUnique({
    where: { id: subscriptionId },
  });

  if (!subscription) {
    throw new Error("Subscription not found");
  }

  if (subscription.paypalSubscriptionId) {
    try {
      await cancelPayPalSubscription(subscription.paypalSubscriptionId);
    } catch (error) {
      console.error("Failed to cancel PayPal subscription:", error);
      // We continue to update our DB even if PayPal fails,
      // though ideally we should handle this better.
    }
  }

  return prisma.subscription.update({
    where: { id: subscriptionId },
    data: {
      status: "cancelled",
      cancelAtPeriodEnd: true
    }
  });
}

/**
 * Grant a subscription manually to a user (Admin feature).
 */
export async function grantSubscriptionManually({
  userId,
  planId,
  interval,
  durationDays = 30
}: {
  userId: string;
  planId: string;
  interval: SubscriptionInterval;
  durationDays?: number;
}) {
  const now = new Date();
  const end = new Date();
  end.setDate(now.getDate() + durationDays);

  return prisma.subscription.create({
    data: {
      userId,
      planId,
      status: "active",
      interval,
      currentPeriodStart: now,
      currentPeriodEnd: end,
    }
  });
}
