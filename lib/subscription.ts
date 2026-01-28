import { prisma, withRetry } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth";
import { SubscriptionStatus } from "@prisma/client";

export type SubscriptionPlan = "monthly" | "annual";
export { SubscriptionStatus };

export interface SubscriptionPlanDetails {
  id: SubscriptionPlan;
  name: string;
  priceCents: number;
  interval: "month" | "year";
  features: string[];
  popular?: boolean;
}

export const SUBSCRIPTION_PLANS: Record<SubscriptionPlan, SubscriptionPlanDetails> = {
  monthly: {
    id: "monthly",
    name: "Monthly Premium",
    priceCents: 2999,
    interval: "month",
    features: [
      "Access to all courses",
      "Priority support",
      "Certificate issuance",
      "Early access to new courses",
      "Exclusive content",
    ],
  },
  annual: {
    id: "annual",
    name: "Annual Premium",
    priceCents: 29999,
    interval: "year",
    features: [
      "Access to all courses",
      "Priority support",
      "Certificate issuance",
      "Early access to new courses",
      "Exclusive content",
      "2 months free",
      "Annual certificate",
    ],
    popular: true,
  },
};

export async function getUserSubscription(userId: string) {
  // Note: Using findFirst because user can have multiple subscriptions (different statuses)
  // but we want the active one. If schema had unique constraint on userId+status, we'd use findUnique
  return await withRetry(() => prisma.subscription.findFirst({
    where: {
      userId,
      status: "active",
    },
    include: {
      User: {
        select: {
          id: true,
          email: true,
          name: true,
        },
      },
    },
  }));
}

export async function hasActiveSubscription(userId: string): Promise<boolean> {
  // Note: Using findFirst because we're checking for existence, not uniqueness
  // The OR condition makes this a complex query that doesn't match a unique constraint
  const subscription = await withRetry(() => prisma.subscription.findFirst({
    where: {
      userId,
      status: "active",
      OR: [
        { endDate: null },
        { endDate: { gte: new Date() } },
      ],
    },
  }));

  return !!subscription;
}

export async function hasCourseAccess(userId: string, courseId: string) {
  // Check purchased access (lifetime)
  const purchasedAccess = await prisma.enrollment.findFirst({
    where: {
      userId,
      courseId,
      accessType: "purchased",
    },
  });

  if (purchasedAccess) {
    return { hasAccess: true, type: "purchased" as const };
  }

  // Check subscription access
  const subscriptionAccess = await prisma.enrollment.findFirst({
    where: {
      userId,
      courseId,
      accessType: "subscription",
      Subscription: {
        status: "active",
        OR: [
          { endDate: null },
          { endDate: { gte: new Date() } },
        ],
      },
    },
    include: {
      Subscription: true,
    },
  });

  if (subscriptionAccess) {
    return {
      hasAccess: true,
      type: "subscription" as const,
      expiresAt: subscriptionAccess.Subscription?.endDate,
    };
  }

  return { hasAccess: false };
}

export async function createSubscription(
  userId: string,
  planType: SubscriptionPlan,
  provider: "stripe" | "paypal" = "paypal",
  providerRef?: string
) {
  // Check if user already has an active subscription
  // Note: Using findFirst because schema has unique constraint on userId+status,
  // but we're only checking for "active" status, so findFirst is appropriate
  const existingSubscription = await prisma.subscription.findFirst({
    where: {
      userId,
      status: "active",
    },
  });

  if (existingSubscription) {
    throw new Error("User already has an active subscription");
  }

  const plan = SUBSCRIPTION_PLANS[planType];
  const startDate = new Date();
  const endDate = new Date(startDate);
  
  if (plan.interval === "month") {
    endDate.setMonth(endDate.getMonth() + 1);
  } else {
    endDate.setFullYear(endDate.getFullYear() + 1);
  }

  return await prisma.subscription.create({
    data: {
      id: `sub_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
      userId,
      planType,
      status: "pending" as SubscriptionStatus,
      startDate,
      endDate,
      lastBillingAt: startDate,
      nextBillingAt: endDate,
      provider,
      providerRef,
    },
  });
}

export async function cancelSubscription(subscriptionId: string, userId: string) {
  const subscription = await prisma.subscription.findFirst({
    where: {
      id: subscriptionId,
      userId,
      status: "active",
    },
  });

  if (!subscription) {
    throw new Error("Active subscription not found");
  }

  return await prisma.subscription.update({
    where: { id: subscriptionId },
    data: {
      status: "cancelled",
      cancelledAt: new Date(),
    },
  });
}

export async function reactivateSubscription(subscriptionId: string, userId: string) {
  const subscription = await prisma.subscription.findFirst({
    where: {
      id: subscriptionId,
      userId,
      status: "cancelled",
      endDate: { gte: new Date() },
    },
  });

  if (!subscription) {
    throw new Error("Cancelled subscription not found or expired");
  }

  return await prisma.subscription.update({
    where: { id: subscriptionId },
    data: {
      status: "active",
      cancelledAt: null,
    },
  });
}

export async function enrollUserInAllCourses(userId: string, subscriptionId: string) {
  // Use transaction to ensure atomic enrollment
  return await prisma.$transaction(async (tx) => {
    // Get all published courses within transaction
    const courses = await tx.course.findMany({
      where: {
        isPublished: true,
      },
      select: {
        id: true,
      },
    });

    // Enroll user in all courses via subscription (sequential to avoid deadlocks)
    const enrollments = [];
    for (const course of courses) {
      const enrollment = await tx.enrollment.upsert({
        where: {
          userId_courseId: {
            userId,
            courseId: course.id,
          },
        },
        update: {
          accessType: "subscription",
          subscriptionId,
          expiresAt: null, // Will be updated when subscription expires
        },
        create: {
          id: `enrollment_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
          userId,
          courseId: course.id,
          accessType: "subscription",
          subscriptionId,
        },
      });
      enrollments.push(enrollment);
    }

    return enrollments;
  });
}

export async function removeSubscriptionAccess(userId: string) {
  return await prisma.enrollment.deleteMany({
    where: {
      userId,
      accessType: "subscription",
    },
  });
}

export async function updateSubscriptionExpiry(subscriptionId: string, newEndDate: Date) {
  // Update subscription
  const subscription = await prisma.subscription.update({
    where: { id: subscriptionId },
    data: {
      endDate: newEndDate,
      nextBillingAt: newEndDate,
    },
  });

  // Update all related enrollments
  if (subscription.status !== "active") {
    await prisma.enrollment.updateMany({
      where: {
        subscriptionId,
      },
      data: {
        expiresAt: newEndDate,
      },
    });
  }

  return subscription;
}

export async function getSubscriptionStats() {
  const [total, active, monthly, annual, churned] = await withRetry(() => Promise.all([
    prisma.subscription.count(),
    prisma.subscription.count({ where: { status: "active" } }),
    prisma.subscription.count({ where: { status: "active", planType: "monthly" } }),
    prisma.subscription.count({ where: { status: "active", planType: "annual" } }),
    prisma.subscription.count({ where: { status: "cancelled" } }),
  ]));

  const mrr = (monthly * SUBSCRIPTION_PLANS.monthly.priceCents + annual * SUBSCRIPTION_PLANS.annual.priceCents) / 100;
  const arr = (annual * SUBSCRIPTION_PLANS.annual.priceCents) / 100;

  return {
    total,
    active,
    monthly,
    annual,
    churned,
    mrr,
    arr,
  };
}

// Helper function to check if the current session user has an active subscription
export async function getCurrentUserSubscription() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return null;
  }

  return await getUserSubscription(session.user.id);
}
