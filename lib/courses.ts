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
      instructor: {
        select: { name: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function getCoursePreviewBySlug(slug: string) {
  return prisma.course.findUnique({
    where: { slug },
    select: {
      id: true,
      slug: true,
      title: true,
      description: true,
      priceCents: true,
      instructor: {
        select: { name: true },
      },
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
