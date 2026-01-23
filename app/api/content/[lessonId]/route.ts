import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getAuthorizedLessonContent } from "@/lib/lessons";
import { checkCloudinaryResourceExists } from "@/lib/cloudinary";

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
        {
          error: "Content not available",
          message: "This lesson content has not been uploaded yet. Please contact support if this issue persists."
        },
        { status: 404 }
      );
    }

    // For link type, redirect directly (no proxy needed)
    if (lesson.contentType === "link") {
      return NextResponse.redirect(signedUrl);
    }

    // For Cloudinary content, check if the resource exists before redirecting
    try {
      // Extract public ID from signed URL to check existence
      const url = new URL(signedUrl);
      const pathParts = url.pathname.split('/').filter(p => p && p !== 'v1');
      const publicId = pathParts.join('/');

      // Determine resource type from content type
      const resourceType = lesson.contentType === 'video' || lesson.contentType === 'audio' ? 'video' : 'raw';

      const exists = await checkCloudinaryResourceExists(publicId, resourceType);

      if (!exists) {
        // Content doesn't exist in Cloudinary - return specific error for admin handling
        return NextResponse.json(
          {
            error: "Content not found in storage",
            message: "This lesson content exists in our database but the file is missing from storage. An administrator needs to re-upload this content.",
            code: "CONTENT_MISSING_FROM_STORAGE",
            adminActionRequired: true
          },
          { status: 404 }
        );
      }
    } catch (checkError) {
      console.error('Error checking content existence:', checkError);
      // If we can't check existence, proceed with redirect but log the error
    }

    // Content exists, redirect to the signed URL
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
