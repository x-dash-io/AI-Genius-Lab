import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma, withRetry } from "@/lib/prisma";
import { hasRole, type Role } from "@/lib/rbac";
import {
  getUserSubscription,
  isSubscriptionActiveNow,
  SUBSCRIPTION_TIERS,
} from "@/lib/subscriptions";

export async function requireUser() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    throw new Error("UNAUTHORIZED");
  }
  // Return user with proper typing - the session type extensions should include id and role
  return session.user;
}

export async function requireRole(requiredRole: Role) {
  const user = await requireUser();
  if (!hasRole(user.role, requiredRole)) {
    throw new Error("FORBIDDEN");
  }
  return user;
}

export function isAdmin(role: Role) {
  return role === "admin";
}

/**
 * Require that the user is a customer (not an admin)
 * Admins should not perform customer operations like purchasing, reviewing, etc.
 */
export async function requireCustomer() {
  const user = await requireUser();
  if (isAdmin(user.role)) {
    throw new Error("FORBIDDEN: This operation is for customers only");
  }
  return user;
}

export async function hasPurchasedCourse(userId: string, courseId: string) {
  const purchase = await withRetry(async () => {
    return prisma.purchase.findFirst({
      where: {
        userId,
        courseId,
        status: "paid",
      },
      select: { id: true },
    });
  });

  return Boolean(purchase);
}

export type CourseAccessSource = "admin" | "purchase" | "subscription" | "none";

function getMinimumTierForCourse(courseTier: "STANDARD" | "PREMIUM"): "starter" | "professional" {
  return courseTier === "PREMIUM" ? "professional" : "starter";
}

function subscriptionTierMeetsRequirement(
  userTier: "starter" | "professional" | "founder",
  requiredTier: "starter" | "professional"
) {
  const userTierIndex = SUBSCRIPTION_TIERS.indexOf(userTier);
  const requiredTierIndex = SUBSCRIPTION_TIERS.indexOf(requiredTier);
  return userTierIndex >= requiredTierIndex;
}

export async function getCourseAccessState(
  userId: string,
  role: Role,
  courseId: string
) {
  if (isAdmin(role)) {
    return {
      granted: true,
      source: "admin" as CourseAccessSource,
      owned: false,
      subscriptionActive: false,
    };
  }

  const [owned, course] = await Promise.all([
    hasPurchasedCourse(userId, courseId),
    prisma.course.findUnique({
      where: { id: courseId },
      select: { tier: true },
    }),
  ]);

  if (owned) {
    return {
      granted: true,
      source: "purchase" as CourseAccessSource,
      owned: true,
      subscriptionActive: false,
    };
  }

  if (!course) {
    return {
      granted: false,
      source: "none" as CourseAccessSource,
      owned: false,
      subscriptionActive: false,
    };
  }

  const subscription = await getUserSubscription(userId);
  const subscriptionActive = isSubscriptionActiveNow(subscription);

  if (!subscriptionActive || !subscription) {
    return {
      granted: false,
      source: "none" as CourseAccessSource,
      owned: false,
      subscriptionActive: false,
    };
  }

  const requiredTier = getMinimumTierForCourse(course.tier);
  const hasSubscriptionAccess = subscriptionTierMeetsRequirement(
    subscription.plan.tier,
    requiredTier
  );

  if (hasSubscriptionAccess) {
    return {
      granted: true,
      source: "subscription" as CourseAccessSource,
      owned: false,
      subscriptionActive: true,
    };
  }

  return {
    granted: false,
    source: "none" as CourseAccessSource,
    owned: false,
    subscriptionActive: true,
  };
}

export async function hasCourseAccess(
  userId: string,
  role: Role,
  courseId: string
) {
  const access = await getCourseAccessState(userId, role, courseId);
  return access.granted;
}
