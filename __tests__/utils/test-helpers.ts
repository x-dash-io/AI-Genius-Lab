/**
 * Test utilities and helpers for integration testing
 */

import { prisma } from "../../lib/prisma";
import { hashPassword } from "../../lib/password";

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
export async function createTestUser(overrides: Partial<typeof TEST_USER> = {}, skipCleanup: boolean = false) {
  const userData = { ...TEST_USER, ...overrides };
  const passwordHash = await hashPassword(userData.password);

  // Clean up existing test user if exists (unless skipCleanup is true)
  if (!skipCleanup) {
    await prisma.user.deleteMany({
      where: { email: userData.email.toLowerCase() },
    });
  }

  return prisma.user.create({
    data: {
      email: userData.email.toLowerCase(),
      passwordHash,
      name: userData.name,
      role: "customer",
      emailVerified: new Date(),
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
  const courseId = `course_test_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  const now = new Date();

  return prisma.course.create({
    data: {
      id: courseId,
      slug: courseData.slug,
      title: courseData.title,
      description: courseData.description,
      priceCents: courseData.priceCents,
      isPublished: courseData.isPublished,
      updatedAt: now,
    },
  });
}

/**
 * Create a test section for a course
 */
export async function createTestSection(courseId: string, title: string = "Test Section") {
  const sectionId = `section_test_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  const now = new Date();
  
  return prisma.section.create({
    data: {
      id: sectionId,
      courseId,
      title,
      sortOrder: 0,
      updatedAt: now,
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
  const lesson = await prisma.lesson.create({
    data: {
      id: `lesson_test_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      sectionId,
      title,
      sortOrder: 0,
      isLocked: true,
      durationSeconds: 300,
      allowDownload: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  });

  // Create lesson content
  await prisma.lessonContent.create({
    data: {
      id: `content_test_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      lessonId: lesson.id,
      contentType,
      contentUrl: "test-content-url",
      title: "Test Content",
      sortOrder: 1,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  });

  return lesson;
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
      id: `purchase_test_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
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
      id: `enrollment_test_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      userId,
      courseId,
      purchaseId,
      accessType: "purchased",
      grantedAt: new Date(),
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
      id: `path_test_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      slug: `test-path-${Date.now()}`,
      title,
      description: "A test learning path",
      updatedAt: new Date(),
    },
  });

  // Add courses to the path
  for (let i = 0; i < courseIds.length; i++) {
    await prisma.learningPathCourse.create({
      data: {
        id: `lpc_test_${Date.now()}_${i}_${Math.random().toString(36).substr(2, 9)}`,
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
      User: {
        email: { contains: emailPattern },
      },
    },
  });

  await prisma.progress.deleteMany({
    where: {
      User: {
        email: { contains: emailPattern },
      },
    },
  });

  await prisma.certificate.deleteMany({
    where: {
      User: {
        email: { contains: emailPattern },
      },
    },
  });

  await prisma.review.deleteMany({
    where: {
      User: {
        email: { contains: emailPattern },
      },
    },
  });

  await prisma.payment.deleteMany({
    where: {
      User: {
        email: { contains: emailPattern },
      },
    },
  });

  await prisma.enrollment.deleteMany({
    where: {
      User: {
        email: { contains: emailPattern },
      },
    },
  });

  await prisma.purchase.deleteMany({
    where: {
      User: {
        email: { contains: emailPattern },
      },
    },
  });

  await prisma.session.deleteMany({
    where: {
      User: {
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
      Section: {
        Course: {
          slug: { startsWith: slugPattern },
        },
      },
    },
  });

  // Delete sections
  await prisma.section.deleteMany({
    where: {
      Course: {
        slug: { startsWith: slugPattern },
      },
    },
  });

  // Delete related data
  await prisma.review.deleteMany({
    where: {
      Course: {
        slug: { startsWith: slugPattern },
      },
    },
  });

  await prisma.enrollment.deleteMany({
    where: {
      Course: {
        slug: { startsWith: slugPattern },
      },
    },
  });

  await prisma.purchase.deleteMany({
    where: {
      Course: {
        slug: { startsWith: slugPattern },
      },
    },
  });

  await prisma.learningPathCourse.deleteMany({
    where: {
      Course: {
        slug: { startsWith: slugPattern },
      },
    },
  });

  await prisma.certificate.deleteMany({
    where: {
      Course: {
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
      LearningPath: {
        title: { startsWith: titlePattern },
      },
    },
  });

  await prisma.certificate.deleteMany({
    where: {
      LearningPath: {
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
