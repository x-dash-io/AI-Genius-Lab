import { prisma } from "@/lib/prisma";
import type { Role } from "@/lib/rbac";

export async function getAllUsers() {
  return prisma.user.findMany({
    include: {
      _count: {
        select: {
          purchases: true,
          enrollments: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function getUserById(userId: string) {
  return prisma.user.findUnique({
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
  });
}

export async function updateUserRole(userId: string, role: Role) {
  return prisma.user.update({
    where: { id: userId },
    data: { role },
  });
}
