"use client";

import { useEffect, useMemo } from "react";
import { useCourseProgress } from "@/contexts/CourseProgressContext";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import {
  CheckCircle2,
  PlayCircle,
  Clock,
  Award,
  RefreshCw,
  Sparkles,
  BookOpen,
} from "lucide-react";
import Link from "next/link";

interface Course {
  id: string;
  slug: string;
  title: string;
  imageUrl: string | null;
  sections: Array<{
    id: string;
    title: string;
    lessons: Array<{
      id: string;
      title: string;
    }>;
  }>;
}

interface DynamicCoursePageProps {
  course: Course;
  initialProgress: {
    totalLessons: number;
    completedLessons: number;
    overallProgress: number;
    lessons: Array<{
      lessonId: string;
      completedAt: string | null;
      completionPercent: number;
    }>;
  };
}

export function DynamicCoursePage({ course, initialProgress }: DynamicCoursePageProps) {
  const { progress, updateProgress, refreshCourse, isUpdating } = useCourseProgress();

  // Initialize progress in context
  useEffect(() => {
    refreshCourse(course.slug);
  }, [course.slug, refreshCourse]);

  // Listen for progress updates from lesson viewer
  useEffect(() => {
    const handleProgressUpdate = (event: CustomEvent) => {
      const { lessonId, progress: lessonProgress, completed } = event.detail;
      updateProgress(course.slug, lessonId, {
        completionPercent: lessonProgress,
        completedAt: completed ? new Date().toISOString() : null
      });
    };

    window.addEventListener('lessonProgressUpdate', handleProgressUpdate as EventListener);
    return () => window.removeEventListener('lessonProgressUpdate', handleProgressUpdate as EventListener);
  }, [course.slug, updateProgress]);

  const localProgress = useMemo(() => {
    const courseProgress = progress.get(course.slug);
    if (!courseProgress) {
      return initialProgress;
    }

    return {
      totalLessons: courseProgress.totalLessons,
      completedLessons: courseProgress.completedLessons,
      overallProgress: courseProgress.overallProgress,
      lessons: courseProgress.lessons.map((lesson) => ({
        lessonId: lesson.lessonId,
        completedAt: lesson.completedAt,
        completionPercent: lesson.completionPercent,
      })),
    };
  }, [course.slug, initialProgress, progress]);

  const progressMap = new Map(
    localProgress.lessons.map(lesson => [lesson.lessonId, lesson])
  );

  return (
    <div className="grid gap-5">
      <Card className="ui-surface">
        <CardHeader className="gap-4">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="space-y-1">
              <CardTitle className="text-2xl sm:text-3xl">{course.title}</CardTitle>
              <CardDescription>
                Follow the structured sections below to complete every lesson and unlock full outcomes.
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              {localProgress.overallProgress === 100 ? (
                <Badge variant="secondary" className="inline-flex items-center gap-1">
                  <Award className="h-3.5 w-3.5" />
                  Completed
                </Badge>
              ) : null}
              <Button
                variant="outline"
                size="sm"
                onClick={() => refreshCourse(course.slug)}
                disabled={isUpdating}
                className="h-11"
              >
                <RefreshCw className={`h-4 w-4 ${isUpdating ? "animate-spin" : ""}`} />
                <span className="ml-2">Refresh</span>
              </Button>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            <div className="rounded-[var(--radius-sm)] border bg-background px-3 py-2">
              <p className="text-xs uppercase tracking-wide text-muted-foreground">Overall Progress</p>
              <p className="mt-1 text-lg font-semibold">{localProgress.overallProgress}%</p>
            </div>
            <div className="rounded-[var(--radius-sm)] border bg-background px-3 py-2">
              <p className="text-xs uppercase tracking-wide text-muted-foreground">Completed</p>
              <p className="mt-1 text-lg font-semibold">{localProgress.completedLessons}</p>
            </div>
            <div className="rounded-[var(--radius-sm)] border bg-background px-3 py-2">
              <p className="text-xs uppercase tracking-wide text-muted-foreground">Remaining</p>
              <p className="mt-1 text-lg font-semibold">
                {Math.max(localProgress.totalLessons - localProgress.completedLessons, 0)}
              </p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-2">
          <Progress value={localProgress.overallProgress} className="h-2" />
          <p className="text-xs text-muted-foreground">
            {localProgress.completedLessons} of {localProgress.totalLessons} lessons completed
          </p>
        </CardContent>
      </Card>

      <div className="grid gap-4">
        {course.sections.map((section, sectionIndex) => {
          const sectionLessons = section.lessons;
          const sectionCompleted = sectionLessons.filter(l =>
            progressMap.get(l.id)?.completedAt != null
          ).length;
          const sectionProgress = sectionLessons.length > 0
            ? Math.round((sectionCompleted / sectionLessons.length) * 100)
            : 0;

          return (
            <Card key={section.id} className="ui-surface overflow-hidden">
              <CardHeader className="gap-3 border-b">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex-1">
                    <div className="mb-1 flex items-center gap-2">
                      <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                        Section {sectionIndex + 1}
                      </span>
                      {sectionProgress === 100 && (
                        <Badge variant="secondary" className="inline-flex items-center gap-1 text-xs">
                          <CheckCircle2 className="h-3 w-3" />
                          Complete
                        </Badge>
                      )}
                    </div>
                    <CardTitle className="text-lg">{section.title}</CardTitle>
                  </div>
                  <div className="rounded-[var(--radius-sm)] border bg-background px-3 py-2 text-right">
                    <p className="text-sm font-semibold">{sectionProgress}%</p>
                    <p className="text-xs text-muted-foreground">{sectionCompleted}/{sectionLessons.length} complete</p>
                  </div>
                </div>
                {sectionLessons.length > 0 && (
                  <Progress value={sectionProgress} className="h-1.5" />
                )}
              </CardHeader>

              <CardContent className="p-4">
                {sectionLessons.map((lesson, lessonIndex) => {
                  const progress = progressMap.get(lesson.id);
                  const isCompleted = progress?.completedAt != null;
                  const progressPercent = progress?.completionPercent ?? 0;

                  return (
                    <div
                      key={lesson.id}
                      className="supports-hover-card flex flex-wrap items-center gap-3 rounded-[var(--radius-sm)] border bg-background px-3 py-3"
                    >
                      <div className="flex h-11 w-11 items-center justify-center rounded-full border bg-background text-muted-foreground">
                        {isCompleted ? <CheckCircle2 className="h-5 w-5 text-success" /> : progressPercent > 0 ? <PlayCircle className="h-5 w-5 text-primary" /> : lessonIndex + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="truncate text-sm font-semibold">
                          {lesson.title}
                        </p>
                        <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                          {isCompleted ? (
                            <span className="inline-flex items-center gap-1 text-success">
                              <CheckCircle2 className="h-3 w-3" />
                              Completed
                            </span>
                          ) : progressPercent > 0 ? (
                            <span className="inline-flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {progressPercent}% complete
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1">
                              <PlayCircle className="h-3 w-3" />
                              Not started
                            </span>
                          )}
                        </div>
                      </div>
                      <Link href={`/library/${course.slug}/lesson/${lesson.id}`} className="w-full sm:w-auto">
                        <Button size="sm" className="w-full sm:w-auto">
                          Open lesson
                        </Button>
                      </Link>
                    </div>
                  );
                })}
                {sectionLessons.length === 0 && (
                  <EmptyState
                    icon={<Sparkles className="h-5 w-5" />}
                    title="No lessons in this section"
                    description="Lessons will appear here once curriculum content is published."
                    className="min-h-40"
                  />
                )}
              </CardContent>
            </Card>
          );
        })}

        {course.sections.length === 0 && (
          <EmptyState
            icon={<BookOpen className="h-6 w-6" />}
            title="No sections available yet"
            description="This course is ready, but section content has not been added yet."
          />
        )}
      </div>
    </div>
  );
}
