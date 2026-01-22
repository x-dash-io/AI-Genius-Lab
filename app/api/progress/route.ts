import { NextRequest, NextResponse } from "next/server";
import { updateLessonProgress, getLessonProgress } from "@/lib/progress";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { lessonId, lastPosition, completionPercent, completed } = body;

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

    // Track lesson completion analytics
    if (completed) {
      try {
        const lesson = await import("@/lib/courses").then((m) =>
          m.getLessonById(lessonId)
        );
        if (lesson) {
          trackLessonComplete(lessonId, lesson.section.courseId, user.id);
        }
      } catch (error) {
        console.error("Failed to track lesson completion:", error);
      }
    }

    return NextResponse.json({ progress });
  } catch (error) {
    console.error("Error updating progress:", error);

    if (error instanceof Error) {
      if (error.message === "UNAUTHORIZED" || error.message === "FORBIDDEN") {
        return NextResponse.json(
          { error: "Access denied" },
          { status: 403 }
        );
      }
      if (error.message === "NOT_FOUND") {
        return NextResponse.json(
          { error: "Lesson not found" },
          { status: 404 }
        );
      }
    }

    return NextResponse.json(
      { error: "Failed to update progress" },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const lessonId = searchParams.get("lessonId");

    if (!lessonId) {
      return NextResponse.json(
        { error: "lessonId is required" },
        { status: 400 }
      );
    }

    const progress = await getLessonProgress(lessonId);
    return NextResponse.json({ progress });
  } catch (error) {
    console.error("Error fetching progress:", error);

    if (error instanceof Error) {
      if (error.message === "UNAUTHORIZED") {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
    }

    return NextResponse.json(
      { error: "Failed to fetch progress" },
      { status: 500 }
    );
  }
}
