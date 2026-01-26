import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma, withRetry } from "@/lib/prisma";
import { hasRole, type Role } from "@/lib/rbac";
import { hasCourseAccess as checkSubscriptionAccess, hasActiveSubscription } from "./subscription";
import { redirect } from "next/navigation";

export async function requireUser() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    throw new Error("UNAUTHORIZED");
  }
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

export async function hasCourseAccess(
  userId: string,
  role: Role,
  courseId: string
) {
  if (isAdmin(role)) {
    return true;
  }

  // Check both purchased and subscription access
  const access = await checkSubscriptionAccess(userId, courseId);
  return access.hasAccess;
}

export async function requireCourseAccess(courseId: string) {
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.id) {
    redirect("/sign-in");
  }

  const access = await checkSubscriptionAccess(session.user.id, courseId);
  
  if (!access.hasAccess) {
    redirect(`/courses/${courseId}?checkout=required`);
  }

  return access;
}

export async function requireSubscription() {
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.id) {
    redirect("/sign-in");
  }

  const hasActive = await hasActiveSubscription(session.user.id);
  
  if (!hasActive) {
    redirect("/subscription?upgrade=required");
  }

  return true;
}

export async function checkSubscription(userId?: string) {
  if (!userId) {
    const session = await getServerSession(authOptions);
    userId = session?.user?.id;
  }

  if (!userId) {
    return { hasSubscription: false, reason: "not_authenticated" };
  }

  const hasActive = await hasActiveSubscription(userId);
  
  return { hasSubscription: hasActive };
}
