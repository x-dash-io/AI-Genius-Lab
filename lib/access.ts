import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { hasRole, type Role } from "@/lib/rbac";

export async function requireUser() {
  const session = await auth();
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

export async function hasPurchasedCourse(userId: string, courseId: string) {
  const purchase = await prisma.purchase.findFirst({
    where: {
      userId,
      courseId,
      status: "paid",
    },
    select: { id: true },
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

  return hasPurchasedCourse(userId, courseId);
}
