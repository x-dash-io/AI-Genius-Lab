import { prisma } from "@/lib/prisma";

export async function getAllSubscriptions() {
  return prisma.subscription.findMany({
    include: {
      User: {
        select: {
          id: true,
          email: true,
          name: true,
        },
      },
      _count: {
        select: {
          Enrollment: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function getSubscriptionById(subscriptionId: string) {
  return prisma.subscription.findUnique({
    where: { id: subscriptionId },
    include: {
      User: true,
      Enrollment: {
        include: {
          Course: {
            select: {
              id: true,
              title: true,
              slug: true,
            },
          },
        },
      },
      Payment: {
        orderBy: { createdAt: "desc" },
        take: 10,
      },
    },
  });
}

export async function getSubscriptionStats() {
  const now = new Date();
  const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const lastYear = new Date(now.getFullYear() - 1, 0, 1);

  const [
    totalSubscriptions,
    activeSubscriptions,
    monthlyActive,
    annualActive,
    cancelledSubscriptions,
    newThisMonth,
    newThisYear,
    mrrData,
  ] = await Promise.all([
    prisma.subscription.count(),
    prisma.subscription.count({ where: { status: "active" } }),
    prisma.subscription.count({ where: { status: "active", planType: "monthly" } }),
    prisma.subscription.count({ where: { status: "active", planType: "annual" } }),
    prisma.subscription.count({ where: { status: "cancelled" } }),
    prisma.subscription.count({
      where: { createdAt: { gte: lastMonth } },
    }),
    prisma.subscription.count({
      where: { createdAt: { gte: lastYear } },
    }),
    prisma.subscription.groupBy({
      by: ["planType"],
      where: { status: "active" },
      _count: true,
    }),
  ]);

  // Calculate MRR and ARR
  const monthlyMRR = monthlyActive * 29.99;
  const annualMRR = annualActive * 299.99 / 12; // Convert annual to monthly
  const totalMRR = monthlyMRR + annualMRR;
  const totalARR = annualActive * 299.99;

  // Calculate churn rate (simplified)
  const churnRate = totalSubscriptions > 0 ? (cancelledSubscriptions / totalSubscriptions) * 100 : 0;

  // Calculate growth rates
  const monthlyGrowthRate = newThisMonth > 0 ? ((newThisMonth / activeSubscriptions) * 100) : 0;
  const yearlyGrowthRate = newThisYear > 0 ? ((newThisYear / totalSubscriptions) * 100) : 0;

  return {
    total: totalSubscriptions,
    active: activeSubscriptions,
    monthly: monthlyActive,
    annual: annualActive,
    cancelled: cancelledSubscriptions,
    newThisMonth,
    newThisYear,
    mrr: totalMRR,
    arr: totalARR,
    churnRate: churnRate.toFixed(2),
    monthlyGrowthRate: monthlyGrowthRate.toFixed(2),
    yearlyGrowthRate: yearlyGrowthRate.toFixed(2),
  };
}

export async function updateSubscriptionStatus(
  subscriptionId: string,
  status: "active" | "cancelled" | "expired" | "paused"
) {
  return prisma.subscription.update({
    where: { id: subscriptionId },
    data: { 
      status,
      updatedAt: new Date(),
      // If cancelling, set cancelledAt
      ...(status === "cancelled" && { cancelledAt: new Date() }),
    },
  });
}

export async function extendSubscription(
  subscriptionId: string,
  days: number
) {
  const subscription = await prisma.subscription.findUnique({
    where: { id: subscriptionId },
  });

  if (!subscription) {
    throw new Error("Subscription not found");
  }

  const newEndDate = subscription.endDate 
    ? new Date(subscription.endDate.getTime() + days * 24 * 60 * 60 * 1000)
    : new Date(Date.now() + days * 24 * 60 * 60 * 1000);

  return prisma.subscription.update({
    where: { id: subscriptionId },
    data: {
      endDate: newEndDate,
      nextBillingAt: newEndDate,
      updatedAt: new Date(),
    },
  });
}

export async function getRecentSubscriptions(limit = 10) {
  return prisma.subscription.findMany({
    take: limit,
    include: {
      User: {
        select: {
          id: true,
          email: true,
          name: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function getExpiringSubscriptions(days = 7) {
  const futureDate = new Date();
  futureDate.setDate(futureDate.getDate() + days);

  return prisma.subscription.findMany({
    where: {
      status: "active",
      endDate: {
        lte: futureDate,
        gte: new Date(),
      },
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
    orderBy: { endDate: "asc" },
  });
}
