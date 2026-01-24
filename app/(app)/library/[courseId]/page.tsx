import Link from "next/link";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getCourseForLibraryBySlug } from "@/lib/courses";
import { hasCourseAccess } from "@/lib/access";
import { prisma } from "@/lib/prisma";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  BookOpen, 
  CheckCircle2, 
  PlayCircle, 
  Lock, 
  Clock,
  ChevronRight,
  Award
} from "lucide-react";

type CourseAppPageProps = {
  params: { courseId: string };
};

export default async function CourseAppPage({ params }: CourseAppPageProps) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    redirect("/sign-in");
  }

  const { courseId } = await params;
  const course = await getCourseForLibraryBySlug(courseId);
  if (!course) {
    redirect("/courses");
  }

  const hasAccess = await hasCourseAccess(
    session.user.id,
    session.user.role,
    course.id
  );
  
  if (!hasAccess) {
    return (
      <div className="space-y-6">
        <div className="rounded-xl border bg-card p-8 text-center">
          <div className="flex flex-col items-center gap-4 max-w-md mx-auto">
            <div className="h-20 w-20 rounded-2xl bg-amber-500/10 flex items-center justify-center border border-amber-500/20">
              <Lock className="h-10 w-10 text-amber-600 dark:text-amber-400" />
            </div>
            <div className="space-y-2">
              <h1 className="text-2xl font-bold">{course.title}</h1>
              <p className="text-muted-foreground">
                Purchase required to unlock the full lesson experience.
              </p>
            </div>
            <Link href={`/courses/${course.slug}`}>
              <Button size="lg">
                View Course Details
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const lessonIds = course.Section.flatMap((section) =>
    section.Lesson.map((lesson) => lesson.id)
  );

  const progressEntries =
    lessonIds.length === 0
      ? []
      : await prisma.progress.findMany({
          where: { userId: session.user.id, lessonId: { in: lessonIds } },
        });

  const progressMap = new Map(
    progressEntries.map((entry) => [entry.lessonId, entry])
  );

  // Calculate overall progress
  const totalLessons = lessonIds.length;
  const completedLessons = progressEntries.filter(p => p.completedAt !== null).length;
  const overallProgress = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;

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
          {overallProgress === 100 && (
            <Badge className="bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/20 flex items-center gap-1">
              <Award className="h-3 w-3" />
              Completed
            </Badge>
          )}
        </div>

        {/* Overall Progress */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Overall Progress</span>
            <span className="font-semibold">{overallProgress}%</span>
          </div>
          <Progress value={overallProgress} className="h-2" />
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>{completedLessons} of {totalLessons} lessons completed</span>
            {totalLessons > 0 && (
              <span>{totalLessons - completedLessons} remaining</span>
            )}
          </div>
        </div>
      </div>

      {/* Sections */}
      <div className="space-y-4">
        {course.Section.map((section, sectionIndex) => {
          const sectionLessons = section.Lesson;
          const sectionCompleted = sectionLessons.filter(l => 
            progressMap.get(l.id)?.completedAt !== null
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
                  const isCompleted = progress?.completedAt !== null;
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
        
        {course.Section.length === 0 && (
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
