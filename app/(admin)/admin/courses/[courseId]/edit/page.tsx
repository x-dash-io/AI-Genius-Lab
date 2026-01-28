import { Suspense } from "react";
import { notFound } from "next/navigation";
import { requireRole } from "@/lib/access";
import { getCourseForEdit, updateCourse, createSection, deleteSection, createLesson, deleteLesson, updateLesson, updateLessonContent, deleteLessonContent, createLessonContent } from "@/lib/admin/courses";
import Link from "next/link";
import { ArrowLeft, Loader2 } from "lucide-react";
import { CourseEditForm } from "@/components/admin/CourseEditForm";

async function updateCourseAction(courseId: string, formData: FormData) {
  "use server";
  await requireRole("admin");

  const title = formData.get("title") as string;
  const slug = formData.get("slug") as string;
  const description = formData.get("description") as string;
  const category = formData.get("category") as string;
  const priceCents = parseInt(formData.get("priceCents") as string) * 100;
  const inventoryStr = formData.get("inventory") as string;
  const inventory = inventoryStr && inventoryStr.trim() !== "" ? parseInt(inventoryStr) : null;
  const isPublished = formData.get("isPublished") === "on";

  await updateCourse(courseId, {
    title,
    slug,
    description: description || undefined,
    category: category || undefined,
    priceCents,
    inventory,
    isPublished,
  });

  return { success: true };
}

async function addSectionAction(courseId: string, formData: FormData) {
  "use server";
  await requireRole("admin");

  const title = formData.get("title") as string;
  const course = await getCourseForEdit(courseId);
  if (!course) throw new Error("Course not found");

  const maxSortOrder = Math.max(...(course.Section || []).map(s => s.sortOrder), -1);
  const section = await createSection(courseId, title, maxSortOrder + 1);

  return { ...section, lessons: [] };
}

async function deleteSectionAction(sectionId: string, courseId: string) {
  "use server";
  await requireRole("admin");

  await deleteSection(sectionId);
  return { success: true };
}

async function addLessonAction(sectionId: string, formData: FormData) {
  "use server";
  await requireRole("admin");

  const title = formData.get("title") as string;
  const durationSeconds = formData.get("durationSeconds") ? parseInt(formData.get("durationSeconds") as string) : undefined;
  const isLocked = formData.get("isLocked") === "on";
  const allowDownload = formData.get("allowDownload") === "on";

  const course = await getCourseForEdit(formData.get("courseId") as string);
  if (!course) throw new Error("Course not found");

  const section = (course.Section || []).find(s => s.id === sectionId);
  if (!section) throw new Error("Section not found");

  const maxSortOrder = Math.max(...(section.Lesson || []).map(l => l.sortOrder), -1);

  const lesson = await createLesson({
    sectionId,
    title,
    durationSeconds,
    isLocked,
    allowDownload,
    sortOrder: maxSortOrder + 1,
  });

  // Parse content data from form
  const contentData: Array<{ contentType: string; contentUrl?: string; title?: string }> = [];
  let contentIndex = 0;

  while (true) {
    const contentTypeKey = `content-${contentIndex}-type`;
    const contentUrlKey = `content-${contentIndex}-url`;
    const contentTitleKey = `content-${contentIndex}-title`;

    const contentType = formData.get(contentTypeKey);
    const contentUrl = formData.get(contentUrlKey);
    const contentTitle = formData.get(contentTitleKey);

    if (!contentType) break;

    contentData.push({
      contentType: contentType as string,
      contentUrl: contentUrl as string || undefined,
      title: contentTitle as string || undefined,
    });

    contentIndex++;
  }

  // Create lesson content items
  if (contentData.length > 0) {
    const { createLessonContent } = await import("@/lib/admin/courses");
    for (let i = 0; i < contentData.length; i++) {
      const content = contentData[i];
      await createLessonContent({
        lessonId: lesson.id,
        contentType: content.contentType as "video" | "audio" | "pdf" | "link" | "file",
        contentUrl: content.contentUrl,
        title: content.title,
        sortOrder: i,
      });
    }
  }

  return lesson;
}

async function deleteLessonAction(lessonId: string, courseId: string) {
  "use server";
  await requireRole("admin");

  await deleteLesson(lessonId);
  return { success: true };
}

async function updateLessonAction(lessonId: string, formData: FormData) {
  "use server";
  await requireRole("admin");

  const title = formData.get("title") as string;
  const durationSeconds = formData.get("durationSeconds") ? parseInt(formData.get("durationSeconds") as string) : undefined;
  const isLocked = formData.get("isLocked") === "on";
  const allowDownload = formData.get("allowDownload") === "on";

  await updateLesson(lessonId, {
    title,
    durationSeconds,
    isLocked,
    allowDownload,
  });

  // Parse and update content data from form
  const contentData: Array<{ id?: string; contentType: string; contentUrl?: string; title?: string }> = [];
  let contentIndex = 0;

  while (true) {
    const contentIdKey = `content-${contentIndex}-id`;
    const contentTypeKey = `content-${contentIndex}-type`;
    const contentUrlKey = `content-${contentIndex}-url`;
    const contentTitleKey = `content-${contentIndex}-title`;

    const contentId = formData.get(contentIdKey);
    const contentType = formData.get(contentTypeKey);
    const contentUrl = formData.get(contentUrlKey);
    const contentTitle = formData.get(contentTitleKey);

    if (!contentType) break;

    contentData.push({
      id: contentId as string || undefined,
      contentType: contentType as string,
      contentUrl: contentUrl as string || undefined,
      title: contentTitle as string || undefined,
    });

    contentIndex++;
  }

  // Get existing content for this lesson
  const course = await getCourseForEdit(formData.get("courseId") as string);
  if (!course) throw new Error("Course not found");
  
  const existingContent: Array<{ id: string }> = [];
  for (const section of (course.Section || [])) {
    const foundLesson = (section.Lesson || []).find(l => l.id === lessonId);
    if (foundLesson) {
      existingContent.push(...(foundLesson.LessonContent || []).map(c => ({ id: c.id })));
      break;
    }
  }

  // Update or create content items
  const processedContentIds = new Set<string>();
  
  for (let i = 0; i < contentData.length; i++) {
    const content = contentData[i];
    
    if (content.id && existingContent.find(ec => ec.id === content.id)) {
      // Update existing content
      await updateLessonContent(content.id, {
        contentType: content.contentType as "video" | "audio" | "pdf" | "link" | "file",
        contentUrl: content.contentUrl,
        title: content.title,
        sortOrder: i,
      });
      processedContentIds.add(content.id);
    } else {
      // Create new content
      await createLessonContent({
        lessonId,
        contentType: content.contentType as "video" | "audio" | "pdf" | "link" | "file",
        contentUrl: content.contentUrl,
        title: content.title,
        sortOrder: i,
      });
    }
  }

  // Delete content items that were removed
  for (const existing of existingContent) {
    if (!processedContentIds.has(existing.id)) {
      await deleteLessonContent(existing.id);
    }
  }

  return { success: true };
}

async function CourseEditContent({ courseId }: { courseId: string }) {
  const course = await getCourseForEdit(courseId);

  if (!course) {
    notFound();
  }

  // Transform the course data to match the expected type
  const courseWithSections = {
    ...course,
    sections: (course.Section || []).map(section => ({
      ...section,
      lessons: (section.Lesson || []).map(lesson => ({
        ...lesson,
        contents: lesson.LessonContent || [],
      })),
    })),
  };

  return (
    <div className="space-y-8">
      <div>
        <Link
          href="/admin/courses"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-4"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Courses
        </Link>
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
          Edit Course
        </p>
        <h1 className="mt-2 font-display text-4xl font-bold tracking-tight">
          {course.title}
        </h1>
      </div>

      <CourseEditForm
        course={courseWithSections}
        updateCourseAction={updateCourseAction.bind(null, courseId)}
        addSectionAction={addSectionAction.bind(null, courseId)}
        deleteSectionAction={deleteSectionAction}
        addLessonAction={addLessonAction}
        deleteLessonAction={deleteLessonAction}
        updateLessonAction={updateLessonAction}
      />
    </div>
  );
}

export default async function EditCoursePage({
  params,
}: {
  params: Promise<{ courseId: string }>;
}) {
  await requireRole("admin");
  const { courseId } = await params;

  return (
    <Suspense fallback={
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    }>
      <CourseEditContent courseId={courseId} />
    </Suspense>
  );
}
