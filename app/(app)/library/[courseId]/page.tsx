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
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Card, CardContent } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { Badge } from "@/components/ui/badge";
import { BookOpen, Lock } from "lucide-react";
import {
  ContentRegion,
  PageContainer,
  PageHeader,
  StatusRegion,
  Toolbar,
} from "@/components/layout/shell";

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
      <PageContainer className="space-y-6">
        <PageHeader
          title={course.title}
          description="Course content is locked for your current access level."
          breadcrumbs={[
            { label: "Dashboard", href: "/dashboard" },
            { label: "Library", href: "/library" },
            { label: course.title },
          ]}
          actions={
            <Link href="/courses">
              <Button variant="outline">Browse catalog</Button>
            </Link>
          }
        />

        <StatusRegion>
          <EmptyState
            icon={<Lock className="h-6 w-6" />}
            title={isPremium ? "Premium plan required" : "Purchase required"}
            description={
              isPremium
                ? "This premium course is available to active Professional or Founder subscriptions."
                : "Purchase this course to unlock lessons, progress tracking, and certificates."
            }
            action={
              isPremium ? (
                <Link href="/pricing">
                  <Button variant="premium">Upgrade subscription</Button>
                </Link>
              ) : (
                <Link href={`/courses/${course.slug}`}>
                  <Button>View course details</Button>
                </Link>
              )
            }
          />

          <Alert>
            <BookOpen className="h-4 w-4" />
            <AlertTitle>Access remains unchanged</AlertTitle>
            <AlertDescription>
              Enrollment and billing logic were not modified in this UI pass.
            </AlertDescription>
          </Alert>
        </StatusRegion>
      </PageContainer>
    );
  }

  const lessonIds = course.sections.flatMap((section) =>
    section.lessons.map((lesson) => lesson.id)
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
  const completedLessons = progressEntries.filter((entry) => entry.completedAt != null).length;
  const overallProgress = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;

  // Format initial progress for dynamic component
  const initialProgress = {
    totalLessons,
    completedLessons,
    overallProgress,
    lessons: lessonIds.map((lessonId) => {
      const progress = progressMap.get(lessonId);
      return {
        lessonId,
        completedAt: progress?.completedAt?.toISOString() || null,
        completionPercent: progress?.completionPercent || 0,
      };
    }),
  };

  return (
    <PageContainer className="space-y-6">
      <PageHeader
        title={course.title}
        description="Continue lesson modules, monitor progress, and resume exactly where you left off."
        breadcrumbs={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Library", href: "/library" },
          { label: course.title },
        ]}
        actions={
          <Link href={`/courses/${course.slug}`}>
            <Button variant="outline">Course overview</Button>
          </Link>
        }
      />

      <Toolbar className="justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="secondary">
            {initialProgress.completedLessons}/{initialProgress.totalLessons} lessons complete
          </Badge>
          <Badge variant="outline">{initialProgress.overallProgress}% progress</Badge>
        </div>
        <Link href="/library">
          <Button variant="ghost" size="sm">
            Back to library
          </Button>
        </Link>
      </Toolbar>

      <ContentRegion>
        <CourseProgressProvider>
          <DynamicCoursePage
            course={course}
            initialProgress={initialProgress}
          />
        </CourseProgressProvider>
      </ContentRegion>

      <StatusRegion>
        <Card className="ui-surface">
          <CardContent className="flex flex-wrap items-center justify-between gap-3 p-4 text-sm">
            <p className="text-muted-foreground">
              Need another route? Continue browsing or open your dashboard overview.
            </p>
            <div className="flex flex-wrap items-center gap-2">
              <Link href="/dashboard">
                <Button variant="ghost" size="sm">Open dashboard</Button>
              </Link>
              <Link href="/courses">
                <Button variant="ghost" size="sm">Find new courses</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </StatusRegion>
    </PageContainer>
  );
}
