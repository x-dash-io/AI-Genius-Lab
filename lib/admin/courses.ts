import { prisma, withRetry } from "@/lib/prisma";

export async function getAllCourses() {
  return withRetry(async () => {
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
  });
}

export async function getCourseForEdit(courseId: string) {
  return withRetry(async () => {
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
  });
}

export async function createCourse(data: {
  title: string;
  slug: string;
  description?: string;
  category?: string;
  priceCents: number;
  inventory?: number | null;
  isPublished?: boolean;
}) {
  return prisma.course.create({
    data: {
      title: data.title,
      slug: data.slug,
      description: data.description,
      category: data.category,
      priceCents: data.priceCents,
      inventory: data.inventory ?? null,
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
    inventory?: number | null;
    isPublished?: boolean;
  }
) {
  return prisma.course.update({
    where: { id: courseId },
    data,
  });
}

export async function deleteCourse(courseId: string) {
  // Check if course has any purchases
  const purchaseCount = await withRetry(async () => {
    return prisma.purchase.count({
      where: { courseId, status: "paid" },
    });
  });

  if (purchaseCount > 0) {
    throw new Error(`Cannot delete course: ${purchaseCount} user(s) have purchased this course.`);
  }

  return withRetry(async () => {
    return prisma.course.delete({
      where: { id: courseId },
    });
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
  // Get the course ID for this section to check for purchases
  const section = await withRetry(async () => {
    return prisma.section.findUnique({
      where: { id: sectionId },
      select: { courseId: true },
    });
  });

  if (!section) {
    throw new Error("Section not found");
  }

  // Check if course has any purchases
  const purchaseCount = await withRetry(async () => {
    return prisma.purchase.count({
      where: { courseId: section.courseId, status: "paid" },
    });
  });

  if (purchaseCount > 0) {
    throw new Error(`Cannot delete section: ${purchaseCount} user(s) have purchased this course.`);
  }

  return withRetry(async () => {
    return prisma.section.delete({
      where: { id: sectionId },
    });
  });
}

export async function createLesson(data: {
  sectionId: string;
  title: string;
  durationSeconds?: number;
  isLocked?: boolean;
  allowDownload?: boolean;
  sortOrder: number;
}) {
  return prisma.lesson.create({
    data: {
      sectionId: data.sectionId,
      title: data.title,
      durationSeconds: data.durationSeconds,
      isLocked: data.isLocked ?? true,
      allowDownload: data.allowDownload ?? false,
      sortOrder: data.sortOrder,
    },
  });
}

export async function createLessonContent(data: {
  lessonId: string;
  contentType: "video" | "audio" | "pdf" | "link" | "file";
  contentUrl?: string;
  title?: string;
  sortOrder: number;
}) {
  return prisma.lessonContent.create({
    data: {
      lessonId: data.lessonId,
      contentType: data.contentType,
      contentUrl: data.contentUrl,
      title: data.title,
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
  // Get the course ID for this lesson to check for purchases
  const lesson = await withRetry(async () => {
    return prisma.lesson.findUnique({
      where: { id: lessonId },
      select: {
        section: {
          select: { courseId: true },
        },
      },
    });
  });

  if (!lesson) {
    throw new Error("Lesson not found");
  }

  // Check if course has any purchases
  const purchaseCount = await withRetry(async () => {
    return prisma.purchase.count({
      where: { courseId: lesson.section.courseId, status: "paid" },
    });
  });

  if (purchaseCount > 0) {
    throw new Error(`Cannot delete lesson: ${purchaseCount} user(s) have purchased this course.`);
  }

  return withRetry(async () => {
    return prisma.lesson.delete({
      where: { id: lessonId },
    });
  });
}