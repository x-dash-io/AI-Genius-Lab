/**
 * Test utilities and helpers for integration testing
 */

import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/password";

// Test data constants
export const TEST_USER = {
  email: "test@example.com",
  password: "TestPassword123!",
  name: "Test User",
};

export const TEST_ADMIN = {
  email: "admin@example.com",
  password: "AdminPassword123!",
  name: "Test Admin",
};

export const TEST_COURSE = {
  slug: "test-course",
  title: "Test Course",
  description: "A test course for integration testing",
  priceCents: 9999,
  isPublished: true,
};

/**
 * Create a test user in the database
 */
export async function createTestUser(overrides: Partial<typeof TEST_USER> = {}) {
  const userData = { ...TEST_USER, ...overrides };
  const passwordHash = await hashPassword(userData.password);

  return prisma.user.create({
    data: {
      email: userData.email.toLowerCase(),
      passwordHash,
      name: userData.name,
      role: "customer",
    },
  });
}

/**
 * Create a test admin user in the database
 */
export async function createTestAdmin(overrides: Partial<typeof TEST_ADMIN> = {}) {
  const adminData = { ...TEST_ADMIN, ...overrides };
  const passwordHash = await hashPassword(adminData.password);

  return prisma.user.create({
    data: {
      email: adminData.email.toLowerCase(),
      passwordHash,
      name: adminData.name,
      role: "admin",
    },
  });
}

/**
 * Create a test course in the database
 */
export async function createTestCourse(overrides: Partial<typeof TEST_COURSE> = {}) {
  const courseData = { ...TEST_COURSE, ...overrides };

  return prisma.course.create({
    data: {
      slug: courseData.slug,
      title: courseData.title,
      description: courseData.description,
      priceCents: courseData.priceCents,
      isPublished: courseData.isPublished,
    },
  });
}

/**
 * Create a test section for a course
 */
export async function createTestSection(courseId: string, title: string = "Test Section") {
  return prisma.section.create({
    data: {
      courseId,
      title,
      sortOrder: 0,
    },
  });
}

/**
 * Create a test lesson for a section
 */
export async function createTestLesson(
  sectionId: string,
  title: string = "Test Lesson",
  contentType: "video" | "audio" | "pdf" | "link" | "file" = "video"
) {
  return prisma.lesson.create({
    data: {
      sectionId,
      title,
      contentType,
      contentUrl: "test-content-url",
      sortOrder: 0,
      isLocked: true,
    },
  });
}

/**
 * Create a purchase for a user and course
 */
export async function createTestPurchase(
  userId: string,
  courseId: string,
  status: "pending" | "paid" | "refunded" = "paid"
) {
  const course = await prisma.course.findUnique({
    where: { id: courseId },
    select: { priceCents: true },
  });

  return prisma.purchase.create({
    data: {
      userId,
      courseId,
      amountCents: course?.priceCents || 9999,
      currency: "usd",
      status,
      provider: "paypal",
    },
  });
}

/**
 * Create an enrollment for a user and course
 */
export async function createTestEnrollment(userId: string, courseId: string, purchaseId?: string) {
  return prisma.enrollment.create({
    data: {
      userId,
      courseId,
      purchaseId,
    },
  });
}

/**
 * Create a test learning path
 */
export async function createTestLearningPath(
  title: string = "Test Learning Path",
  courseIds: string[] = []
) {
  const path = await prisma.learningPath.create({
    data: {
      title,
      description: "A test learning path",
    },
  });

  // Add courses to the path
  for (let i = 0; i < courseIds.length; i++) {
    await prisma.learningPathCourse.create({
      data: {
        learningPathId: path.id,
        courseId: courseIds[i],
        sortOrder: i,
      },
    });
  }

  return path;
}

/**
 * Clean up test data by email pattern
 */
export async function cleanupTestUsers(emailPattern: string = "test") {
  // Delete in order to respect foreign key constraints
  await prisma.activityLog.deleteMany({
    where: {
      user: {
        email: { contains: emailPattern },
      },
    },
  });

  await prisma.progress.deleteMany({
    where: {
      user: {
        email: { contains: emailPattern },
      },
    },
  });

  await prisma.certificate.deleteMany({
    where: {
      user: {
        email: { contains: emailPattern },
      },
    },
  });

  await prisma.review.deleteMany({
    where: {
      user: {
        email: { contains: emailPattern },
      },
    },
  });

  await prisma.payment.deleteMany({
    where: {
      user: {
        email: { contains: emailPattern },
      },
    },
  });

  await prisma.enrollment.deleteMany({
    where: {
      user: {
        email: { contains: emailPattern },
      },
    },
  });

  await prisma.purchase.deleteMany({
    where: {
      user: {
        email: { contains: emailPattern },
      },
    },
  });

  await prisma.session.deleteMany({
    where: {
      user: {
        email: { contains: emailPattern },
      },
    },
  });

  await prisma.account.deleteMany({
    where: {
      user: {
        email: { contains: emailPattern },
      },
    },
  });

  await prisma.user.deleteMany({
    where: {
      email: { contains: emailPattern },
    },
  });
}

/**
 * Clean up test courses by slug pattern
 */
export async function cleanupTestCourses(slugPattern: string = "test-") {
  // Delete lessons first
  await prisma.lesson.deleteMany({
    where: {
      section: {
        course: {
          slug: { startsWith: slugPattern },
        },
      },
    },
  });

  // Delete sections
  await prisma.section.deleteMany({
    where: {
      course: {
        slug: { startsWith: slugPattern },
      },
    },
  });

  // Delete related data
  await prisma.review.deleteMany({
    where: {
      course: {
        slug: { startsWith: slugPattern },
      },
    },
  });

  await prisma.enrollment.deleteMany({
    where: {
      course: {
        slug: { startsWith: slugPattern },
      },
    },
  });

  await prisma.purchase.deleteMany({
    where: {
      course: {
        slug: { startsWith: slugPattern },
      },
    },
  });

  await prisma.learningPathCourse.deleteMany({
    where: {
      course: {
        slug: { startsWith: slugPattern },
      },
    },
  });

  await prisma.certificate.deleteMany({
    where: {
      course: {
        slug: { startsWith: slugPattern },
      },
    },
  });

  // Delete courses
  await prisma.course.deleteMany({
    where: {
      slug: { startsWith: slugPattern },
    },
  });
}

/**
 * Clean up test learning paths
 */
export async function cleanupTestLearningPaths(titlePattern: string = "Test") {
  await prisma.learningPathCourse.deleteMany({
    where: {
      learningPath: {
        title: { startsWith: titlePattern },
      },
    },
  });

  await prisma.certificate.deleteMany({
    where: {
      path: {
        title: { startsWith: titlePattern },
      },
    },
  });

  await prisma.learningPath.deleteMany({
    where: {
      title: { startsWith: titlePattern },
    },
  });
}

/**
 * Full cleanup of all test data
 */
export async function cleanupAllTestData() {
  await cleanupTestLearningPaths();
  await cleanupTestUsers();
  await cleanupTestCourses();
}
