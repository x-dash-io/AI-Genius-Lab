import { Suspense } from "react";
import { requireRole } from "@/lib/access";
import { createCourse } from "@/lib/admin/courses";
import Link from "next/link";
import { ArrowLeft, Loader2 } from "lucide-react";
import { CourseCreationForm } from "../../../../../components/admin/CourseCreationForm";

async function createCourseAction(formData: FormData) {
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
  const tier = formData.get("tier") as "STANDARD" | "PREMIUM";

  if (!title || !slug || !priceCents) {
    throw new Error("Missing required fields");
  }

  try {
    const course = await createCourse({
      title,
      slug,
      description: description || undefined,
      category: category === "none" ? undefined : category || undefined,
      priceCents,
      inventory,
      isPublished,
      tier,
    });

    return course;
  } catch (error: any) {
    // Handle Prisma unique constraint errors
    if (error.code === 'P2002' && error.meta?.target?.includes('slug')) {
      throw new Error(`A course with the slug "${slug}" already exists. Please choose a different slug.`);
    }

    // Re-throw other errors
    throw error;
  }
}

async function NewCourseContent() {
  await requireRole("admin");
  return <CourseCreationForm createCourseAction={createCourseAction} />;
}

export default async function NewCoursePage() {
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
          Create Course
        </p>
        <h1 className="mt-2 font-display text-4xl font-bold tracking-tight">
          New Course
        </h1>
        <p className="mt-2 text-lg text-muted-foreground">
          Create a new course with sections and lessons.
        </p>
      </div>

      <Suspense fallback={
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      }>
        <NewCourseContent />
      </Suspense>
    </div>
  );
}
