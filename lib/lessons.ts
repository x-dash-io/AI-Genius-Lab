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
        section: {
          select: {
            courseId: true,
            course: { select: { slug: true } },
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
    lesson.section.courseId
  );

  if (!hasAccess) {
    throw new Error("FORBIDDEN");
  }

  return {
    lessonId: lesson.id,
    courseSlug: lesson.section.course.slug,
    userId: user.id,
  };
}

export async function getAuthorizedLessonContent(lessonId: string) {
  const user = await requireUser();

  const lesson = await withRetry(async () => {
    return prisma.lesson.findUnique({
      where: { id: lessonId },
      include: {
        section: {
          include: {
            course: true,
          },
        },
        contents: {
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
    lesson.section.courseId
  );

  if (!hasAccess) {
    throw new Error("FORBIDDEN");
  }

  // Get content type from the first content item, or default to 'video'
  const firstContent = lesson.contents[0];

  // Check if there's old contentUrl in the lesson table (migration issue)
  const oldContentUrl = (lesson as any).contentUrl;
  const oldContentType = (lesson as any).contentType;

  const contentType = firstContent?.contentType || oldContentType || 'video';
  const contentUrl = firstContent?.contentUrl || oldContentUrl || null;

  return {
    lesson: {
      id: lesson.id,
      title: lesson.title,
      contentType,
      durationSeconds: lesson.durationSeconds,
      allowDownload: lesson.allowDownload,
    },
    courseSlug: lesson.section.course.slug,
    signedUrl: buildLessonUrl({
      contentType,
      contentUrl,
      allowDownload: lesson.allowDownload,
    }, user.id),
  };
}
