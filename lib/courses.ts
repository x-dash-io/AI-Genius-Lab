import { prisma } from "@/lib/prisma";
import { getCached, cacheKeys } from "@/lib/cache";

export async function getPublishedCourses() {
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
}

export async function getPublishedCoursesByCategory(category: string) {
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
}

export async function getCoursePreviewBySlug(slug: string) {
  const cacheKey = cacheKeys.coursePreview(slug);
  
  return getCached(
    cacheKey,
    async () => {
      const course = await prisma.course.findUnique({
        where: { slug },
        select: {
          id: true,
          slug: true,
          title: true,
          description: true,
          priceCents: true,
          sections: {
            orderBy: { sortOrder: "asc" },
            select: {
              id: true,
              title: true,
              lessons: {
                orderBy: { sortOrder: "asc" },
                select: {
                  id: true,
                  title: true,
                  contentType: true,
                  isLocked: true,
                },
              },
            },
          },
        },
      });
      return course;
    },
    300 // Cache for 5 minutes
  );
}

export async function getCourseForLibraryBySlug(slug: string) {
  return prisma.course.findUnique({
    where: { slug },
    select: {
      id: true,
      slug: true,
      title: true,
      sections: {
        orderBy: { sortOrder: "asc" },
        select: {
          id: true,
          title: true,
          lessons: {
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
}

export async function getLessonById(lessonId: string) {
  return prisma.lesson.findUnique({
    where: { id: lessonId },
    include: {
      section: {
        include: {
          course: true,
        },
      },
    },
  });
}
