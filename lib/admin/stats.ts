import { prisma } from "@/lib/prisma";

export async function getAdminStats() {
  const [
    totalCourses,
    publishedCourses,
    totalUsers,
    adminUsers,
    totalRevenue,
    monthlyRevenue,
    activeEnrollments,
    recentPurchases,
  ] = await Promise.all([
    prisma.course.count(),
    prisma.course.count({ where: { isPublished: true } }),
    prisma.user.count(),
    prisma.user.count({ where: { role: "admin" } }),
    prisma.purchase.aggregate({
      where: { status: "paid" },
      _sum: { amountCents: true },
    }),
    prisma.purchase.aggregate({
      where: {
        status: "paid",
        createdAt: {
          gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
        },
      },
      _sum: { amountCents: true },
    }),
    prisma.enrollment.count(),
    prisma.purchase.findMany({
      where: { status: "paid" },
      orderBy: { createdAt: "desc" },
      take: 5,
      include: {
        User: {
          select: { email: true, name: true },
        },
        Course: {
          select: { title: true, slug: true },
        },
      },
    }),
  ]);

  return {
    courses: {
      total: totalCourses,
      published: publishedCourses,
      unpublished: totalCourses - publishedCourses,
    },
    users: {
      total: totalUsers,
      admins: adminUsers,
      customers: totalUsers - adminUsers,
    },
    revenue: {
      allTime: totalRevenue._sum.amountCents || 0,
      monthly: monthlyRevenue._sum.amountCents || 0,
    },
    enrollments: {
      active: activeEnrollments,
    },
    recentPurchases,
  };
}
