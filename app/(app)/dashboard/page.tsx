import { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import {
  Activity,
  ArrowRight,
  Award,
  BookOpen,
  CalendarDays,
  CheckCircle2,
  Clock3,
  Flame,
} from "lucide-react";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { generateMetadata as generateSEOMetadata } from "@/lib/seo";
import { SubscriptionSuccessToast } from "@/components/checkout/SubscriptionSuccessToast";
import { CertificateSyncButton } from "@/components/dashboard/CertificateSyncButton";
import { CertificateViewButton } from "@/components/dashboard/CertificateViewButton";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { Progress } from "@/components/ui/progress";
import {
  ContentRegion,
  PageContainer,
  PageHeader,
  StatusRegion,
} from "@/components/layout/shell";

interface SessionUser {
  id: string;
  role: string;
  name?: string | null;
}

interface Session {
  user: SessionUser;
}

export const dynamic = "force-dynamic";

export const metadata: Metadata = generateSEOMetadata({
  title: "Dashboard",
  description: "Your learning dashboard",
  noindex: true,
  nofollow: true,
});

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ preview?: string }>;
}) {
  const session = (await getServerSession(authOptions)) as Session;
  if (!session?.user) {
    redirect("/sign-in");
  }

  const resolvedSearchParams = await searchParams;
  const isPreview = resolvedSearchParams?.preview === "true";

  if (session.user.role === "admin" && !isPreview) {
    redirect("/admin");
  }

  const [purchases, recentProgress, certificates] = await Promise.all([
    prisma.purchase.findMany({
      where: { userId: session.user.id, status: "paid" },
      include: {
        Course: {
          include: {
            sections: {
              include: {
                lessons: {
                  select: { id: true },
                },
              },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
      take: 10,
    }),
    prisma.progress.findMany({
      where: { userId: session.user.id },
      include: {
        Lesson: {
          include: {
            Section: {
              include: {
                Course: {
                  select: {
                    title: true,
                    slug: true,
                  },
                },
              },
            },
          },
        },
      },
      orderBy: { updatedAt: "desc" },
      take: 6,
    }),
    prisma.certificate.findMany({
      where: { userId: session.user.id },
      include: {
        Course: {
          select: {
            title: true,
            slug: true,
          },
        },
      },
      orderBy: { issuedAt: "desc" },
      take: 4,
    }),
  ]);

  const allLessonIds = purchases.flatMap((purchase) =>
    purchase.Course.sections.flatMap((section) => section.lessons.map((lesson) => lesson.id))
  );

  const allProgressRecords = allLessonIds.length
    ? await prisma.progress.findMany({
        where: {
          userId: session.user.id,
          lessonId: { in: allLessonIds },
        },
      })
    : [];

  const coursesWithProgress = purchases.map((purchase) => {
    const lessonIds = purchase.Course.sections.flatMap((section) => section.lessons.map((lesson) => lesson.id));
    const lessonIdsSet = new Set(lessonIds);
    const progressRecords = allProgressRecords.filter((progress) => lessonIdsSet.has(progress.lessonId));

    const totalLessons = lessonIds.length;
    const completedLessons = progressRecords.filter((progress) => progress.completedAt != null).length;
    const completionPercent = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;
    const lastAccessed =
      progressRecords.length > 0
        ? progressRecords.sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime())[0].updatedAt
        : null;

    return {
      id: purchase.id,
      courseId: purchase.courseId,
      title: purchase.Course.title,
      slug: purchase.Course.slug,
      totalLessons,
      completedLessons,
      completionPercent,
      lastAccessed,
    };
  });

  const sortedCourses = coursesWithProgress.sort((a, b) => {
    if (!a.lastAccessed) return 1;
    if (!b.lastAccessed) return -1;
    return b.lastAccessed.getTime() - a.lastAccessed.getTime();
  });

  const totalCourses = sortedCourses.length;
  const completedCourses = sortedCourses.filter((course) => course.completionPercent === 100).length;
  const totalLessonsCompleted = sortedCourses.reduce((sum, course) => sum + course.completedLessons, 0);

  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  const recentProgressDates = await prisma.progress.findMany({
    where: {
      userId: session.user.id,
      updatedAt: { gte: thirtyDaysAgo },
    },
    select: { updatedAt: true },
  });
  const learningStreak = new Set(
    recentProgressDates.map((progress) => progress.updatedAt.toISOString().split("T")[0])
  ).size;

  const weekAgo = new Date();
  weekAgo.setDate(weekAgo.getDate() - 7);
  const weekProgress = await prisma.progress.count({
    where: {
      userId: session.user.id,
      updatedAt: { gte: weekAgo },
    },
  });

  const avgCompletionRate = totalCourses
    ? Math.round(sortedCourses.reduce((sum, course) => sum + course.completionPercent, 0) / totalCourses)
    : 0;

  const primaryCourse = sortedCourses.find((course) => course.completionPercent < 100) ?? sortedCourses[0] ?? null;
  const resumeHref = primaryCourse ? `/library/${primaryCourse.slug}` : "/courses";

  return (
    <PageContainer className="space-y-6">
      <Suspense fallback={null}>
        <SubscriptionSuccessToast />
      </Suspense>

      <PageHeader
        title={session.user.name ? `Welcome back, ${session.user.name.split(" ")[0]}` : "Learning Dashboard"}
        description="Track course completion, continue where you left off, and manage your learning outcomes."
        breadcrumbs={[
          { label: "Dashboard" },
        ]}
        actions={
          <>
            <Link href={resumeHref}>
              <Button variant="premium">
                Resume Learning
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
            <Link href="/library">
              <Button variant="outline">My Library</Button>
            </Link>
          </>
        }
      />

      <ContentRegion>
        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <Card className="ui-surface">
            <CardHeader className="pb-2">
              <CardDescription>Total Courses</CardDescription>
              <CardTitle className="text-3xl">{totalCourses}</CardTitle>
            </CardHeader>
            <CardContent className="text-xs text-muted-foreground">
              {completedCourses} completed
            </CardContent>
          </Card>
          <Card className="ui-surface">
            <CardHeader className="pb-2">
              <CardDescription>Lessons Completed</CardDescription>
              <CardTitle className="text-3xl">{totalLessonsCompleted}</CardTitle>
            </CardHeader>
            <CardContent className="text-xs text-muted-foreground">Across your enrolled courses</CardContent>
          </Card>
          <Card className="ui-surface">
            <CardHeader className="pb-2">
              <CardDescription>Learning Streak</CardDescription>
              <CardTitle className="text-3xl">{learningStreak}</CardTitle>
            </CardHeader>
            <CardContent className="text-xs text-muted-foreground">Active days in last 30 days</CardContent>
          </Card>
          <Card className="ui-surface">
            <CardHeader className="pb-2">
              <CardDescription>Average Completion</CardDescription>
              <CardTitle className="text-3xl">{avgCompletionRate}%</CardTitle>
            </CardHeader>
            <CardContent className="text-xs text-muted-foreground">{weekProgress} lessons this week</CardContent>
          </Card>
        </section>

        {sortedCourses.length ? (
          <div className="grid gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
            <Card className="ui-surface">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5" />
                  Course Progress
                </CardTitle>
                <CardDescription>Continue your active learning tracks.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {sortedCourses.slice(0, 6).map((course) => (
                  <div key={course.id} className="rounded-[var(--radius-sm)] border bg-background p-3">
                    <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                      <p className="truncate text-sm font-semibold">{course.title}</p>
                      <Badge variant={course.completionPercent === 100 ? "secondary" : "outline"}>
                        {course.completionPercent}%
                      </Badge>
                    </div>
                    <Progress value={course.completionPercent} className="h-2" />
                    <div className="mt-2 flex flex-wrap items-center justify-between gap-2 text-xs text-muted-foreground">
                      <span>
                        {course.completedLessons} / {course.totalLessons} lessons
                      </span>
                      <Link href={`/library/${course.slug}`}>
                        <Button variant="ghost" size="sm">
                          Open
                        </Button>
                      </Link>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            <div className="grid gap-6">
              <Card className="ui-surface">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="h-5 w-5" />
                    Recent Activity
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {recentProgress.length ? (
                    recentProgress.map((progress) => (
                      <div key={progress.id} className="rounded-[var(--radius-sm)] border bg-background p-3 text-xs">
                        <p className="font-semibold">{progress.Lesson.title}</p>
                        <p className="text-muted-foreground">{progress.Lesson.Section.Course.title}</p>
                        <p className="mt-1 inline-flex items-center gap-1 text-muted-foreground">
                          <CalendarDays className="h-3.5 w-3.5" />
                          {new Date(progress.updatedAt).toLocaleDateString()}
                        </p>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-muted-foreground">No recent activity.</p>
                  )}
                </CardContent>
              </Card>

              <Card className="ui-surface">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Award className="h-5 w-5" />
                    Certificates
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {certificates.length ? (
                    certificates.map((certificate) => (
                      <div
                        key={certificate.id}
                        className="rounded-[var(--radius-sm)] border bg-background p-3"
                      >
                        <p className="text-sm font-semibold">{certificate.Course?.title || "Certificate"}</p>
                        <p className="text-xs text-muted-foreground">
                          Issued {new Date(certificate.issuedAt).toLocaleDateString()}
                        </p>
                        <div className="mt-2">
                          <CertificateViewButton certificateId={certificate.id} />
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-muted-foreground">No certificates issued yet.</p>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        ) : null}
      </ContentRegion>

      <StatusRegion>
        {(totalLessonsCompleted > 0 || completedCourses > 0) ? (
          <Card className="ui-surface">
            <CardContent className="flex flex-wrap items-center justify-between gap-3 p-4">
              <div className="space-y-1 text-sm">
                <p className="inline-flex items-center gap-2 font-semibold">
                  <Flame className="h-4 w-4" />
                  Keep certificates in sync
                </p>
                <p className="text-muted-foreground">
                  If you completed lessons recently, run sync to update missing certificates.
                </p>
              </div>
              <CertificateSyncButton />
            </CardContent>
          </Card>
        ) : null}

        {totalCourses === 0 ? (
          <EmptyState
            icon={<CheckCircle2 className="h-6 w-6" />}
            title="No enrolled courses yet"
            description="Browse the catalog to enroll and start tracking progress from your dashboard."
            action={
              <Link href="/courses">
                <Button variant="premium">Browse Courses</Button>
              </Link>
            }
          />
        ) : null}

        {totalCourses > 0 ? (
          <Card className="ui-surface">
            <CardContent className="flex flex-wrap items-center justify-between gap-3 p-4 text-sm">
              <span className="inline-flex items-center gap-2 text-muted-foreground">
                <Clock3 className="h-4 w-4" />
                Continue daily to keep your momentum.
              </span>
              <Link href="/activity">
                <Button variant="ghost" size="sm">
                  View Full Activity
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : null}
      </StatusRegion>
    </PageContainer>
  );
}

