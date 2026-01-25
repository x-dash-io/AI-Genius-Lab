"use server";

import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/access";
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
 */
export async function generateCourseCertificate(courseId: string) {
  const user = await requireUser();

  // Verify user has purchased the course
  const purchase = await prisma.purchase.findFirst({
    where: {
      userId: user.id,
      courseId,
      status: "paid",
    },
  });

  if (!purchase) {
    throw new Error("Course not purchased");
  }

  // Verify course completion
  const completed = await hasCompletedCourse(user.id, courseId);
  if (!completed) {
    throw new Error("Course not completed");
  }

  // Check if certificate already exists
  const existing = await prisma.certificate.findFirst({
    where: {
      userId: user.id,
      courseId,
      type: "course",
    },
  });

  if (existing) {
    return existing;
  }

  // Generate certificate
  const certificateId = generateCertificateId();
  const certificate = await prisma.certificate.create({
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

  // Log certificate issuance
  await prisma.activityLog.create({
    data: {
      id: `activity_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
      userId: user.id,
      type: "certificate_earned",
      metadata: {
        certificateId: certificate.certificateId,
        type: "course",
        courseId,
        courseTitle: certificate.Course?.title,
      },
    },
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
 */
export async function generatePathCertificate(pathId: string) {
  const user = await requireUser();

  // Verify user has enrolled in the path (all courses purchased)
  const enrolled = await hasEnrolledInLearningPath(user.id, pathId);
  if (!enrolled) {
    throw new Error("Learning path not enrolled");
  }

  // Verify path completion
  const completed = await hasCompletedLearningPath(user.id, pathId);
  if (!completed) {
    throw new Error("Learning path not completed");
  }

  // Check if certificate already exists
  const existing = await prisma.certificate.findFirst({
    where: {
      userId: user.id,
      pathId,
      type: "learning_path",
    },
  });

  if (existing) {
    return existing;
  }

  // Get path details for metadata
  const path = await prisma.learningPath.findUnique({
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

  // Generate certificate
  const certificateId = generateCertificateId();
  const certificate = await prisma.certificate.create({
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

  // Log certificate issuance
  await prisma.activityLog.create({
    data: {
      id: `activity_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
      userId: user.id,
      type: "certificate_earned",
      metadata: {
        certificateId: certificate.certificateId,
        type: "learning_path",
        pathId,
        pathTitle: certificate.LearningPath?.title,
      },
    },
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
  const user = await requireUser();
  
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
