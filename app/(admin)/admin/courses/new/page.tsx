import { Suspense } from "react";
import { requireRole } from "@/lib/access";
import { createCourse } from "@/lib/admin/courses";
import { handleServerError } from "@/lib/errors";
import Link from "next/link";
import { ArrowLeft, Loader2 } from "lucide-react";
import { CourseCreationForm } from "../../../../../components/admin/CourseCreationForm";

async function createCourseAction(formData: FormData) {
  "use server";
  await requireRole("admin");

  try {
    const title = formData.get("title") as string;
    const slug = formData.get("slug") as string;
    const description = formData.get("description") as string;
    const category = formData.get("category") as string;
    const priceCentsStr = formData.get("priceCents") as string;
    const priceCents = priceCentsStr ? parseInt(priceCentsStr) * 100 : 0;
    const inventoryStr = formData.get("inventory") as string;
    const inventory = inventoryStr && inventoryStr.trim() !== "" ? parseInt(inventoryStr) : null;
    const isPublished = formData.get("isPublished") === "on";
    const tier = formData.get("tier") as "STANDARD" | "PREMIUM";
    const imageUrl = formData.get("imageUrl") as string;

    if (!title || !slug || !priceCentsStr) {
      throw new Error("Missing required fields");
    }

    const course = await createCourse({
      title,
      slug,
      description: description || undefined,
      category: category === "none" ? undefined : category || undefined,
      priceCents,
      inventory,
      isPublished,
      tier,
      imageUrl: imageUrl || undefined,
    });

    return { course };
  } catch (error: unknown) {
    const prismaError = error as { code?: string; meta?: { target?: string[] } };
    // Handle Prisma unique constraint errors
    if (prismaError.code === "P2002" && prismaError.meta?.target?.includes("slug")) {
      return { error: `A course with the slug "${formData.get("slug")}" already exists. Please choose a different slug.` };
    }

    const { userMessage } = handleServerError(error);
    return { error: userMessage };
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
