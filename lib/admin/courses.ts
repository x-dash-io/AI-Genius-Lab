import { prisma } from "@/lib/prisma";

export async function getAllCourses() {
  return prisma.course.findMany({
    include: {
      _count: {
        select: {
          sections: true,
          purchases: true,
          enrollments: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function getCourseForEdit(courseId: string) {
  return prisma.course.findUnique({
    where: { id: courseId },
    include: {
      sections: {
        orderBy: { sortOrder: "asc" },
        include: {
          lessons: {
            orderBy: { sortOrder: "asc" },
          },
        },
      },
    },
  });
}

export async function createCourse(data: {
  title: string;
  slug: string;
  description?: string;
  category?: string;
  priceCents: number;
  isPublished?: boolean;
}) {
  return prisma.course.create({
    data: {
      title: data.title,
      slug: data.slug,
      description: data.description,
      category: data.category,
      priceCents: data.priceCents,
      isPublished: data.isPublished ?? false,
    },
  });
}

export async function updateCourse(
  courseId: string,
  data: {
    title?: string;
    slug?: string;
    description?: string;
    category?: string;
    priceCents?: number;
    isPublished?: boolean;
  }
) {
  return prisma.course.update({
    where: { id: courseId },
    data,
  });
}

export async function deleteCourse(courseId: string) {
  return prisma.course.delete({
    where: { id: courseId },
  });
}

export async function createSection(courseId: string, title: string, sortOrder: number) {
  return prisma.section.create({
    data: {
      courseId,
      title,
      sortOrder,
    },
  });
}

export async function updateSection(
  sectionId: string,
  data: { title?: string; sortOrder?: number }
) {
  return prisma.section.update({
    where: { id: sectionId },
    data,
  });
}

export async function deleteSection(sectionId: string) {
  return prisma.section.delete({
    where: { id: sectionId },
  });
}

export async function createLesson(data: {
  sectionId: string;
  title: string;
  contentType: "video" | "audio" | "pdf" | "link" | "file";
  contentUrl?: string;
  durationSeconds?: number;
  isLocked?: boolean;
  allowDownload?: boolean;
  sortOrder: number;
}) {
  return prisma.lesson.create({
    data: {
      sectionId: data.sectionId,
      title: data.title,
      contentType: data.contentType,
      contentUrl: data.contentUrl,
      durationSeconds: data.durationSeconds,
      isLocked: data.isLocked ?? true,
      allowDownload: data.allowDownload ?? false,
      sortOrder: data.sortOrder,
    },
  });
}

export async function updateLesson(
  lessonId: string,
  data: {
    title?: string;
    contentType?: "video" | "audio" | "pdf" | "link" | "file";
    contentUrl?: string;
    durationSeconds?: number;
    isLocked?: boolean;
    allowDownload?: boolean;
    sortOrder?: number;
  }
) {
  return prisma.lesson.update({
    where: { id: lessonId },
    data,
  });
}

export async function deleteLesson(lessonId: string) {
  return prisma.lesson.delete({
    where: { id: lessonId },
  });
}
