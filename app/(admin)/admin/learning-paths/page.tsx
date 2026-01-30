import { Suspense } from "react";
import { requireRole } from "@/lib/access";
import { getAllLearningPaths } from "@/lib/admin/learning-paths";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { BookOpen, Plus, Edit, Trash2, Loader2 } from "lucide-react";

async function LearningPathsList() {
  const pathsData = await getAllLearningPaths();

  // Transform the data to match expected format
  const paths = pathsData.map((pathData: any) => ({
    ...pathData,
    courses: (pathData.courses || []).map((lpc: any) => ({
      ...lpc,
      course: lpc.Course,
    })),
    _count: {
      courses: pathData._count.courses,
    },
  }));

  if (paths.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <BookOpen className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
          <p className="text-muted-foreground mb-4">No learning paths yet.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid gap-4">
      {paths.map((path: any) => (
        <Card key={path.id}>
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="space-y-1 flex-1">
                <CardTitle className="text-xl">{path.title}</CardTitle>
                {path.description && (
                  <CardDescription>{path.description}</CardDescription>
                )}
                <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                  <span>{path._count.courses} courses</span>
                  <span>•</span>
                  <span>
                    Created {new Date(path.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
              <div className="flex gap-2">
                <Link href={`/admin/learning-paths/${path.id}/edit`}>
                  <Button variant="outline" size="sm">
                    <Edit className="h-4 w-4 mr-1" />
                    Edit
                  </Button>
                </Link>
              </div>
            </div>
          </CardHeader>
          {path.courses.length > 0 && (
            <CardContent>
              <div className="space-y-2">
                <p className="text-sm font-medium">Courses in this path:</p>
                <div className="flex flex-wrap gap-2">
                  {path.courses.map((pathCourse: any) => (
                    <Badge
                      key={pathCourse.id}
                      variant={pathCourse.course.isPublished ? "default" : "secondary"}
                    >
                      {pathCourse.course.title}
                    </Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          )}
        </Card>
      ))}
    </div>
  );
}

export default async function AdminLearningPathsPage() {
  await requireRole("admin");

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
            Learning Path Management
          </p>
          <h1 className="mt-2 font-display text-4xl font-bold tracking-tight">
            Learning Paths
          </h1>
          <p className="mt-2 text-lg text-muted-foreground">
            Create and manage structured learning paths for your courses.
          </p>
        </div>
        <Link href="/admin/learning-paths/new">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            New Learning Path
          </Button>
        </Link>
      </div>

      <Suspense fallback={
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      }>
        <LearningPathsList />
      </Suspense>
    </div>
  );
}
