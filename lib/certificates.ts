"use server";

import { prisma } from "@/lib/prisma";
import { requireCustomer } from "@/lib/access";
import { hasEnrolledInLearningPath } from "./learning-paths";
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
 * @param userId - User ID (required, no longer uses requireCustomer internally)
 * @param courseId - Course ID
 */
export async function generateCourseCertificate(userId: string, courseId: string) {
  // Validate inputs
  if (!userId || !courseId) {
    throw new Error("userId and courseId are required");
  }

  // Validate format (basic validation)
  if (typeof userId !== "string" || userId.length < 1) {
    throw new Error("Invalid userId format");
  }
  if (typeof courseId !== "string" || courseId.length < 1) {
    throw new Error("Invalid courseId format");
  }

  // Verify user exists
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, email: true },
  });
  if (!user) {
    throw new Error("User not found");
  }

  // Verify course exists
  const course = await prisma.course.findUnique({
    where: { id: courseId },
    select: { id: true, title: true, isPublished: true },
  });
  if (!course) {
    throw new Error("Course not found");
  }
  if (!course.isPublished) {
    throw new Error("Cannot generate certificate for unpublished course");
  }

  // Verify user has purchased the course
  const purchase = await prisma.purchase.findFirst({
    where: {
      userId,
      courseId,
      status: "paid",
    },
  });

  if (!purchase) {
    throw new Error("Course not purchased");
  }

  // Verify course completion
  const completed = await hasCompletedCourse(userId, courseId);
  if (!completed) {
    throw new Error("Course not completed");
  }

  // Use transaction to prevent race condition (check-then-create)
  const certificate = await prisma.$transaction(async (tx) => {
    // Check if certificate already exists within transaction
    const existing = await tx.certificate.findFirst({
      where: {
        userId,
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
        userId,
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
        userId,
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
export async function generatePathCertificate(userId: string, pathId: string) {
  // Validate inputs
  if (!userId || !pathId) {
    throw new Error("userId and pathId are required");
  }

  // Validate format (basic validation)
  if (typeof userId !== "string" || userId.length < 1) {
    throw new Error("Invalid userId format");
  }
  if (typeof pathId !== "string" || pathId.length < 1) {
    throw new Error("Invalid pathId format");
  }

  // Verify user exists
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, email: true },
  });
  if (!user) {
    throw new Error("User not found");
  }

  // Verify learning path exists
  const path = await prisma.learningPath.findUnique({
    where: { id: pathId },
    select: { id: true, title: true },
  });
  if (!path) {
    throw new Error("Learning path not found");
  }

  // Verify user has enrolled in the path (all courses purchased)
  const enrolled = await hasEnrolledInLearningPath(userId, pathId);
  if (!enrolled) {
    throw new Error("Learning path not enrolled");
  }

  // Verify path completion
  const completed = await hasCompletedLearningPath(userId, pathId);
  if (!completed) {
    throw new Error("Learning path not completed");
  }

  // Use transaction to prevent race condition (check-then-create)
  const certificate = await prisma.$transaction(async (tx) => {
    // Check if certificate already exists within transaction
    const existing = await tx.certificate.findFirst({
      where: {
        userId,
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
        userId,
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
        userId,
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
 * @param userId - User ID to get certificates for
 * @param requireAuth - If true, verify the requesting user matches userId (default: false)
 */
export async function getUserCertificates(userId: string, requireAuth: boolean = false) {
  if (requireAuth) {
    const user = await requireCustomer();
    if (user.id !== userId) {
      throw new Error("FORBIDDEN: You can only view your own certificates");
    }
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
