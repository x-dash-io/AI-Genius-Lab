import { prisma, withRetry } from "@/lib/prisma";
import { getCached, cacheKeys } from "@/lib/cache";

export async function getPublishedCourses() {
  return withRetry(async () => {
    return prisma.course.findMany({
      where: { isPublished: true },
      select: {
        id: true,
        slug: true,
        title: true,
        description: true,
        category: true,
        priceCents: true,
        inventory: true,
      },
      orderBy: { createdAt: "desc" },
    });
  });
}

export async function getPublishedCoursesByCategory(category: string) {
  return withRetry(async () => {
    return prisma.course.findMany({
      where: { isPublished: true, category },
      select: {
        id: true,
        slug: true,
        title: true,
        description: true,
        category: true,
        priceCents: true,
        inventory: true,
      },
      orderBy: { createdAt: "desc" },
    });
  });
}

export async function getCoursePreviewBySlug(slug: string) {
  const cacheKey = cacheKeys.coursePreview(slug);

  return getCached(
    cacheKey,
    async () => {
      const course = await withRetry(async () => {
        return prisma.course.findUnique({
          where: { slug },
          select: {
            id: true,
            slug: true,
            title: true,
            description: true,
            priceCents: true,
            Section: {
              orderBy: { sortOrder: "asc" },
              select: {
                id: true,
                title: true,
                Lesson: {
                  orderBy: { sortOrder: "asc" },
                  select: {
                    id: true,
                    title: true,
                    isLocked: true,
                    LessonContent: {
                      orderBy: { sortOrder: "asc" },
                      take: 1,
                      select: {
                        contentType: true,
                      },
                    },
                  },
                },
              },
            },
          },
        });
      });
      return course;
    },
    300 // Cache for 5 minutes
  );
}

export async function getCourseForLibraryBySlug(slug: string) {
  return withRetry(async () => {
    return prisma.course.findUnique({
      where: { slug },
      select: {
        id: true,
        slug: true,
        title: true,
        Section: {
          orderBy: { sortOrder: "asc" },
          select: {
            id: true,
            title: true,
            Lesson: {
              orderBy: { sortOrder: "asc" },
              select: {
                id: true,
                title: true,
              },
            },
          },
        },
      },
    });
  });
}

export async function getLessonById(lessonId: string) {
  return withRetry(async () => {
    return prisma.lesson.findUnique({
      where: { id: lessonId },
      include: {
        Section: {
          include: {
            Course: true,
          },
        },
      },
    });
  });
}
