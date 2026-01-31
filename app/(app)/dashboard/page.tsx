import { Metadata } from "next";
import { Suspense } from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { SubscriptionSuccessToast } from "@/components/checkout/SubscriptionSuccessToast";
import { CertificateViewButton } from "@/components/dashboard/CertificateViewButton";
import { CertificateSyncButton } from "@/components/dashboard/CertificateSyncButton";
import { 
  BookOpen, 
  Activity, 
  TrendingUp, 
  Clock, 
  Award,
  PlayCircle,
  CheckCircle2,
  Target,
  Sparkles,
  Calendar,
  Flame,
  BarChart3,
  Trophy
} from "lucide-react";
import { generateMetadata as generateSEOMetadata } from "@/lib/seo";
import { cn } from "@/lib/utils";

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
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    redirect("/sign-in");
  }

  const resolvedSearchParams = await searchParams;
  const isPreview = resolvedSearchParams?.preview === "true";

  // Redirect admins to admin dashboard unless in preview mode
  if (session.user.role === "admin" && !isPreview) {
    redirect("/admin");
  }

  // Fetch comprehensive dashboard data
  const [
    purchases,
    recentProgress,
    totalProgress,
    certificates,
    enrollments
  ] = await Promise.all([
    // Get purchased courses with progress
    prisma.purchase.findMany({
      where: { userId: session.user.id, status: "paid" },
      include: {
        Course: {
          include: {
            sections: {
              include: {
                lessons: {
                  select: { id: true }
                }
              }
            }
          }
        }
      },
      orderBy: { createdAt: "desc" },
      take: 10
    }),
    // Get recent progress
    prisma.progress.findMany({
      where: { userId: session.user.id },
      include: {
        Lesson: {
          include: {
            Section: {
              include: {
                Course: {
                  select: {
                    id: true,
                    title: true,
                    slug: true
                  }
                }
              }
            }
          }
        }
      },
      orderBy: { updatedAt: "desc" },
      take: 5
    }),
    // Get total progress count
    prisma.progress.count({
      where: { userId: session.user.id }
    }),
    // Get certificates
    prisma.certificate.findMany({
      where: { userId: session.user.id },
      include: {
        Course: {
          select: {
            title: true,
            slug: true
          }
        }
      },
      orderBy: { issuedAt: "desc" },
      take: 3
    }),
    // Get enrollments
    prisma.enrollment.findMany({
      where: { userId: session.user.id },
      include: {
        Course: {
          select: {
            id: true,
            title: true,
            slug: true
          }
        }
      }
    })
  ]);

  // Calculate course progress for each purchased course
  const allLessonIds = purchases.flatMap((purchase: any) =>
    purchase.Course.sections.flatMap((s: any) => s.lessons.map((l: any) => l.id))
  );

  const allProgressRecords = await prisma.progress.findMany({
    where: {
      userId: session.user.id,
      lessonId: { in: allLessonIds }
    }
  });

  const coursesWithProgress = purchases.map((purchase: any) => {
    const lessonIds = purchase.Course.sections.flatMap((s: any) => s.lessons.map((l: any) => l.id));
    const lessonIdsSet = new Set(lessonIds);
    const progressRecords = allProgressRecords.filter((p: any) => lessonIdsSet.has(p.lessonId));

    const totalLessons = lessonIds.length;
    const completedLessons = progressRecords.filter((p: any) => p.completedAt != null).length;
    const inProgressLessons = progressRecords.filter((p: any) => p.startedAt && !p.completedAt).length;
    const completionPercent = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;

    return {
      ...purchase,
      totalLessons,
      completedLessons,
      inProgressLessons,
      completionPercent,
      lastAccessed: progressRecords.length > 0
        ? progressRecords.sort((a: any, b: any) => b.updatedAt.getTime() - a.updatedAt.getTime())[0].updatedAt
        : null
    };
  });

  // Sort by last accessed
  const sortedCourses = coursesWithProgress.sort((a: any, b: any) => {
    if (!a.lastAccessed) return 1;
    if (!b.lastAccessed) return -1;
    return b.lastAccessed.getTime() - a.lastAccessed.getTime();
  });

  // Calculate stats
  const totalCourses = purchases.length;
  const completedCourses = coursesWithProgress.filter((c: any) => c.completionPercent === 100).length;
  const inProgressCourses = coursesWithProgress.filter((c: any) => c.completionPercent > 0 && c.completionPercent < 100).length;
  const totalLessonsCompleted = coursesWithProgress.reduce((sum: number, c: any) => sum + c.completedLessons, 0);

  // Calculate learning streak (days with activity in last 30 days)
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  
  const recentProgressDates = await prisma.progress.findMany({
    where: {
      userId: session.user.id,
      updatedAt: { gte: thirtyDaysAgo }
    },
    select: { updatedAt: true }
  });

  const uniqueDays = new Set(
    recentProgressDates.map((p: any) => p.updatedAt.toISOString().split('T')[0])
  );
  const learningStreak = uniqueDays.size;

  // Calculate average completion rate
  const avgCompletionRate = totalCourses > 0 
    ? Math.round(coursesWithProgress.reduce((sum: number, c: any) => sum + c.completionPercent, 0) / totalCourses)
    : 0;

  // Get this week's activity
  const weekAgo = new Date();
  weekAgo.setDate(weekAgo.getDate() - 7);
  
  const weekProgress = await prisma.progress.count({
    where: {
      userId: session.user.id,
      updatedAt: { gte: weekAgo }
    }
  });

  // Calculate total learning time estimate (5 min per lesson completed)
  const estimatedMinutes = totalLessonsCompleted * 5;
  const learningHours = Math.floor(estimatedMinutes / 60);
  const learningMinutes = estimatedMinutes % 60;

  return (
    <div className="space-y-6 sm:space-y-8 pb-8">
      <Suspense fallback={null}>
        <SubscriptionSuccessToast />
      </Suspense>
      {/* Welcome Section */}
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
          Welcome Back
        </p>
        <h1 className="mt-2 font-display text-3xl sm:text-4xl font-bold tracking-tight">
          {session.user.name ? `Hi, ${session.user.name.split(' ')[0]}!` : 'Your Learning Dashboard'}
        </h1>
        <p className="mt-2 text-base sm:text-lg text-muted-foreground">
          Track your progress and continue your AI learning journey.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 sm:gap-6 grid-cols-2 lg:grid-cols-4">
        <Card className="hover:shadow-lg transition-shadow border-l-4 border-l-blue-500 dark:border-l-blue-400">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs sm:text-sm font-semibold text-foreground">
              Total Courses
            </CardTitle>
            <BookOpen className="h-4 w-4 text-blue-600 dark:text-blue-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl sm:text-3xl font-bold text-foreground">{totalCourses}</div>
            <p className="text-xs text-foreground/60 dark:text-muted-foreground mt-1 font-medium">
              {completedCourses} completed
            </p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow border-l-4 border-l-amber-500 dark:border-l-amber-400">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs sm:text-sm font-semibold text-foreground">
              In Progress
            </CardTitle>
            <PlayCircle className="h-4 w-4 text-amber-600 dark:text-amber-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl sm:text-3xl font-bold text-foreground">{inProgressCourses}</div>
            <p className="text-xs text-foreground/60 dark:text-muted-foreground mt-1 font-medium">
              Active courses
            </p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow border-l-4 border-l-green-500 dark:border-l-green-400">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs sm:text-sm font-semibold text-foreground">
              Lessons Done
            </CardTitle>
            <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl sm:text-3xl font-bold text-foreground">{totalLessonsCompleted}</div>
            <p className="text-xs text-foreground/60 dark:text-muted-foreground mt-1 font-medium">
              Total completed
            </p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow border-l-4 border-l-purple-500 dark:border-l-purple-400">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs sm:text-sm font-semibold text-foreground">
              Certificates
            </CardTitle>
            <Award className="h-4 w-4 text-purple-600 dark:text-purple-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl sm:text-3xl font-bold text-foreground">{certificates.length}</div>
            <p className="text-xs text-foreground/60 dark:text-muted-foreground mt-1 font-medium">
              Earned
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Learning Analytics */}
      {totalCourses > 0 && (
        <div className="grid gap-4 sm:gap-6 md:grid-cols-2 lg:grid-cols-4">
          <Card className="hover:shadow-lg transition-shadow border-l-4 border-l-orange-500 dark:border-l-orange-400">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xs sm:text-sm font-semibold text-foreground">
                Learning Streak
              </CardTitle>
              <Flame className="h-4 w-4 text-orange-600 dark:text-orange-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl sm:text-3xl font-bold text-foreground">
                {learningStreak}
              </div>
              <p className="text-xs text-foreground/60 dark:text-muted-foreground mt-1 font-medium">
                Active days (30d)
              </p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow border-l-4 border-l-blue-500 dark:border-l-blue-400">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xs sm:text-sm font-semibold text-foreground">
                This Week
              </CardTitle>
              <Calendar className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl sm:text-3xl font-bold text-foreground">
                {weekProgress}
              </div>
              <p className="text-xs text-foreground/60 dark:text-muted-foreground mt-1 font-medium">
                Lessons accessed
              </p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow border-l-4 border-l-green-500 dark:border-l-green-400">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xs sm:text-sm font-semibold text-foreground">
                Avg Progress
              </CardTitle>
              <BarChart3 className="h-4 w-4 text-green-600 dark:text-green-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl sm:text-3xl font-bold text-foreground">
                {avgCompletionRate}%
              </div>
              <p className="text-xs text-foreground/60 dark:text-muted-foreground mt-1 font-medium">
                Course completion
              </p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow border-l-4 border-l-purple-500 dark:border-l-purple-400">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xs sm:text-sm font-semibold text-foreground">
                Learning Time
              </CardTitle>
              <Clock className="h-4 w-4 text-purple-600 dark:text-purple-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl sm:text-3xl font-bold text-foreground">
                {learningHours}h {learningMinutes}m
              </div>
              <p className="text-xs text-foreground/60 dark:text-muted-foreground mt-1 font-medium">
                Estimated total
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Continue Learning Section */}
      {sortedCourses.length > 0 && (
        <div className="grid gap-4 sm:gap-6 lg:grid-cols-3">
          <Card className="lg:col-span-2">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2 text-foreground">
                    <Target className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                    Continue Learning
                  </CardTitle>
                  <CardDescription className="text-foreground/60 dark:text-muted-foreground font-medium">
                    Pick up where you left off
                  </CardDescription>
                </div>
                <Link href="/library">
                  <Button variant="outline" size="sm">
                    View All
                  </Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {sortedCourses.slice(0, 3).map((course: any) => (
                  <div
                    key={course.id}
                    className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 p-3 sm:p-4 rounded-lg border hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <h3 className="font-semibold text-sm sm:text-base truncate text-foreground">
                          {course.Course.title}
                        </h3>
                        <Badge variant={course.completionPercent === 100 ? "default" : "secondary"} className="flex-shrink-0 font-semibold">
                          {course.completionPercent}%
                        </Badge>
                      </div>
                      <Progress value={course.completionPercent} className="h-2 mb-2" />
                      <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-xs text-foreground/70 dark:text-muted-foreground font-medium">
                        <span>{course.completedLessons} / {course.totalLessons} lessons</span>
                        {course.lastAccessed && (
                          <>
                            <span>•</span>
                            <span className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {new Date(course.lastAccessed).toLocaleDateString()}
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                    <Link href={`/library/${course.Course.slug}`} className="w-full sm:w-auto">
                      <Button className="w-full sm:w-auto" size="sm">
                        {course.completionPercent === 0 ? "Start" : "Continue"}
                      </Button>
                    </Link>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Quick Achievements */}
          <Card className="border-l-4 border-l-amber-500 dark:border-l-amber-400">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-foreground font-semibold">
                <Trophy className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                Achievements
              </CardTitle>
              <CardDescription className="text-foreground/60 dark:text-muted-foreground font-medium">
                Your milestones
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {completedCourses > 0 && (
                <div className="flex items-start gap-3 p-4 rounded-lg border border-amber-200 dark:border-amber-900/50 bg-amber-50/50 dark:bg-amber-950/10 hover:bg-amber-100/50 dark:hover:bg-amber-900/20 transition-colors">
                  <div className="h-10 w-10 rounded-full bg-amber-500 flex items-center justify-center flex-shrink-0 shadow-md">
                    <Trophy className="h-5 w-5 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm text-foreground">
                      Course Completer
                    </p>
                    <p className="text-xs text-foreground/70 dark:text-muted-foreground font-medium mt-1">
                      Completed {completedCourses} {completedCourses === 1 ? 'course' : 'courses'}
                    </p>
                  </div>
                </div>
              )}
              {learningStreak >= 7 && (
                <div className="flex items-start gap-3 p-4 rounded-lg border border-orange-200 dark:border-orange-900/50 bg-orange-50/50 dark:bg-orange-950/10 hover:bg-orange-100/50 dark:hover:bg-orange-900/20 transition-colors">
                  <div className="h-10 w-10 rounded-full bg-orange-500 flex items-center justify-center flex-shrink-0 shadow-md">
                    <Flame className="h-5 w-5 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm text-foreground">
                      On Fire!
                    </p>
                    <p className="text-xs text-foreground/70 dark:text-muted-foreground font-medium mt-1">
                      {learningStreak} day learning streak
                    </p>
                  </div>
                </div>
              )}
              {totalLessonsCompleted >= 10 && (
                <div className="flex items-start gap-3 p-4 rounded-lg border border-green-200 dark:border-green-900/50 bg-green-50/50 dark:bg-green-950/10 hover:bg-green-100/50 dark:hover:bg-green-900/20 transition-colors">
                  <div className="h-10 w-10 rounded-full bg-green-500 flex items-center justify-center flex-shrink-0 shadow-md">
                    <CheckCircle2 className="h-5 w-5 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm text-foreground">
                      Dedicated Learner
                    </p>
                    <p className="text-xs text-foreground/70 dark:text-muted-foreground font-medium mt-1">
                      {totalLessonsCompleted} lessons completed
                    </p>
                  </div>
                </div>
              )}
              {certificates.length > 0 && (
                <div className="flex items-start gap-3 p-4 rounded-lg border border-blue-200 dark:border-blue-900/50 bg-blue-50/50 dark:bg-blue-950/10 hover:bg-blue-100/50 dark:hover:bg-blue-900/20 transition-colors">
                  <div className="h-10 w-10 rounded-full bg-blue-500 flex items-center justify-center flex-shrink-0 shadow-md">
                    <Award className="h-5 w-5 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm text-foreground">
                      Certified
                    </p>
                    <p className="text-xs text-foreground/70 dark:text-muted-foreground font-medium mt-1">
                      Earned {certificates.length} {certificates.length === 1 ? 'certificate' : 'certificates'}
                    </p>
                  </div>
                </div>
              )}
              {totalCourses > 0 && completedCourses === 0 && learningStreak < 7 && totalLessonsCompleted < 10 && certificates.length === 0 && (
                <div className="text-center py-6 px-4 rounded-lg border border-dashed border-foreground/20">
                  <Sparkles className="h-8 w-8 mx-auto text-amber-600 dark:text-amber-400 mb-2" />
                  <p className="text-sm font-medium text-foreground">
                    Keep learning to unlock achievements!
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Recent Activity */}
      {recentProgress.length > 0 && (
        <Card className="border-l-4 border-l-purple-500 dark:border-l-purple-400">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-foreground font-semibold">
              <Activity className="h-5 w-5 text-purple-600 dark:text-purple-400" />
              Recent Activity
            </CardTitle>
            <CardDescription className="text-foreground/60 dark:text-muted-foreground font-medium">
              Your latest learning sessions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentProgress.map((progress: any) => (
                <div
                  key={progress.id}
                  className="flex items-start gap-3 p-3 rounded-lg border"
                >
                  <div className={cn(
                    "h-8 w-8 rounded-full flex items-center justify-center flex-shrink-0",
                    progress.completedAt ? "bg-green-500/10" : "bg-blue-500/10"
                  )}>
                    {progress.completedAt ? (
                      <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />
                    ) : (
                      <PlayCircle className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate text-foreground">
                      {progress.Lesson.title}
                    </p>
                    <p className="text-xs text-foreground/60 dark:text-muted-foreground truncate font-medium">
                      {progress.Lesson.Section.Course.title}
                    </p>
                    <p className="text-xs text-foreground/60 dark:text-muted-foreground mt-1 font-medium">
                      {progress.completedAt ? "Completed" : `${progress.completionPercent}% complete`} • {new Date(progress.updatedAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Certificates */}
      {certificates.length > 0 && (
        <Card className="border-0 bg-gradient-to-br from-blue-50/50 to-indigo-50/50 dark:from-blue-950/20 dark:to-indigo-950/20 shadow-lg">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center shadow-lg">
                  <Award className="h-6 w-6 text-white" />
                </div>
                <div>
                  <CardTitle className="text-xl font-bold text-foreground">
                    Your Certificates
                  </CardTitle>
                  <CardDescription className="text-sm text-muted-foreground font-medium mt-1">
                    Professional achievements you've earned
                  </CardDescription>
                </div>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{certificates.length}</div>
                <div className="text-xs text-muted-foreground font-medium">Total Earned</div>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {certificates.map((cert: any) => (
              <div key={cert.id} className="group relative overflow-hidden rounded-xl border border-blue-200/50 dark:border-blue-800/50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm hover:shadow-lg transition-all duration-300 hover:border-blue-300/50 dark:hover:border-blue-700/50">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-indigo-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <div className="relative p-6">
                  <div className="flex items-start gap-4">
                    <div className="h-14 w-14 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center flex-shrink-0 shadow-lg group-hover:scale-105 transition-transform duration-300">
                      <Award className="h-7 w-7 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-lg text-foreground mb-2 line-clamp-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-200">
                        {cert.Course?.title || 'Certificate'}
                      </h3>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground font-medium mb-4">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          Issued {new Date(cert.issuedAt).toLocaleDateString()}
                        </div>
                        <div className="flex items-center gap-1">
                          <CheckCircle2 className="h-4 w-4 text-green-500" />
                          Verified
                        </div>
                      </div>
                      <div className="flex gap-3">
                        <CertificateViewButton certificateId={cert.id} />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Certificate Sync - for users who might have completed courses but no certificates */}
      {(completedCourses > 0 || totalLessonsCompleted > 0) && (
        <Card className="border-0 bg-gradient-to-br from-amber-50/50 to-orange-50/50 dark:from-amber-950/20 dark:to-orange-950/20 shadow-lg">
          <CardContent className="pt-6">
            <div className="flex flex-col sm:flex-row items-center gap-4 text-center sm:text-left">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center shadow-lg">
                  <Award className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h4 className="font-bold text-lg text-foreground">Missing Certificates?</h4>
                  <p className="text-sm text-muted-foreground font-medium">
                    If you've completed courses but don't see certificates, sync them now.
                  </p>
                </div>
              </div>
              <CertificateSyncButton />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Empty State */}
      {totalCourses === 0 && (
        <Card>
          <CardContent className="py-12 text-center">
            <Sparkles className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">Start Your Learning Journey</h3>
            <p className="text-foreground/60 dark:text-muted-foreground mb-6 max-w-md mx-auto font-medium">
              You haven't enrolled in any courses yet. Browse our catalog to find the perfect course for you.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link href="/courses">
                <Button size="lg">
                  Browse Courses
                </Button>
              </Link>
              <Link href="/learning-paths">
                <Button variant="outline" size="lg">
                  View Learning Paths
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
