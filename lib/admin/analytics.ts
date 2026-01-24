import { prisma } from "@/lib/prisma";

export interface RevenueDataPoint {
  date: string;
  revenue: number;
  count: number;
}

export interface CategorySalesData {
  category: string;
  sales: number;
  revenue: number;
}

export interface UserGrowthDataPoint {
  date: string;
  users: number;
  cumulative: number;
}

export interface EnrollmentTrendDataPoint {
  date: string;
  enrollments: number;
}

export interface TopCourseData {
  courseId: string;
  title: string;
  sales: number;
  revenue: number;
}

/**
 * Get revenue data over time (last 30 days)
 */
export async function getRevenueOverTime(days: number = 30): Promise<RevenueDataPoint[]> {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  const purchases = await prisma.purchase.findMany({
    where: {
      status: "paid",
      createdAt: {
        gte: startDate,
      },
    },
    select: {
      amountCents: true,
      createdAt: true,
    },
    orderBy: {
      createdAt: "asc",
    },
  });

  // Group by date
  const dailyData = new Map<string, { revenue: number; count: number }>();

  purchases.forEach((purchase) => {
    const date = purchase.createdAt.toISOString().split("T")[0];
    const existing = dailyData.get(date) || { revenue: 0, count: 0 };
    dailyData.set(date, {
      revenue: existing.revenue + purchase.amountCents,
      count: existing.count + 1,
    });
  });

  // Fill in missing dates with zeros
  const result: RevenueDataPoint[] = [];
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split("T")[0];
    const data = dailyData.get(dateStr) || { revenue: 0, count: 0 };
    result.push({
      date: dateStr,
      revenue: data.revenue / 100, // Convert cents to dollars
      count: data.count,
    });
  }

  return result;
}

/**
 * Get sales by category
 */
export async function getCategorySales(): Promise<CategorySalesData[]> {
  const purchases = await prisma.purchase.findMany({
    where: {
      status: "paid",
    },
    include: {
      Course: {
        select: {
          category: true,
        },
      },
    },
  });

  const categoryMap = new Map<string, { sales: number; revenue: number }>();

  purchases.forEach((purchase) => {
    const category = purchase.Course.category || "Uncategorized";
    const existing = categoryMap.get(category) || { sales: 0, revenue: 0 };
    categoryMap.set(category, {
      sales: existing.sales + 1,
      revenue: existing.revenue + purchase.amountCents,
    });
  });

  return Array.from(categoryMap.entries()).map(([category, data]) => ({
    category,
    sales: data.sales,
    revenue: data.revenue / 100, // Convert cents to dollars
  }));
}

/**
 * Get user growth over time (last 30 days)
 */
export async function getUserGrowth(days: number = 30): Promise<UserGrowthDataPoint[]> {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  const users = await prisma.user.findMany({
    where: {
      createdAt: {
        gte: startDate,
      },
    },
    select: {
      createdAt: true,
    },
    orderBy: {
      createdAt: "asc",
    },
  });

  // Get total users before start date
  const usersBeforeStart = await prisma.user.count({
    where: {
      createdAt: {
        lt: startDate,
      },
    },
  });

  // Group by date
  const dailyData = new Map<string, number>();
  users.forEach((user) => {
    const date = user.createdAt.toISOString().split("T")[0];
    dailyData.set(date, (dailyData.get(date) || 0) + 1);
  });

  // Build cumulative data
  const result: UserGrowthDataPoint[] = [];
  let cumulative = usersBeforeStart;

  for (let i = days - 1; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split("T")[0];
    const newUsers = dailyData.get(dateStr) || 0;
    cumulative += newUsers;
    result.push({
      date: dateStr,
      users: newUsers,
      cumulative,
    });
  }

  return result;
}

/**
 * Get enrollment trends (last 30 days)
 */
export async function getEnrollmentTrends(days: number = 30): Promise<EnrollmentTrendDataPoint[]> {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  const enrollments = await prisma.enrollment.findMany({
    where: {
      grantedAt: {
        gte: startDate,
      },
    },
    select: {
      grantedAt: true,
    },
    orderBy: {
      grantedAt: "asc",
    },
  });

  // Group by date
  const dailyData = new Map<string, number>();
  enrollments.forEach((enrollment) => {
    const date = enrollment.grantedAt.toISOString().split("T")[0];
    dailyData.set(date, (dailyData.get(date) || 0) + 1);
  });

  // Fill in missing dates
  const result: EnrollmentTrendDataPoint[] = [];
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split("T")[0];
    result.push({
      date: dateStr,
      enrollments: dailyData.get(dateStr) || 0,
    });
  }

  return result;
}

/**
 * Get top courses by revenue
 */
export async function getTopCoursesByRevenue(limit: number = 10): Promise<TopCourseData[]> {
  const purchases = await prisma.purchase.findMany({
    where: {
      status: "paid",
    },
    include: {
      Course: {
        select: {
          id: true,
          title: true,
        },
      },
    },
  });

  const courseMap = new Map<string, { title: string; sales: number; revenue: number }>();

  purchases.forEach((purchase) => {
    const courseId = purchase.courseId;
    const existing = courseMap.get(courseId) || {
      title: purchase.Course.title,
      sales: 0,
      revenue: 0,
    };
    courseMap.set(courseId, {
      title: purchase.Course.title,
      sales: existing.sales + 1,
      revenue: existing.revenue + purchase.amountCents,
    });
  });

  return Array.from(courseMap.values())
    .map((data) => ({
      courseId: Array.from(courseMap.entries()).find(([_, v]) => v.title === data.title)?.[0] || "",
      title: data.title,
      sales: data.sales,
      revenue: data.revenue / 100, // Convert cents to dollars
    }))
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, limit);
}
