import { prisma } from "@/lib/prisma";
import { cache } from "react";

export interface HomepageStats {
  totalCourses: number;
  totalStudents: number;
  totalLessons: number;
  averageRating: number;
  totalReviews: number;
  categoriesWithCourses: Array<{
    id: string;
    name: string;
    slug: string;
    description: string | null;
    icon: string | null;
    color: string | null;
    courseCount: number;
    courses: Array<{
      id: string;
      title: string;
      slug: string;
      priceCents: number;
    }>;
  }>;
}

/**
 * Fetch homepage statistics with caching
 * This is cached per request to avoid multiple DB calls
 */
export const getHomepageStats = cache(async (): Promise<HomepageStats> => {
  // Return empty stats immediately if no database connection
  const emptyStats: HomepageStats = {
    totalCourses: 0,
    totalStudents: 0,
    totalLessons: 0,
    averageRating: 0,
    totalReviews: 0,
    categoriesWithCourses: [],
  };

  try {
    // Get total published courses
    const totalCourses = await prisma.course.count({
      where: { isPublished: true },
    });

    // Get total students (users with at least one enrollment)
    const totalStudents = await prisma.user.count({
      where: {
        Enrollment: {
          some: {},
        },
      },
    });

    // Get total lessons across all published courses
    const totalLessons = await prisma.lesson.count({
      where: {
        Section: {
          Course: {
            isPublished: true,
          },
        },
      },
    });

    // Get average rating and total reviews
    const reviewStats = await prisma.review.aggregate({
      _avg: {
        rating: true,
      },
      _count: {
        id: true,
      },
    });

    // Get active categories with their published courses
    const categories = await prisma.category.findMany({
      where: {
        isActive: true,
        Course: {
          some: {
            isPublished: true,
          },
        },
      },
      orderBy: {
        sortOrder: "asc",
      },
      include: {
        Course: {
          where: {
            isPublished: true,
          },
          select: {
            id: true,
            title: true,
            slug: true,
            priceCents: true,
          },
          take: 5, // Limit to 5 courses per category for homepage
          orderBy: {
            createdAt: "desc",
          },
        },
      },
    });

    const categoriesWithCourses = categories.map((category) => ({
      id: category.id,
      name: category.name,
      slug: category.slug,
      description: category.description,
      icon: category.icon,
      color: category.color,
      courseCount: category.Course.length,
      courses: category.Course,
    }));

    return {
      totalCourses,
      totalStudents,
      totalLessons,
      averageRating: reviewStats._avg.rating || 0,
      totalReviews: reviewStats._count.id,
      categoriesWithCourses,
    };
  } catch (error) {
    console.error("Error fetching homepage stats:", error);
    // Return empty stats instead of throwing - page should still render
    return emptyStats;
  }
});
