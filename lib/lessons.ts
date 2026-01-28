"use server";

import { prisma, withRetry } from "@/lib/prisma";
import { hasCourseAccess, requireUser } from "@/lib/access";
import { getSignedCloudinaryUrl } from "@/lib/cloudinary";

function resolveResourceType(contentType: string) {
  if (contentType === "video" || contentType === "audio") {
    return "video";
  }

  if (contentType === "pdf" || contentType === "file") {
    return "raw";
  }

  return "image";
}

function buildLessonUrl(lesson: {
  contentType: string;
  contentUrl: string | null;
  allowDownload: boolean;
}, userId?: string) {
  if (!lesson.contentUrl) {
    return null;
  }

  if (lesson.contentType === "link") {
    return lesson.contentUrl;
  }

  const resourceType = resolveResourceType(lesson.contentType);
  return getSignedCloudinaryUrl(lesson.contentUrl, resourceType, {
    download: lesson.allowDownload,
    userId, // Add user ID for enhanced security
  });
}

export async function requireLessonAccess(lessonId: string) {
  const user = await requireUser();

  const lesson = await withRetry(async () => {
    return prisma.lesson.findUnique({
      where: { id: lessonId },
      select: {
        id: true,
        Section: {
          select: {
            courseId: true,
            Course: { select: { slug: true } },
          },
        },
      },
    });
  });

  if (!lesson) {
    throw new Error("NOT_FOUND");
  }

  const hasAccess = await hasCourseAccess(
    user.id,
    user.role,
    lesson.Section.courseId
  );

  if (!hasAccess) {
    throw new Error("FORBIDDEN");
  }

  return {
    lessonId: lesson.id,
    courseSlug: lesson.Section.Course.slug,
    userId: user.id,
  };
}

export async function getAuthorizedLessonContent(lessonId: string) {
  const user = await requireUser();

  const lesson = await withRetry(async () => {
    return prisma.lesson.findUnique({
      where: { id: lessonId },
      include: {
        Section: {
          include: {
            Course: true,
          },
        },
        LessonContent: {
          orderBy: { sortOrder: "asc" },
          take: 1,
        },
      },
    });
  });

  if (!lesson) {
    throw new Error("NOT_FOUND");
  }

  const hasAccess = await hasCourseAccess(
    user.id,
    user.role,
    lesson.Section.courseId
  );

  if (!hasAccess) {
    throw new Error("FORBIDDEN");
  }

  // Get content type from the first content item, or default to 'video'
  const firstContent = lesson.LessonContent[0];

  // Check if there's old contentUrl in the lesson table (migration issue)
  const lessonAny = lesson as unknown as { contentUrl?: string; contentType?: string };
  const oldContentUrl = lessonAny.contentUrl;
  const oldContentType = lessonAny.contentType;

  const contentType = firstContent?.contentType || oldContentType || 'video';
  let contentUrl = firstContent?.contentUrl || oldContentUrl || null;

  console.log('[Lesson Content] Lesson:', lesson.id, lesson.title);
  console.log('[Lesson Content] First content record:', firstContent ? 'EXISTS' : 'NONE');
  console.log('[Lesson Content] Content type:', contentType);
  console.log('[Lesson Content] Content URL:', contentUrl);

  // If no content URL is found, return null to show "content not available" message
  if (!contentUrl) {
    console.log('[Lesson Content] No content URL found - returning null');
    return {
      lesson: {
        id: lesson.id,
        title: lesson.title,
        contentType,
        durationSeconds: lesson.durationSeconds,
        allowDownload: lesson.allowDownload,
      },
      courseSlug: lesson.Section.Course.slug,
      publicId: null,
      signedUrl: null,
      contentMetadata: null,
    };
  }

  // Clean up contentUrl if it's a full Cloudinary URL - extract just the public ID
  if (contentUrl && contentUrl.includes('cloudinary.com')) {
    try {
      const url = new URL(contentUrl);
      const pathParts = url.pathname.split('/').filter(p => p && p !== 'v1' && p !== 'upload');
      // Remove the resource type prefix if present
      const resourceTypeIndex = pathParts.findIndex(p => ['image', 'video', 'raw'].includes(p));
      if (resourceTypeIndex >= 0) {
        pathParts.splice(resourceTypeIndex, 1);
      }
      contentUrl = pathParts.join('/');
    } catch (error) {
      console.error('Error parsing Cloudinary URL:', contentUrl, error);
      // If parsing fails, try to extract public ID manually
      const match = contentUrl.match(/\/(?:image|video|raw)\/upload\/.*?\/(.+)$/);
      if (match) {
        contentUrl = match[1].split('?')[0]; // Remove query params
      }
    }
  }

  return {
    lesson: {
      id: lesson.id,
      title: lesson.title,
      contentType,
      durationSeconds: lesson.durationSeconds,
      allowDownload: lesson.allowDownload,
    },
    courseSlug: lesson.Section.Course.slug,
    publicId: contentUrl, // Return the original public ID for existence checking
    signedUrl: buildLessonUrl({
      contentType,
      contentUrl,
      allowDownload: lesson.allowDownload,
    }, user.id),
    contentMetadata: firstContent ? {
      title: firstContent.title,
      description: firstContent.description,
    } : null,
  };
}
