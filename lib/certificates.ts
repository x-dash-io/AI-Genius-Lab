"use server";

import { prisma } from "@/lib/prisma";
import { requireCustomer, hasCourseAccess, hasPurchasedCourse } from "@/lib/access";
import { hasEnrolledInLearningPath } from "./learning-paths";
import { getUserSubscription } from "@/lib/subscriptions";
import { generateCertificatePDF } from "./certificate-pdf";
import { sendCertificateEmail } from "./email";

/**
 * Generate a unique certificate ID
 */
function generateCertificateId(): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 10);
  return `CERT-${timestamp}-${random}`.toUpperCase();
}

/**
 * Check if user has completed a course (all lessons completed)
 */
export async function hasCompletedCourse(userId: string, courseId: string): Promise<boolean> {
  // Get all lessons in the course
  const course = await prisma.course.findUnique({
    where: { id: courseId },
    include: {
      Section: {
        include: {
          Lesson: {
            select: { id: true },
          },
        },
      },
    },
  });

  if (!course) return false;

  const lessonIds = course.Section.flatMap((s) => s.Lesson.map((l) => l.id));
  if (lessonIds.length === 0) return false;

  // Get progress for all lessons
  const progressRecords = await prisma.progress.findMany({
    where: {
      userId,
      lessonId: { in: lessonIds },
    },
  });

  // Check if all lessons are completed
  const completedLessons = progressRecords.filter((p) => p.completedAt != null).length;
  return completedLessons === lessonIds.length;
}

/**
 * Check if user has completed a learning path (all courses completed)
 */
export async function hasCompletedLearningPath(userId: string, pathId: string): Promise<boolean> {
  const path = await prisma.learningPath.findUnique({
    where: { id: pathId },
    include: {
      LearningPathCourse: {
        include: {
          Course: {
            select: { id: true },
          },
        },
      },
    },
  });

  if (!path || path.LearningPathCourse.length === 0) {
    return false;
  }

  // Check if all courses are completed
  for (const pathCourse of path.LearningPathCourse) {
    const completed = await hasCompletedCourse(userId, pathCourse.courseId);
    if (!completed) {
      return false;
    }
  }

  return true;
}

/**
 * Generate certificate for course completion
 * Uses transaction to prevent race conditions
 */
export async function generateCourseCertificate(courseId: string) {
  const user = await requireCustomer();

  // Verify access (either purchase OR subscription)
  const hasAccess = await hasCourseAccess(user.id, user.role, courseId);
  if (!hasAccess) {
    throw new Error("Course access required");
  }

  // Verify certificate inclusion
  const purchased = await hasPurchasedCourse(user.id, courseId);
  if (!purchased) {
    const subscription = await getUserSubscription(user.id);
    if (!subscription || subscription.plan.tier === "starter") {
      throw new Error(
        "Your current subscription does not include certificates. Upgrade to Pro to earn certificates."
      );
    }
  }

  // Verify course completion
  const completed = await hasCompletedCourse(user.id, courseId);
  if (!completed) {
    throw new Error("Course not completed");
  }

  // Use transaction to prevent race condition (check-then-create)
  const certificate = await prisma.$transaction(async (tx) => {
    // Check if certificate already exists within transaction
    const existing = await tx.certificate.findFirst({
      where: {
        userId: user.id,
        courseId,
        type: "course",
      },
      include: {
        Course: {
          select: {
            title: true,
            description: true,
          },
        },
        User: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    });

    if (existing) {
      return existing;
    }

    // Generate certificate within same transaction
    const certificateId = generateCertificateId();
    const newCert = await tx.certificate.create({
      data: {
        id: `cert_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
        userId: user.id,
        courseId,
        type: "course",
        certificateId,
      },
      include: {
        Course: {
          select: {
            title: true,
            description: true,
          },
        },
        User: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    });

    // Log certificate issuance within transaction
    await tx.activityLog.create({
      data: {
        id: `activity_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
        userId: user.id,
        type: "certificate_earned",
        metadata: {
          certificateId: newCert.certificateId,
          type: "course",
          courseId,
          courseTitle: newCert.Course?.title,
        },
      },
    });

    return newCert;
  });

  // Generate PDF and upload to Cloudinary
  try {
    const pdfUrl = await generateCertificatePDF({
      certificateId: certificate.certificateId,
      recipientName: certificate.User.name || "Student",
      courseName: certificate.Course?.title,
      issuedAt: certificate.issuedAt,
      type: "course",
    });

    // Update certificate with PDF URL
    await prisma.certificate.update({
      where: { id: certificate.id },
      data: { pdfUrl },
    });

    // Send certificate email
    if (certificate.User.email) {
      await sendCertificateEmail(
        certificate.User.email,
        certificate.User.name || "Student",
        certificate.Course?.title || "Course",
        certificate.certificateId,
        pdfUrl
      );
    }
  } catch (error) {
    console.error("Failed to generate certificate PDF or send email:", error);
    // Don't fail the certificate generation if PDF/email fails
  }

  return certificate;
}

/**
 * Generate certificate for learning path completion
 * Uses transaction to prevent race conditions
 */
export async function generatePathCertificate(pathId: string) {
  const user = await requireCustomer();

  // Verify user has enrolled in the path (all courses purchased or Elite sub)
  const enrolled = await hasEnrolledInLearningPath(user.id, pathId);
  if (!enrolled) {
    throw new Error("Learning path access required");
  }

  // Verify certificate inclusion
  // For Learning Paths, only Elite subscribers or full-path buyers get certificates
  const pathCourses = await prisma.learningPathCourse.findMany({
    where: { learningPathId: pathId },
    select: { courseId: true }
  });
  const purchases = await prisma.purchase.count({
    where: {
      userId: user.id,
      status: "paid",
      courseId: { in: pathCourses.map(pc => pc.courseId) }
    }
  });

  const isFullPurchase = purchases === pathCourses.length;

  if (!isFullPurchase) {
    const subscription = await getUserSubscription(user.id);
    if (!subscription || subscription.plan.tier !== "elite") {
      throw new Error(
        "Your current subscription does not include Learning Path certificates. Upgrade to Elite to earn them."
      );
    }
  }

  // Verify path completion
  const completed = await hasCompletedLearningPath(user.id, pathId);
  if (!completed) {
    throw new Error("Learning path not completed");
  }

  // Use transaction to prevent race condition (check-then-create)
  const certificate = await prisma.$transaction(async (tx) => {
    // Check if certificate already exists within transaction
    const existing = await tx.certificate.findFirst({
      where: {
        userId: user.id,
        pathId,
        type: "learning_path",
      },
      include: {
        LearningPath: {
          select: {
            title: true,
            description: true,
          },
        },
        User: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    });

    if (existing) {
      return existing;
    }

    // Get path details for metadata
    const path = await tx.learningPath.findUnique({
      where: { id: pathId },
      include: {
        LearningPathCourse: {
          include: {
            Course: {
              select: {
                id: true,
                title: true,
              },
            },
          },
          orderBy: { sortOrder: "asc" },
        },
      },
    });

    // Generate certificate within same transaction
    const certificateId = generateCertificateId();
    const newCert = await tx.certificate.create({
      data: {
        id: `cert_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
        userId: user.id,
        pathId,
        type: "learning_path",
        certificateId,
        metadata: path ? {
          courseCount: path.LearningPathCourse.length,
          courses: path.LearningPathCourse.map((pc) => ({
            courseId: pc.Course.id,
            title: pc.Course.title,
          })),
        } : undefined,
      },
      include: {
        LearningPath: {
          select: {
            title: true,
            description: true,
          },
        },
        User: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    });

    // Log certificate issuance within transaction
    await tx.activityLog.create({
      data: {
        id: `activity_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
        userId: user.id,
        type: "certificate_earned",
        metadata: {
          certificateId: newCert.certificateId,
          type: "learning_path",
          pathId,
          pathTitle: newCert.LearningPath?.title,
        },
      },
    });

    return newCert;
  });

  // Generate PDF and upload to Cloudinary
  try {
    const pdfUrl = await generateCertificatePDF({
      certificateId: certificate.certificateId,
      recipientName: certificate.User.name || "Student",
      pathName: certificate.LearningPath?.title,
      issuedAt: certificate.issuedAt,
      type: "learning_path",
    });

    // Update certificate with PDF URL
    await prisma.certificate.update({
      where: { id: certificate.id },
      data: { pdfUrl },
    });

    // Send certificate email
    if (certificate.User.email) {
      await sendCertificateEmail(
        certificate.User.email,
        certificate.User.name || "Student",
        certificate.LearningPath?.title || "Learning Path",
        certificate.certificateId,
        pdfUrl
      );
    }
  } catch (error) {
    console.error("Failed to generate certificate PDF or send email:", error);
    // Don't fail the certificate generation if PDF/email fails
  }

  return certificate;
}

/**
 * Get user's certificates
 */
export async function getUserCertificates(userId: string) {
  const user = await requireCustomer();
  
  if (user.id !== userId) {
    throw new Error("FORBIDDEN: You can only view your own certificates");
  }

  return prisma.certificate.findMany({
    where: { userId },
    include: {
      Course: {
        select: {
          id: true,
          title: true,
          slug: true,
        },
      },
      LearningPath: {
        select: {
          id: true,
          title: true,
        },
      },
    },
    orderBy: { issuedAt: "desc" },
  });
}

/**
 * Verify a certificate (public endpoint)
 */
export async function verifyCertificate(certificateId: string) {
  const certificate = await prisma.certificate.findUnique({
    where: { certificateId },
    include: {
      User: {
        select: {
          name: true,
          email: true,
        },
      },
      Course: {
        select: {
          title: true,
          description: true,
        },
      },
      LearningPath: {
        select: {
          title: true,
          description: true,
        },
      },
    },
  });

  if (!certificate) {
    return {
      valid: false,
      error: "Certificate not found",
    };
  }

  if (certificate.expiresAt && certificate.expiresAt < new Date()) {
    return {
      valid: false,
      error: "Certificate has expired",
    };
  }

  return {
    valid: true,
    certificate: {
      type: certificate.type,
      studentName: certificate.User.name,
      courseName: certificate.Course?.title,
      pathName: certificate.LearningPath?.title,
      issuedAt: certificate.issuedAt,
      expiresAt: certificate.expiresAt,
      certificateId: certificate.certificateId,
    },
  };
}
