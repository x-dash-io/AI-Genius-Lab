import { prisma } from "@/lib/prisma";

export async function getPublishedCourses() {
  return prisma.course.findMany({
    where: { isPublished: true },
    select: {
      id: true,
      slug: true,
      title: true,
      description: true,
      priceCents: true,
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function getCoursePreviewBySlug(slug: string) {
  // Check cache first
  const cacheKey = cacheKeys.coursePreview(slug);
  const cached = cache.get(cacheKey);
  if (cached) {
    return cached;
  }
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

  if (course) {
    cache.set(cacheKey, course, 300); // Cache for 5 minutes
  }
  
  return course;
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
