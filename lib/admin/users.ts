import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/access";
import { ROLES, type Role } from "@/lib/rbac";

function isRole(value: string): value is Role {
  return (ROLES as readonly string[]).includes(value);
}

function createActivityLogId() {
  return `activity_${Date.now()}_${crypto.randomUUID()}`;
}

export async function getAllUsers() {
  await requireRole("admin");

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
  await requireRole("admin");

  return prisma.user.findUnique({
    where: { id: userId },
    include: {
      purchases: {
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
      enrollments: {
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
      progress: {
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
      activityLogs: {
        orderBy: { createdAt: "desc" },
        take: 10,
      },
    },
  });
}

export async function updateUserRole(userId: string, role: string) {
  const admin = await requireRole("admin");

  if (userId === admin.id) {
    throw new Error("FORBIDDEN: You cannot change your own role");
  }

  if (!isRole(role)) {
    throw new Error("BAD_REQUEST: Invalid role");
  }

  return prisma.$transaction(async (tx) => {
    const targetUser = await tx.user.findUnique({
      where: { id: userId },
      select: { id: true, role: true },
    });

    if (!targetUser) {
      throw new Error("NOT_FOUND: User not found");
    }

    if (targetUser.role === role) {
      return tx.user.findUniqueOrThrow({
        where: { id: userId },
      });
    }

    const updatedUser = await tx.user.update({
      where: { id: userId },
      data: { role },
    });

    await tx.activityLog.create({
      data: {
        id: createActivityLogId(),
        userId,
        type: "role_changed",
        metadata: {
          previousRole: targetUser.role,
          nextRole: role,
          changedByUserId: admin.id,
        },
      },
    });

    return updatedUser;
  });
}
