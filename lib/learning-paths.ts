"use server";

import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/access";

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

/**
 * Calculate the price user will pay for a learning path (excluding already purchased courses)
 */
export async function calculateLearningPathPrice(userId: string, pathId: string): Promise<{
  fullPriceCents: number;
  adjustedPriceCents: number;
  alreadyPurchasedCents: number;
  coursesToPurchase: number;
  totalCourses: number;
}> {
  const path = await prisma.learningPath.findUnique({
    where: { id: pathId },
    include: {
      courses: {
        include: {
          course: {
            select: {
              id: true,
              priceCents: true,
            },
          },
        },
      },
    },
  });

  if (!path || path.courses.length === 0) {
    return {
      fullPriceCents: 0,
      adjustedPriceCents: 0,
      alreadyPurchasedCents: 0,
      coursesToPurchase: 0,
      totalCourses: 0,
    };
  }

  const courseIds = path.courses.map((pc) => pc.course.id);
  const existingPurchases = await prisma.purchase.findMany({
    where: {
      userId,
      courseId: { in: courseIds },
      status: "paid",
    },
  });

  const existingCourseIds = new Set(existingPurchases.map((p) => p.courseId));
  
  const fullPriceCents = path.courses.reduce((sum, pc) => sum + pc.course.priceCents, 0);
  const alreadyPurchasedCents = path.courses
    .filter((pc) => existingCourseIds.has(pc.course.id))
    .reduce((sum, pc) => sum + pc.course.priceCents, 0);
  const adjustedPriceCents = fullPriceCents - alreadyPurchasedCents;
  const coursesToPurchase = path.courses.filter((pc) => !existingCourseIds.has(pc.course.id)).length;

  return {
    fullPriceCents,
    adjustedPriceCents,
    alreadyPurchasedCents,
    coursesToPurchase,
    totalCourses: path.courses.length,
  };
}

/**
 * Check if user has enrolled in all courses in a learning path
 */
export async function hasEnrolledInLearningPath(userId: string, pathId: string): Promise<boolean> {
  const path = await prisma.learningPath.findUnique({
    where: { id: pathId },
    include: {
      courses: {
        include: {
          course: {
            select: { id: true },
          },
        },
      },
    },
  });

  if (!path || path.courses.length === 0) {
    return false;
  }

  const courseIds = path.courses.map((pc) => pc.course.id);
  const purchases = await prisma.purchase.findMany({
    where: {
      userId,
      courseId: { in: courseIds },
      status: "paid",
    },
  });

  return purchases.length === courseIds.length;
}

/**
 * Create purchases for all courses in a learning path
 */
export async function createLearningPathPurchases(userId: string, pathId: string) {
  const user = await requireUser();
  if (user.id !== userId) {
    throw new Error("FORBIDDEN: You can only enroll yourself");
  }

  const path = await prisma.learningPath.findUnique({
    where: { id: pathId },
    include: {
      courses: {
        include: {
          course: {
            select: {
              id: true,
              title: true,
              priceCents: true,
            },
          },
        },
        orderBy: { sortOrder: "asc" },
      },
    },
  });

  if (!path || path.courses.length === 0) {
    throw new Error("Learning path not found or has no courses");
  }

  // Check existing purchases
  const courseIds = path.courses.map((pc) => pc.course.id);
  const existingPurchases = await prisma.purchase.findMany({
    where: {
      userId,
      courseId: { in: courseIds },
      status: "paid",
    },
  });

  const existingCourseIds = new Set(existingPurchases.map((p) => p.courseId));
  const coursesToPurchase = path.courses.filter(
    (pc) => !existingCourseIds.has(pc.course.id)
  );

  if (coursesToPurchase.length === 0) {
    throw new Error("You have already enrolled in all courses in this path");
  }

  // Create pending purchases for courses not yet purchased
  const purchases = await Promise.all(
    coursesToPurchase.map((pc) =>
      prisma.purchase.upsert({
        where: {
          userId_courseId: {
            userId,
            courseId: pc.course.id,
          },
        },
        update: {
          status: "pending",
          provider: "paypal",
        },
        create: {
          userId,
          courseId: pc.course.id,
          amountCents: pc.course.priceCents,
          currency: "usd",
          status: "pending",
          provider: "paypal",
        },
      })
    )
  );

  return {
    purchases,
    totalAmountCents: coursesToPurchase.reduce(
      (sum, pc) => sum + pc.course.priceCents,
      0
    ),
  };
}
