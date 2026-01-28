import { NextRequest, NextResponse } from "next/server";
import { requireUser } from "@/lib/access";
import { updateLessonProgress, getLessonProgress } from "@/lib/progress";
import { trackLessonComplete } from "@/lib/analytics";
import { checkRateLimit, createStandardErrorResponse } from "@/lib/api-helpers";
import { z } from "zod";

const progressUpdateSchema = z.object({
  lessonId: z.string().min(1, "lessonId is required"),
  lastPosition: z.number().int().min(0).optional(),
  completionPercent: z.number().int().min(0).max(100).optional(),
  completed: z.boolean().optional(),
});

export async function POST(request: NextRequest) {
  // Rate limiting
  const rateLimitResponse = await checkRateLimit(request, "api");
  if (rateLimitResponse) {
    return rateLimitResponse;
  }

  try {
    const body = await request.json();
    const validationResult = progressUpdateSchema.safeParse(body);
    
    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: {
            message: "Invalid request data",
            code: "VALIDATION_ERROR",
            details: validationResult.error.issues,
          },
        },
        { status: 400 }
      );
    }

    const { lessonId, lastPosition, completionPercent, completed } = validationResult.data;

    if (!lessonId) {
      return NextResponse.json(
        { error: "lessonId is required" },
        { status: 400 }
      );
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
            
            if (courseCompleted) {
              // Generate certificate asynchronously with userId (don't block the response)
              generateCourseCertificate(user.id, lesson.Section.courseId).catch((error) => {
                console.error("Failed to generate certificate:", error);
                // Log to error tracking service if available
                if (typeof window !== "undefined" && "Sentry" in window) {
                  const Sentry = (window as { Sentry?: { captureException: (error: any) => void } }).Sentry;
                  Sentry?.captureException(error);
                }
                // Don't fail the progress update if certificate generation fails
              });
            }
          } catch (error) {
            console.error("Failed to check course completion:", error);
            // Log to error tracking service if available
            if (typeof window !== "undefined" && "Sentry" in window) {
              const Sentry = (window as { Sentry?: { captureException: (error: any) => void } }).Sentry;
              Sentry?.captureException(error);
            }
            // Don't fail the progress update if certificate check fails
          }
        }
      } catch (error) {
        console.error("Failed to track lesson completion:", error);
      }
    }

    return NextResponse.json({ progress });
  } catch (error) {
    return createStandardErrorResponse(error, "Failed to update progress");
  }
}

const progressGetSchema = z.object({
  lessonId: z.string().min(1, "lessonId is required"),
});

export async function GET(request: NextRequest) {
  // Rate limiting
  const rateLimitResponse = await checkRateLimit(request, "api");
  if (rateLimitResponse) {
    return rateLimitResponse;
  }

  try {
    const { searchParams } = new URL(request.url);
    const lessonId = searchParams.get("lessonId");

    const validationResult = progressGetSchema.safeParse({ lessonId });
    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: {
            message: "lessonId is required",
            code: "VALIDATION_ERROR",
            details: validationResult.error.issues,
          },
        },
        { status: 400 }
      );
    }

    const progress = await getLessonProgress(lessonId!);
    return NextResponse.json({ progress });
  } catch (error) {
    return createStandardErrorResponse(error, "Failed to fetch progress");
  }
}
