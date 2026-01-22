"use server";

import { prisma } from "@/lib/prisma";

export async function getAllPublishedLearningPaths() {
  return prisma.learningPath.findMany({
    include: {
      courses: {
        where: {
          course: {
            isPublished: true,
          },
        },
        include: {
          course: {
            select: {
              id: true,
              title: true,
              slug: true,
              description: true,
              priceCents: true,
            },
          },
        },
        orderBy: { sortOrder: "asc" },
      },
      _count: {
        select: {
          courses: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function getLearningPathBySlug(slug: string) {
  // Note: We'll need to add a slug field to LearningPath model
  // For now, using ID lookup
  return prisma.learningPath.findUnique({
    where: { id: slug },
    include: {
      courses: {
        where: {
          course: {
            isPublished: true,
          },
        },
        include: {
          course: {
            select: {
              id: true,
              title: true,
              slug: true,
              description: true,
              priceCents: true,
            },
          },
        },
        orderBy: { sortOrder: "asc" },
      },
    },
  });
}
