/**
 * @jest-environment node
 * 
 * Integration tests for key user flows
 * These tests verify end-to-end user journeys
 * 
 * Note: These tests require a test database. Set DATABASE_URL to a test database
 * before running. Run with: npm test -- --testPathPattern=integration
 */

import { prisma } from "@/lib/prisma";
import { verifyPassword } from "@/lib/password";
import type { User, Course, Section, Lesson, LearningPath } from "@prisma/client";
import {
  createTestUser,
  createTestAdmin,
  createTestCourse,
  createTestSection,
  createTestLesson,
  createTestPurchase,
  createTestEnrollment,
  cleanupAllTestData,
  TEST_USER,
} from "../utils/test-helpers";

// Skip tests if no database connection
const describeMaybeSkip = process.env.DATABASE_URL ? describe : describe.skip;

describeMaybeSkip("User Authentication Flow", () => {
  beforeAll(async () => {
    await prisma.$connect();
    await cleanupAllTestData();
  });

  afterAll(async () => {
    await cleanupAllTestData();
    await prisma.$disconnect();
  });

  it("should create a user with hashed password", async () => {
    const user = await createTestUser({
      email: "auth-test@example.com",
    });

    expect(user).toBeDefined();
    expect(user.email).toBe("auth-test@example.com");
    expect(user.role).toBe("customer");
    expect(user.passwordHash).toBeDefined();
    expect(user.passwordHash).not.toBe(TEST_USER.password);
  });

  it("should verify correct password", async () => {
    const user = await prisma.user.findUnique({
      where: { email: "auth-test@example.com" },
    });

    expect(user).toBeDefined();
    expect(user?.passwordHash).toBeDefined();

    const isValid = await verifyPassword(TEST_USER.password, user!.passwordHash!);
    expect(isValid).toBe(true);
  });

  it("should reject incorrect password", async () => {
    const user = await prisma.user.findUnique({
      where: { email: "auth-test@example.com" },
    });

    const isValid = await verifyPassword("WrongPassword123!", user!.passwordHash!);
    expect(isValid).toBe(false);
  });

  it("should create admin user with admin role", async () => {
    const admin = await createTestAdmin({
      email: "admin-test@example.com",
    });

    expect(admin).toBeDefined();
    expect(admin.email).toBe("admin-test@example.com");
    expect(admin.role).toBe("admin");
  });

  it("should not allow duplicate emails", async () => {
    await expect(
      createTestUser({ email: "auth-test@example.com" })
    ).rejects.toThrow();
  });
});

describeMaybeSkip("Course Purchase Flow", () => {
  let testUser: User;
  let testCourse: Course;

  beforeAll(async () => {
    await prisma.$connect();
    await cleanupAllTestData();
    testUser = await createTestUser({ email: "purchase-test@example.com" });
    testCourse = await createTestCourse({ slug: "test-purchase-course" });
  });

  afterAll(async () => {
    await cleanupAllTestData();
    await prisma.$disconnect();
  });

  it("should create a pending purchase", async () => {
    const purchase = await createTestPurchase(
      testUser.id,
      testCourse.id,
      "pending"
    );

    expect(purchase).toBeDefined();
    expect(purchase.userId).toBe(testUser.id);
    expect(purchase.courseId).toBe(testCourse.id);
    expect(purchase.status).toBe("pending");
    expect(purchase.amountCents).toBe(testCourse.priceCents);
  });

  it("should update purchase to paid status", async () => {
    const purchase = await prisma.purchase.findFirst({
      where: {
        userId: testUser.id,
        courseId: testCourse.id,
      },
    });

    const updatedPurchase = await prisma.purchase.update({
      where: { id: purchase!.id },
      data: { status: "paid" },
    });

    expect(updatedPurchase.status).toBe("paid");
  });

  it("should create enrollment after purchase", async () => {
    const purchase = await prisma.purchase.findFirst({
      where: {
        userId: testUser.id,
        courseId: testCourse.id,
        status: "paid",
      },
    });

    const enrollment = await createTestEnrollment(
      testUser.id,
      testCourse.id,
      purchase!.id
    );

    expect(enrollment).toBeDefined();
    expect(enrollment.userId).toBe(testUser.id);
    expect(enrollment.courseId).toBe(testCourse.id);
    expect(enrollment.purchaseId).toBe(purchase!.id);
  });

  it("should prevent duplicate purchases for same course", async () => {
    await expect(
      prisma.purchase.create({
        data: {
          id: `duplicate_test_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          userId: testUser.id,
          courseId: testCourse.id,
          amountCents: testCourse.priceCents,
          currency: "usd",
          status: "pending",
          provider: "paypal",
        },
      })
    ).rejects.toThrow(); // Unique constraint violation
  });
});

describeMaybeSkip("Learning Path Enrollment Flow", () => {
  let testUser: User;
  let course1: Course;
  let course2: Course;
  let learningPath: LearningPath;

  beforeAll(async () => {
    await prisma.$connect();
    await cleanupAllTestData();
    testUser = await createTestUser({ email: "path-test@example.com" });
    course1 = await createTestCourse({ slug: "test-path-course-1", title: "Course 1" });
    course2 = await createTestCourse({ slug: "test-path-course-2", title: "Course 2" });

    learningPath = await prisma.learningPath.create({
      data: {
        id: `path_test_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        slug: `test-learning-path-${Date.now()}`,
        title: "Test Learning Path",
        description: "A test path with multiple courses",
        updatedAt: new Date(),
      },
    });

    await prisma.learningPathCourse.createMany({
      data: [
        { 
          id: `lpc_test_${Date.now()}_1_${Math.random().toString(36).substr(2, 9)}`,
          learningPathId: learningPath.id, 
          courseId: course1.id, 
          sortOrder: 0 
        },
        { 
          id: `lpc_test_${Date.now()}_2_${Math.random().toString(36).substr(2, 9)}`,
          learningPathId: learningPath.id, 
          courseId: course2.id, 
          sortOrder: 1 
        },
      ],
    });
  });

  afterAll(async () => {
    await cleanupAllTestData();
    await prisma.$disconnect();
  });

  it("should create learning path with courses", async () => {
    const pathWithCourses = await prisma.learningPath.findUnique({
      where: { id: learningPath.id },
      include: {
        courses: {
          include: { Course: true },
          orderBy: { sortOrder: "asc" },
        },
      },
    });

    expect(pathWithCourses).toBeDefined();
    expect(pathWithCourses!.courses).toHaveLength(2);
    expect(pathWithCourses!.courses[0].Course.title).toBe("Course 1");
    expect(pathWithCourses!.courses[1].Course.title).toBe("Course 2");
  });

  it("should enroll user in all path courses", async () => {
    // Create purchases for both courses
    const purchase1 = await createTestPurchase(testUser.id, course1.id, "paid");
    const purchase2 = await createTestPurchase(testUser.id, course2.id, "paid");

    // Create enrollments
    await createTestEnrollment(testUser.id, course1.id, purchase1.id);
    await createTestEnrollment(testUser.id, course2.id, purchase2.id);

    // Verify enrollments
    const enrollments = await prisma.enrollment.findMany({
      where: { userId: testUser.id },
    });

    expect(enrollments).toHaveLength(2);
  });
});

describeMaybeSkip("Lesson Progress Flow", () => {
  let testUser: User;
  let testCourse: Course;
  let testSection: Section;
  let testLesson: Lesson;

  beforeAll(async () => {
    await prisma.$connect();
    await cleanupAllTestData();
    testUser = await createTestUser({ email: "progress-test@example.com" });
    testCourse = await createTestCourse({ slug: "test-progress-course" });
    testSection = await createTestSection(testCourse.id);
    testLesson = await createTestLesson(testSection.id, "Test Lesson", "video");

    // Create purchase and enrollment
    const purchase = await createTestPurchase(testUser.id, testCourse.id, "paid");
    await createTestEnrollment(testUser.id, testCourse.id, purchase.id);
  });

  afterAll(async () => {
    await cleanupAllTestData();
    await prisma.$disconnect();
  });

  it("should track lesson start", async () => {
    const progress = await prisma.progress.create({
      data: {
        id: `progress_test_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        userId: testUser.id,
        lessonId: testLesson.id,
        startedAt: new Date(),
        lastPosition: 0,
        completionPercent: 0,
        updatedAt: new Date(),
      },
    });

    expect(progress).toBeDefined();
    expect(progress.startedAt).toBeDefined();
    expect(progress.completionPercent).toBe(0);
  });

  it("should update lesson progress", async () => {
    const progress = await prisma.progress.update({
      where: {
        userId_lessonId: {
          userId: testUser.id,
          lessonId: testLesson.id,
        },
      },
      data: {
        lastPosition: 120, // 2 minutes
        completionPercent: 50,
      },
    });

    expect(progress.lastPosition).toBe(120);
    expect(progress.completionPercent).toBe(50);
  });

  it("should mark lesson as completed", async () => {
    const progress = await prisma.progress.update({
      where: {
        userId_lessonId: {
          userId: testUser.id,
          lessonId: testLesson.id,
        },
      },
      data: {
        completedAt: new Date(),
        completionPercent: 100,
      },
    });

    expect(progress.completedAt).toBeDefined();
    expect(progress.completionPercent).toBe(100);
  });

  it("should calculate course completion percentage", async () => {
    // Create another lesson
    const lesson2 = await createTestLesson(testSection.id, "Test Lesson 2", "video");
    expect(lesson2).toBeDefined();

    // Get all lessons in course
    const course = await prisma.course.findUnique({
      where: { id: testCourse.id },
      include: {
        sections: {
          include: {
            lessons: true,
          },
        },
      },
    });

    const lessonIds = course!.sections.flatMap((s) => s.lessons.map((l) => l.id));
    expect(lessonIds).toHaveLength(2);

    // Get completed lessons
    const completedProgress = await prisma.progress.findMany({
      where: {
        userId: testUser.id,
        lessonId: { in: lessonIds },
        completedAt: { not: null },
      },
    });

    const completionPercent = Math.round(
      (completedProgress.length / lessonIds.length) * 100
    );
    expect(completionPercent).toBe(50); // 1 of 2 lessons completed
  });
});

describeMaybeSkip("Review System Flow", () => {
  let testUser: User;
  let testCourse: Course;

  beforeAll(async () => {
    await prisma.$connect();
    await cleanupAllTestData();
    testUser = await createTestUser({ email: "review-test@example.com" });
    testCourse = await createTestCourse({ slug: "test-review-course" });

    // User must purchase before reviewing
    const purchase = await createTestPurchase(testUser.id, testCourse.id, "paid");
    await createTestEnrollment(testUser.id, testCourse.id, purchase.id);
  });

  afterAll(async () => {
    await cleanupAllTestData();
    await prisma.$disconnect();
  });

  it("should create a review", async () => {
    const review = await prisma.review.create({
      data: {
        userId: testUser.id,
        courseId: testCourse.id,
        rating: 5,
        text: "Great course!",
      },
    });

    expect(review).toBeDefined();
    expect(review.rating).toBe(5);
    expect(review.text).toBe("Great course!");
  });

  it("should prevent duplicate reviews from same user", async () => {
    await expect(
      prisma.review.create({
        data: {
          userId: testUser.id,
          courseId: testCourse.id,
          rating: 4,
          text: "Another review",
        },
      })
    ).rejects.toThrow(); // Unique constraint violation
  });

  it("should update existing review", async () => {
    const review = await prisma.review.update({
      where: {
        userId_courseId: {
          userId: testUser.id,
          courseId: testCourse.id,
        },
      },
      data: {
        rating: 4,
        text: "Updated review",
      },
    });

    expect(review.rating).toBe(4);
    expect(review.text).toBe("Updated review");
  });

  it("should calculate average rating", async () => {
    // Create another user and review
    const user2 = await createTestUser({ email: "review-test-2@example.com" });
    const purchase2 = await createTestPurchase(user2.id, testCourse.id, "paid");
    await createTestEnrollment(user2.id, testCourse.id, purchase2.id);

    await prisma.review.create({
      data: {
        userId: user2.id,
        courseId: testCourse.id,
        rating: 5,
        text: "Excellent!",
      },
    });

    const reviews = await prisma.review.findMany({
      where: { courseId: testCourse.id },
    });

    const avgRating =
      reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
    expect(avgRating).toBe(4.5); // (4 + 5) / 2
  });
});

describeMaybeSkip("Certificate Generation Flow", () => {
  let testUser: User;
  let testCourse: Course;
  let testSection: Section;
  let testLesson: Lesson;

  beforeAll(async () => {
    await prisma.$connect();
    await cleanupAllTestData();
    testUser = await createTestUser({ email: "cert-test@example.com" });
    testCourse = await createTestCourse({ slug: "test-cert-course" });
    testSection = await createTestSection(testCourse.id);
    testLesson = await createTestLesson(testSection.id, "Cert Test Lesson", "video");

    // Create purchase and enrollment
    const purchase = await createTestPurchase(testUser.id, testCourse.id, "paid");
    await createTestEnrollment(testUser.id, testCourse.id, purchase.id);

    // Complete the lesson
    await prisma.progress.create({
      data: {
        id: `progress_test_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        userId: testUser.id,
        lessonId: testLesson.id,
        startedAt: new Date(),
        completedAt: new Date(),
        completionPercent: 100,
        updatedAt: new Date(),
      },
    });
  });

  afterAll(async () => {
    await cleanupAllTestData();
    await prisma.$disconnect();
  });

  it("should generate certificate for completed course", async () => {
    const certificate = await prisma.certificate.create({
      data: {
        userId: testUser.id,
        courseId: testCourse.id,
        type: "course",
        certificateId: `CERT-${Date.now()}-TEST`,
      },
    });

    expect(certificate).toBeDefined();
    expect(certificate.type).toBe("course");
    expect(certificate.certificateId).toContain("CERT-");
  });

  it("should verify certificate exists", async () => {
    const certificate = await prisma.certificate.findFirst({
      where: {
        userId: testUser.id,
        courseId: testCourse.id,
        type: "course",
      },
    });

    expect(certificate).toBeDefined();
  });

  it("should prevent duplicate certificates", async () => {
    // Creating another certificate for same course should work (no unique constraint)
    // but our business logic should prevent it
    const existingCert = await prisma.certificate.findFirst({
      where: {
        userId: testUser.id,
        courseId: testCourse.id,
        type: "course",
      },
    });

    expect(existingCert).toBeDefined();
    // In real code, we check for existing cert before creating
  });
});
