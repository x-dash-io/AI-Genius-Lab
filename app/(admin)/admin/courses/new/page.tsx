import { requireRole } from "@/lib/access";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { CourseCreationForm } from "../../../../../components/admin/CourseCreationForm";

export default async function NewCoursePage() {
  await requireRole("admin");

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

      <CourseCreationForm />
    </div>
  );
}
