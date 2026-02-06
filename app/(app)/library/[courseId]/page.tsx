import Link from "next/link";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getCourseForLibraryBySlug } from "@/lib/courses";
import { hasCourseAccess } from "@/lib/access";
import { prisma } from "@/lib/prisma";
import { CourseProgressProvider } from "@/contexts/CourseProgressContext";
import { DynamicCoursePage } from "@/components/courses/DynamicCoursePage";
import { Button } from "@/components/ui/button";
import { Lock } from "lucide-react";

export const dynamic = "force-dynamic";

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
    const isPremium = course.tier === "PREMIUM";

    return (
      <div className="space-y-6">
        <div className="rounded-xl border bg-card p-8 text-center">
          <div className="flex flex-col items-center gap-4 max-w-md mx-auto">
            <div className="h-20 w-20 rounded-2xl bg-amber-500/10 flex items-center justify-center border border-amber-500/20">
              <Lock className="h-10 w-10 text-amber-600 dark:text-amber-400" />
            </div>
            <div className="space-y-2">
              <h1 className="text-2xl font-bold">{course.title}</h1>
              {isPremium ? (
                <p className="text-muted-foreground">
                  This is a <span className="font-bold uppercase">Premium</span> course. It is available exclusively to Pro and Elite subscribers.
                </p>
              ) : (
                <p className="text-muted-foreground">
                  Purchase required to unlock the full lesson experience.
                </p>
              )}
            </div>
            {isPremium ? (
              <Link href="/pricing">
                <Button size="lg">
                  Upgrade to Pro
                </Button>
              </Link>
            ) : (
              <Link href={`/courses/${course.slug}`}>
                <Button size="lg" variant="outline">
                  View Course Details
                </Button>
              </Link>
            )}
          </div>
        </div>
      </div>
    );
  }

  const lessonIds = course.sections.flatMap((section: any) =>
    section.lessons.map((lesson: any) => lesson.id)
  );

  const progressEntries =
    lessonIds.length === 0
      ? []
      : await prisma.progress.findMany({
        where: { userId: session.user.id, lessonId: { in: lessonIds } },
      });

  const progressMap = new Map<string, any>(
    progressEntries.map((entry: any) => [entry.lessonId, entry])
  );

  // Calculate overall progress
  const totalLessons = lessonIds.length;
  const completedLessons = progressEntries.filter((p: any) => p.completedAt != null).length;
  const overallProgress = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;

  // Format initial progress for dynamic component
  const initialProgress = {
    totalLessons,
    completedLessons,
    overallProgress,
    lessons: lessonIds.map(lessonId => {
      const progress = progressMap.get(lessonId);
      return {
        lessonId,
        completedAt: progress?.completedAt?.toISOString() || null,
        completionPercent: progress?.completionPercent || 0,
      };
    }),
  };

  return (
    <CourseProgressProvider>
      <DynamicCoursePage
        course={course}
        initialProgress={initialProgress}
      />
    </CourseProgressProvider>
  );
}
