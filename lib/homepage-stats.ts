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
      imageUrl: string | null;
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
        enrollments: {
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
      },
      orderBy: {
        sortOrder: "asc",
      },
      include: {
        courses: {
          where: {
            isPublished: true,
          },
          select: {
            id: true,
            title: true,
            slug: true,
            priceCents: true,
            imageUrl: true,
          },
          take: 6,
          orderBy: {
            createdAt: "desc",
          },
        },
      },
    });

    let categoriesWithCourses = categories.map((category) => ({
      id: category.id,
      name: category.name,
      slug: category.slug,
      description: category.description,
      icon: category.icon,
      color: category.color,
      courseCount: category.courses.length,
      courses: category.courses,
    }));

    // If no courses found via categories but they exist, fetch them directly
    const allPublishedCourses = categoriesWithCourses.flatMap(c => c.courses);
    if (allPublishedCourses.length === 0 && totalCourses > 0) {
      const topCourses = await prisma.course.findMany({
        where: { isPublished: true },
        select: {
          id: true,
          title: true,
          slug: true,
          priceCents: true,
          imageUrl: true,
        },
        take: 6,
        orderBy: { createdAt: "desc" },
      });

      if (topCourses.length > 0) {
        categoriesWithCourses = [{
          id: "featured",
          name: "Featured Courses",
          slug: "featured",
          description: "Our top curated AI modules",
          icon: "Sparkles",
          color: null,
          courseCount: topCourses.length,
          courses: topCourses,
        }];
      }
    }

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
