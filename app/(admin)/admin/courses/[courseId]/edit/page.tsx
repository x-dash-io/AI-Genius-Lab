import { redirect, notFound } from "next/navigation";
import { requireRole } from "@/lib/access";
import { getCourseForEdit, updateCourse, createSection, updateSection, deleteSection, createLesson, updateLesson, deleteLesson } from "@/lib/admin/courses";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { ArrowLeft, Plus, Trash2, GripVertical } from "lucide-react";
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

  redirect(`/admin/courses/${courseId}/edit`);
}

async function addSectionAction(courseId: string, formData: FormData) {
  "use server";
  await requireRole("admin");

  const title = formData.get("title") as string;
  const course = await getCourseForEdit(courseId);
  if (!course) throw new Error("Course not found");

  const maxSortOrder = Math.max(...course.sections.map(s => s.sortOrder), -1);
  await createSection(courseId, title, maxSortOrder + 1);

  redirect(`/admin/courses/${courseId}/edit`);
}

async function deleteSectionAction(sectionId: string, courseId: string) {
  "use server";
  await requireRole("admin");

  await deleteSection(sectionId);
  redirect(`/admin/courses/${courseId}/edit`);
}

async function addLessonAction(sectionId: string, formData: FormData) {
  "use server";
  await requireRole("admin");

  const title = formData.get("title") as string;
  const contentType = formData.get("contentType") as "video" | "audio" | "pdf" | "link" | "file";
  const contentUrl = formData.get("contentUrl") as string;
  const durationSeconds = formData.get("durationSeconds") ? parseInt(formData.get("durationSeconds") as string) : undefined;
  const isLocked = formData.get("isLocked") === "on";
  const allowDownload = formData.get("allowDownload") === "on";

  const course = await getCourseForEdit(formData.get("courseId") as string);
  if (!course) throw new Error("Course not found");
  
  const section = course.sections.find(s => s.id === sectionId);
  if (!section) throw new Error("Section not found");

  const maxSortOrder = Math.max(...section.lessons.map(l => l.sortOrder), -1);
  
  await createLesson({
    sectionId,
    title,
    contentType,
    contentUrl: contentUrl || undefined,
    durationSeconds,
    isLocked,
    allowDownload,
    sortOrder: maxSortOrder + 1,
  });

  redirect(`/admin/courses/${formData.get("courseId")}/edit`);
}

async function deleteLessonAction(lessonId: string, courseId: string) {
  "use server";
  await requireRole("admin");

  await deleteLesson(lessonId);
  redirect(`/admin/courses/${courseId}/edit`);
}

export default async function EditCoursePage({
  params,
}: {
  params: Promise<{ courseId: string }>;
}) {
  await requireRole("admin");

  const { courseId } = await params;
  const course = await getCourseForEdit(courseId);

  if (!course) {
    notFound();
  }

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
        course={course}
        updateCourseAction={updateCourseAction.bind(null, courseId)}
        addSectionAction={addSectionAction.bind(null, courseId)}
        deleteSectionAction={deleteSectionAction}
        addLessonAction={addLessonAction}
        deleteLessonAction={deleteLessonAction}
      />
    </div>
  );
}
