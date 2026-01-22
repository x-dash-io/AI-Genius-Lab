import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getAuthorizedLessonContent } from "@/lib/lessons";

/**
 * Proxy endpoint for content delivery with per-request validation
 * This ensures that even if a signed URL is shared, access is validated on each request
 * 
 * Security features:
 * 1. Per-request authentication check
 * 2. User must have purchased the course
 * 3. Signed URLs expire in 10 minutes
 * 4. URLs are generated fresh on each request (user-specific)
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ lessonId: string }> }
) {
  try {
    const { lessonId } = await params;

    // Validate session
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Validate access and get lesson content (this checks purchase status)
    const { lesson, signedUrl } = await getAuthorizedLessonContent(lessonId);

    if (!signedUrl) {
      return NextResponse.json(
        { error: "Content not available" },
        { status: 404 }
      );
    }

    // For link type, redirect directly (no proxy needed)
    if (lesson.contentType === "link") {
      return NextResponse.redirect(signedUrl);
    }

    // For Cloudinary content, redirect to the signed URL
    // The signed URL is already user-specific and expires in 10 minutes
    // Each request generates a fresh URL, so sharing won't work
    return NextResponse.redirect(signedUrl, {
      headers: {
        "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
        "Pragma": "no-cache",
        "Expires": "0",
      },
    });
  } catch (error) {
    console.error("Content proxy error:", error);

    if (error instanceof Error) {
      if (error.message === "UNAUTHORIZED" || error.message === "FORBIDDEN") {
        return NextResponse.json(
          { error: "Access denied" },
          { status: 403 }
        );
      }
      if (error.message === "NOT_FOUND") {
        return NextResponse.json(
          { error: "Content not found" },
          { status: 404 }
        );
      }
    }

    return NextResponse.json(
      { error: "Failed to retrieve content" },
      { status: 500 }
    );
  }
}
