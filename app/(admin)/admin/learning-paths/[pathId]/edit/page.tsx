import { Suspense } from "react";
import { redirect, notFound } from "next/navigation";
import { requireRole } from "@/lib/access";
import {
  getLearningPathById,
  updateLearningPath,
  deleteLearningPath,
  addCourseToPath,
  removeCourseFromPath,
  updateCourseOrder,
} from "@/lib/admin/learning-paths";
import { getAllCourses } from "@/lib/admin/courses";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { ArrowLeft, Plus, X, GripVertical, Loader2 } from "lucide-react";
import { LearningPathEditForm } from "@/components/admin/LearningPathEditForm";

async function updateLearningPathAction(pathId: string, formData: FormData) {
  "use server";
  await requireRole("admin");

  const title = formData.get("title") as string;
  const description = formData.get("description") as string;

  await updateLearningPath(pathId, {
    title,
    description: description || undefined,
  });

  redirect(`/admin/learning-paths/${pathId}/edit`);
}

async function deleteLearningPathAction(pathId: string) {
  "use server";
  await requireRole("admin");

  await deleteLearningPath(pathId);
  redirect("/admin/learning-paths");
}

async function addCourseAction(pathId: string, formData: FormData) {
  "use server";
  await requireRole("admin");

  const courseId = formData.get("courseId") as string;
  if (!courseId) {
    throw new Error("Course ID is required");
  }

  await addCourseToPath(pathId, courseId);
  redirect(`/admin/learning-paths/${pathId}/edit`);
}

async function removeCourseAction(pathId: string, courseId: string) {
  "use server";
  await requireRole("admin");

  await removeCourseFromPath(pathId, courseId);
  redirect(`/admin/learning-paths/${pathId}/edit`);
}

async function reorderCoursesAction(pathId: string, courseIds: string[]) {
  "use server";
  await requireRole("admin");

  // Transform courseIds array to the expected format with sortOrder
  const courseOrders = courseIds.map((courseId, index) => ({
    courseId,
    sortOrder: index,
  }));

  await updateCourseOrder(pathId, courseOrders);
  redirect(`/admin/learning-paths/${pathId}/edit`);
}

async function LearningPathEditContent({ pathId }: { pathId: string }) {
  const pathData = await getLearningPathById(pathId);
  const allCourses = await getAllCourses();

  if (!pathData) {
    notFound();
  }

  // Transform the data to match expected format
  const path = {
    ...pathData,
    courses: (pathData.courses || []).map(lpc => ({
      ...lpc,
      courseId: lpc.Course.id,
      course: lpc.Course,
    })),
  };

  // Get courses not already in the path
  const pathCourseIds = new Set(path.courses.map((pc) => pc.courseId));
  const availableCourses = allCourses.filter(
    (course) => !pathCourseIds.has(course.id)
  );

  return (
    <div className="space-y-8">
      <div>
        <Link
          href="/admin/learning-paths"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-4"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Learning Paths
        </Link>
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
          Edit Learning Path
        </p>
        <h1 className="mt-2 font-display text-4xl font-bold tracking-tight">
          {path.title}
        </h1>
      </div>

      <LearningPathEditForm
        path={path}
        availableCourses={availableCourses}
        updateAction={updateLearningPathAction.bind(null, pathId)}
        deleteAction={deleteLearningPathAction.bind(null, pathId)}
        addCourseAction={addCourseAction.bind(null, pathId)}
        removeCourseAction={removeCourseAction.bind(null, pathId)}
        reorderCoursesAction={reorderCoursesAction.bind(null, pathId)}
      />
    </div>
  );
}

export default async function EditLearningPathPage({
  params,
}: {
  params: Promise<{ pathId: string }>;
}) {
  await requireRole("admin");
  const { pathId } = await params;

  return (
    <Suspense fallback={
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    }>
      <LearningPathEditContent pathId={pathId} />
    </Suspense>
  );
}
