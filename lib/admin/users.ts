import { prisma, withRetry } from "@/lib/prisma";
import type { Role } from "@/lib/rbac";

export async function getAllUsers() {
  return withRetry(() => prisma.user.findMany({
    include: {
      _count: {
        select: {
          Purchase: true,
          Enrollment: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  }));
}

export async function getUserById(userId: string) {
  return withRetry(() => prisma.user.findUnique({
    where: { id: userId },
    include: {
      Purchase: {
        include: {
          Course: {
            select: {
              id: true,
              title: true,
              slug: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
      },
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
        orderBy: { grantedAt: "desc" },
      },
      Progress: {
        include: {
          Lesson: {
            include: {
              Section: {
                include: {
                  Course: {
                    select: {
                      title: true,
                      slug: true,
                    },
                  },
                },
              },
            },
          },
        },
        orderBy: { updatedAt: "desc" },
        take: 10,
      },
      ActivityLog: {
        orderBy: { createdAt: "desc" },
        take: 10,
      },
    },
  }));
}

export async function updateUserRole(userId: string, role: Role) {
  return withRetry(() => prisma.user.update({
    where: { id: userId },
    data: { role },
  }));
}
