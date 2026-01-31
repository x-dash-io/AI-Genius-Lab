import { NextRequest, NextResponse } from "next/server";
import { requireUser } from "@/lib/access";
import { updateLessonProgress, getLessonProgress } from "@/lib/progress";
import { trackLessonComplete } from "@/lib/analytics";
import { withErrorHandler } from "../error-handler";
import { AppError } from "@/lib/errors";
import { logger } from "@/lib/logger";

export const POST = withErrorHandler(async (request: NextRequest) => {
  const body = await request.json();
  const { lessonId, lastPosition, completionPercent, completed } = body;

  if (!lessonId) {
    throw AppError.badRequest("lessonId is required");
  }

  const user = await requireUser();
  const progress = await updateLessonProgress(lessonId, {
    lastPosition: lastPosition ?? undefined,
    completionPercent: completionPercent ?? undefined,
    completedAt: completed ? new Date() : undefined,
  });

  // Track lesson completion analytics and check for course completion
  if (completed) {
    try {
      const lesson = await import("@/lib/courses").then((m) =>
        m.getLessonById(lessonId)
      );
      if (lesson) {
        trackLessonComplete(lessonId, lesson.Section.courseId, user.id);

        // Check if course is now complete and generate certificate
        try {
          const { hasCompletedCourse, generateCourseCertificate } = await import("@/lib/certificates");
          const courseCompleted = await hasCompletedCourse(user.id, lesson.Section.courseId);
          
          logger.info(`Course completion check: userId=${user.id}, courseId=${lesson.Section.courseId}, completed=${courseCompleted}`);
          
          if (courseCompleted) {
            // Generate certificate asynchronously (don't block the response)
            generateCourseCertificate(lesson.Section.courseId)
              .then((certificate) => {
                logger.info(`Certificate generated successfully: userId=${user.id}, courseId=${lesson.Section.courseId}, certificateId=${certificate.certificateId}`);
              })
              .catch((error) => {
                logger.error("Failed to generate certificate", {
                  error: error instanceof Error ? error.message : 'Unknown error',
                  userId: user.id,
                  courseId: lesson.Section.courseId,
                });
                // Don't fail the progress update if certificate generation fails
              });
          }
        } catch (error) {
          logger.error("Failed to check course completion", {
            error: error instanceof Error ? error.message : 'Unknown error',
            userId: user.id,
            courseId: lesson.Section.courseId,
          });
          // Don't fail the progress update if certificate check fails
        }
      }
    } catch (error) {
      logger.error("Failed to track lesson completion", error);
    }
  }

  return NextResponse.json({ progress });
});

export const GET = withErrorHandler(async (request: NextRequest) => {
  const { searchParams } = new URL(request.url);
  const lessonId = searchParams.get("lessonId");

  if (!lessonId) {
    throw AppError.badRequest("lessonId is required");
  }

  const progress = await getLessonProgress(lessonId);
  return NextResponse.json({ progress });
});
