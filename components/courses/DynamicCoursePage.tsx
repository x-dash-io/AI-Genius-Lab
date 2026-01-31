"use client";

import { useEffect, useState } from "react";
import { useCourseProgress } from "@/contexts/CourseProgressContext";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  BookOpen, 
  CheckCircle2, 
  PlayCircle, 
  Clock,
  ChevronRight,
  Award,
  RefreshCw
} from "lucide-react";
import Link from "next/link";

interface Course {
  id: string;
  slug: string;
  title: string;
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
  const [localProgress, setLocalProgress] = useState(initialProgress);

  // Initialize progress in context
  useEffect(() => {
    refreshCourse(course.slug);
  }, [course.slug]);

  // Update local progress when context changes
  useEffect(() => {
    const courseProgress = progress.get(course.slug);
    if (courseProgress) {
      setLocalProgress({
        totalLessons: courseProgress.totalLessons,
        completedLessons: courseProgress.completedLessons,
        overallProgress: courseProgress.overallProgress,
        lessons: courseProgress.lessons.map(l => ({
          lessonId: l.lessonId,
          completedAt: l.completedAt,
          completionPercent: l.completionPercent
        }))
      });
    }
  }, [progress, course.slug]);

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

  const progressMap = new Map(
    localProgress.lessons.map(lesson => [lesson.lessonId, lesson])
  );

  return (
    <div className="space-y-6">
      {/* Course Header */}
      <div className="rounded-xl border bg-card p-6 shadow-sm">
        <div className="flex items-start justify-between gap-4 mb-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <BookOpen className="h-5 w-5 text-primary" />
              <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Course
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold mb-2">{course.title}</h1>
            <p className="text-muted-foreground">
              Continue your learning path with structured sections and lessons.
            </p>
          </div>
          <div className="flex items-center gap-2">
            {localProgress.overallProgress === 100 && (
              <Badge className="bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/20 flex items-center gap-1">
                <Award className="h-3 w-3" />
                Completed
              </Badge>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={() => refreshCourse(course.slug)}
              disabled={isUpdating}
            >
              <RefreshCw className={`h-4 w-4 ${isUpdating ? 'animate-spin' : ''}`} />
            </Button>
          </div>
        </div>

        {/* Overall Progress */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Overall Progress</span>
            <span className="font-semibold">{localProgress.overallProgress}%</span>
          </div>
          <Progress value={localProgress.overallProgress} className="h-2" />
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>{localProgress.completedLessons} of {localProgress.totalLessons} lessons completed</span>
            {localProgress.totalLessons > 0 && (
              <span>{localProgress.totalLessons - localProgress.completedLessons} remaining</span>
            )}
          </div>
        </div>
      </div>

      {/* Sections */}
      <div className="space-y-4">
        {course.sections.map((section, sectionIndex) => {
          const sectionLessons = section.lessons;
          const sectionCompleted = sectionLessons.filter(l =>
            progressMap.get(l.id)?.completedAt != null
          ).length;
          const sectionProgress = sectionLessons.length > 0 
            ? Math.round((sectionCompleted / sectionLessons.length) * 100) 
            : 0;

          return (
            <div
              key={section.id}
              className="rounded-xl border bg-card overflow-hidden shadow-sm"
            >
              {/* Section Header */}
              <div className="p-5 border-b bg-muted/30">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-semibold text-muted-foreground">
                        Section {sectionIndex + 1}
                      </span>
                      {sectionProgress === 100 && (
                        <Badge variant="secondary" className="text-xs">
                          <CheckCircle2 className="h-3 w-3 mr-1" />
                          Complete
                        </Badge>
                      )}
                    </div>
                    <h2 className="text-lg font-semibold">{section.title}</h2>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium">{sectionProgress}%</div>
                    <div className="text-xs text-muted-foreground">
                      {sectionCompleted}/{sectionLessons.length}
                    </div>
                  </div>
                </div>
                {sectionLessons.length > 0 && (
                  <Progress value={sectionProgress} className="h-1.5 mt-3" />
                )}
              </div>

              {/* Lessons */}
              <div className="divide-y">
                {sectionLessons.map((lesson, lessonIndex) => {
                  const progress = progressMap.get(lesson.id);
                  const isCompleted = progress?.completedAt != null;
                  const progressPercent = progress?.completionPercent ?? 0;

                  return (
                    <Link
                      key={lesson.id}
                      href={`/library/${course.slug}/lesson/${lesson.id}`}
                      className="flex items-center gap-4 p-4 hover:bg-muted/50 transition-colors group"
                    >
                      {/* Lesson Number/Status */}
                      <div className="flex-shrink-0">
                        {isCompleted ? (
                          <div className="h-10 w-10 rounded-full bg-green-500/10 border border-green-500/20 flex items-center justify-center">
                            <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400" />
                          </div>
                        ) : progressPercent > 0 ? (
                          <div className="h-10 w-10 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center">
                            <PlayCircle className="h-5 w-5 text-primary" />
                          </div>
                        ) : (
                          <div className="h-10 w-10 rounded-full bg-muted border flex items-center justify-center text-sm font-medium text-muted-foreground">
                            {lessonIndex + 1}
                          </div>
                        )}
                      </div>

                      {/* Lesson Info */}
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium group-hover:text-primary transition-colors truncate">
                          {lesson.title}
                        </h3>
                        <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                          {isCompleted ? (
                            <span className="flex items-center gap-1 text-green-600 dark:text-green-400">
                              <CheckCircle2 className="h-3 w-3" />
                              Completed
                            </span>
                          ) : progressPercent > 0 ? (
                            <span className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {progressPercent}% complete
                            </span>
                          ) : (
                            <span className="flex items-center gap-1">
                              <PlayCircle className="h-3 w-3" />
                              Not started
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Arrow */}
                      <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors flex-shrink-0" />
                    </Link>
                  );
                })}
                {sectionLessons.length === 0 && (
                  <div className="p-8 text-center text-sm text-muted-foreground">
                    No lessons yet for this section.
                  </div>
                )}
              </div>
            </div>
          );
        })}
        
        {course.sections.length === 0 && (
          <div className="rounded-xl border bg-card p-8 text-center">
            <p className="text-muted-foreground">
              This course has no sections yet. Content will be added soon.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
