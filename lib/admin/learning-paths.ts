"use server";

import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/access";

export async function getAllLearningPaths() {
  return prisma.learningPath.findMany({
    include: {
      LearningPathCourse: {
        include: {
          Course: {
            select: {
              id: true,
              title: true,
              slug: true,
              description: true,
              priceCents: true,
              isPublished: true,
            },
          },
        },
        orderBy: { sortOrder: "asc" },
      },
      _count: {
        select: {
          LearningPathCourse: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function getLearningPathById(pathId: string) {
  return prisma.learningPath.findUnique({
    where: { id: pathId },
    include: {
      LearningPathCourse: {
        include: {
          Course: {
            select: {
              id: true,
              title: true,
              slug: true,
              description: true,
              priceCents: true,
              isPublished: true,
            },
          },
        },
        orderBy: { sortOrder: "asc" },
      },
    },
  });
}

export async function createLearningPath(data: {
  title: string;
  description?: string;
}) {
  await requireRole("admin");
  
  const pathId = `path_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  const now = new Date();

  return prisma.learningPath.create({
    data: {
      id: pathId,
      title: data.title,
      description: data.description,
      updatedAt: now,
    },
  });
}

export async function updateLearningPath(
  pathId: string,
  data: {
    title?: string;
    description?: string;
  }
) {
  await requireRole("admin");

  return prisma.learningPath.update({
    where: { id: pathId },
    data: {
      title: data.title,
      description: data.description,
    },
  });
}

export async function deleteLearningPath(pathId: string) {
  await requireRole("admin");

  return prisma.learningPath.delete({
    where: { id: pathId },
  });
}

export async function addCourseToPath(
  pathId: string,
  courseId: string,
  sortOrder?: number
) {
  await requireRole("admin");

  // Get max sort order if not provided
  if (sortOrder === undefined) {
    const path = await prisma.learningPath.findUnique({
      where: { id: pathId },
      include: {
        courses: {
          orderBy: { sortOrder: "desc" },
          take: 1,
        },
      },
    });

    sortOrder = path?.courses[0]?.sortOrder
      ? path.courses[0].sortOrder + 1
      : 0;
  }

  return prisma.learningPathCourse.create({
    data: {
      id: `lpc_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
      learningPathId: pathId,
      courseId,
      sortOrder,
    },
    include: {
      course: {
        select: {
          id: true,
          title: true,
          slug: true,
        },
      },
    },
  });
}

export async function removeCourseFromPath(pathId: string, courseId: string) {
  await requireRole("admin");

  return prisma.learningPathCourse.deleteMany({
    where: {
      learningPathId: pathId,
      courseId,
    },
  });
}

export async function updateCourseOrder(
  pathId: string,
  courseOrders: { courseId: string; sortOrder: number }[]
) {
  await requireRole("admin");

  // Update all course orders in a transaction
  await prisma.$transaction(
    courseOrders.map(({ courseId, sortOrder }) =>
      prisma.learningPathCourse.updateMany({
        where: {
          learningPathId: pathId,
          courseId,
        },
        data: { sortOrder },
      })
    )
  );
}
