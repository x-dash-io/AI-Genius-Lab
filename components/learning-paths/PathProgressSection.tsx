"use client";

import { CheckCircle2, Circle, Clock3, PlayCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

interface PathProgressSectionProps {
  totalCourses: number;
  completedCount: number;
  inProgressCount: number;
  progressPercent: number;
  estimatedHours?: number;
  courses: Array<{ id: string; title: string; status: "completed" | "in-progress" | "not-started" }>;
}

export function PathProgressSection({
  totalCourses,
  completedCount,
  inProgressCount,
  progressPercent,
  estimatedHours,
  courses,
}: PathProgressSectionProps) {
  const notStartedCount = Math.max(0, totalCourses - completedCount - inProgressCount);
  const hoursRemaining =
    estimatedHours && totalCourses
      ? Math.ceil((estimatedHours / totalCourses) * notStartedCount)
      : null;

  return (
    <Card className="ui-surface border">
      <CardHeader className="space-y-3">
        <CardTitle className="text-xl">Progress Snapshot</CardTitle>
        <CardDescription>Track completion across every course in this path.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-[var(--radius-sm)] border bg-background p-3">
            <p className="text-xs text-muted-foreground">Completed</p>
            <p className="mt-1 text-2xl font-semibold">{completedCount}</p>
          </div>
          <div className="rounded-[var(--radius-sm)] border bg-background p-3">
            <p className="text-xs text-muted-foreground">In Progress</p>
            <p className="mt-1 text-2xl font-semibold">{inProgressCount}</p>
          </div>
          <div className="rounded-[var(--radius-sm)] border bg-background p-3">
            <p className="text-xs text-muted-foreground">Not Started</p>
            <p className="mt-1 text-2xl font-semibold">{notStartedCount}</p>
          </div>
          <div className="rounded-[var(--radius-sm)] border bg-background p-3">
            <p className="text-xs text-muted-foreground">Estimated Time Left</p>
            <p className="mt-1 text-2xl font-semibold">{hoursRemaining !== null ? `${hoursRemaining}h` : "—"}</p>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="font-semibold">Overall completion</span>
            <span className="text-muted-foreground">{progressPercent}%</span>
          </div>
          <Progress value={progressPercent} className="h-2.5" />
        </div>

        <div className="space-y-2">
          <p className="text-sm font-semibold">Course breakdown</p>
          <div className="grid gap-2">
            {courses.map((course) => (
              <div
                key={course.id}
                className="flex items-center gap-3 rounded-[var(--radius-sm)] border bg-background px-3 py-2.5"
              >
                {course.status === "completed" ? (
                  <CheckCircle2 className="h-4 w-4 text-success" />
                ) : course.status === "in-progress" ? (
                  <PlayCircle className="h-4 w-4 text-primary" />
                ) : (
                  <Circle className="h-4 w-4 text-muted-foreground" />
                )}
                <span className={course.status === "completed" ? "text-sm text-muted-foreground line-through" : "text-sm text-foreground"}>
                  {course.title}
                </span>
                <Badge variant={course.status === "completed" ? "secondary" : "outline"} className="ml-auto capitalize">
                  {course.status === "in-progress" ? "In progress" : course.status.replace("-", " ")}
                </Badge>
              </div>
            ))}
          </div>
        </div>

        {hoursRemaining !== null ? (
          <p className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
            <Clock3 className="h-3.5 w-3.5" />
            Remaining estimate is based on unfinished courses only.
          </p>
        ) : null}
      </CardContent>
    </Card>
  );
}
