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
  const allLessonIds = purchases.flatMap(purchase =>
    purchase.Course.sections.flatMap(s => s.lessons.map(l => l.id))
  );

  const allProgressRecords = await prisma.progress.findMany({
    where: {
      userId: session.user.id,
      lessonId: { in: allLessonIds }
    }
  });

  const coursesWithProgress = purchases.map((purchase) => {
    const lessonIds = purchase.Course.sections.flatMap(s => s.lessons.map(l => l.id));
    const lessonIdsSet = new Set(lessonIds);
    const progressRecords = allProgressRecords.filter(p => lessonIdsSet.has(p.lessonId));

    const totalLessons = lessonIds.length;
    const completedLessons = progressRecords.filter(p => p.completedAt != null).length;
    const inProgressLessons = progressRecords.filter(p => p.startedAt && !p.completedAt).length;
    const completionPercent = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;

    return {
      ...purchase,
      totalLessons,
      completedLessons,
      inProgressLessons,
      completionPercent,
      lastAccessed: progressRecords.length > 0
        ? progressRecords.sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime())[0].updatedAt
        : null
    };
  });

  // Sort by last accessed
  const sortedCourses = coursesWithProgress.sort((a, b) => {
    if (!a.lastAccessed) return 1;
    if (!b.lastAccessed) return -1;
    return b.lastAccessed.getTime() - a.lastAccessed.getTime();
  });

  // Calculate stats
  const totalCourses = purchases.length;
  const completedCourses = coursesWithProgress.filter(c => c.completionPercent === 100).length;
  const inProgressCourses = coursesWithProgress.filter(c => c.completionPercent > 0 && c.completionPercent < 100).length;
  const totalLessonsCompleted = coursesWithProgress.reduce((sum, c) => sum + c.completedLessons, 0);

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
    recentProgressDates.map(p => p.updatedAt.toISOString().split('T')[0])
  );
  const learningStreak = uniqueDays.size;

  // Calculate average completion rate
  const avgCompletionRate = totalCourses > 0 
    ? Math.round(coursesWithProgress.reduce((sum, c) => sum + c.completionPercent, 0) / totalCourses)
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
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium">
              Total Courses
            </CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl sm:text-3xl font-bold">{totalCourses}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {completedCourses} completed
            </p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium">
              In Progress
            </CardTitle>
            <PlayCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl sm:text-3xl font-bold">{inProgressCourses}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Active courses
            </p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium">
              Lessons Done
            </CardTitle>
            <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl sm:text-3xl font-bold">{totalLessonsCompleted}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Total completed
            </p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium">
              Certificates
            </CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl sm:text-3xl font-bold">{certificates.length}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Earned
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Learning Analytics */}
      {totalCourses > 0 && (
        <div className="grid gap-4 sm:gap-6 md:grid-cols-2 lg:grid-cols-4">
          <Card className="bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-950/20 dark:to-amber-950/20 border-orange-200 dark:border-orange-900">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xs sm:text-sm font-medium text-orange-900 dark:text-orange-100">
                Learning Streak
              </CardTitle>
              <Flame className="h-4 w-4 text-orange-600 dark:text-orange-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl sm:text-3xl font-bold text-orange-800 dark:text-orange-300">
                {learningStreak}
              </div>
              <p className="text-xs text-orange-700 dark:text-orange-400/80 mt-1">
                Active days (30d)
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-950/20 dark:to-cyan-950/20 border-blue-200 dark:border-blue-900">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xs sm:text-sm font-medium text-blue-900 dark:text-blue-100">
                This Week
              </CardTitle>
              <Calendar className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl sm:text-3xl font-bold text-blue-800 dark:text-blue-300">
                {weekProgress}
              </div>
              <p className="text-xs text-blue-700 dark:text-blue-400/80 mt-1">
                Lessons accessed
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 border-green-200 dark:border-green-900">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xs sm:text-sm font-medium text-green-900 dark:text-green-100">
                Avg Progress
              </CardTitle>
              <BarChart3 className="h-4 w-4 text-green-600 dark:text-green-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl sm:text-3xl font-bold text-green-800 dark:text-green-300">
                {avgCompletionRate}%
              </div>
              <p className="text-xs text-green-700 dark:text-green-400/80 mt-1">
                Course completion
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20 border-purple-200 dark:border-purple-900">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xs sm:text-sm font-medium text-purple-900 dark:text-purple-100">
                Learning Time
              </CardTitle>
              <Clock className="h-4 w-4 text-purple-600 dark:text-purple-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl sm:text-3xl font-bold text-purple-800 dark:text-purple-300">
                {learningHours}h {learningMinutes}m
              </div>
              <p className="text-xs text-purple-700 dark:text-purple-400/80 mt-1">
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
                  <CardTitle className="flex items-center gap-2">
                    <Target className="h-5 w-5" />
                    Continue Learning
                  </CardTitle>
                  <CardDescription>
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
                {sortedCourses.slice(0, 3).map((course) => (
                  <div
                    key={course.id}
                    className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 p-3 sm:p-4 rounded-lg border hover:bg-accent/50 transition-colors"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <h3 className="font-semibold text-sm sm:text-base truncate">
                          {course.Course.title}
                        </h3>
                        <Badge variant={course.completionPercent === 100 ? "default" : "secondary"} className="flex-shrink-0">
                          {course.completionPercent}%
                        </Badge>
                      </div>
                      <Progress value={course.completionPercent} className="h-2 mb-2" />
                      <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-xs text-muted-foreground">
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
          <Card className="bg-gradient-to-br from-amber-50 to-yellow-50 dark:from-amber-950/20 dark:to-yellow-950/20 border-amber-200 dark:border-amber-900">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-amber-900 dark:text-amber-100">
                <Trophy className="h-5 w-5 text-amber-700 dark:text-amber-400" />
                Achievements
              </CardTitle>
              <CardDescription className="text-amber-800 dark:text-amber-300/80">
                Your milestones
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {completedCourses > 0 && (
                <div className="flex items-start gap-3 p-3 rounded-lg bg-white/50 dark:bg-black/20">
                  <div className="h-10 w-10 rounded-full bg-amber-500 flex items-center justify-center flex-shrink-0">
                    <Trophy className="h-5 w-5 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm text-amber-900 dark:text-amber-100">
                      Course Completer
                    </p>
                    <p className="text-xs text-amber-800 dark:text-amber-300/80">
                      Completed {completedCourses} {completedCourses === 1 ? 'course' : 'courses'}
                    </p>
                  </div>
                </div>
              )}
              {learningStreak >= 7 && (
                <div className="flex items-start gap-3 p-3 rounded-lg bg-white/50 dark:bg-black/20">
                  <div className="h-10 w-10 rounded-full bg-orange-500 flex items-center justify-center flex-shrink-0">
                    <Flame className="h-5 w-5 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm text-amber-900 dark:text-amber-100">
                      On Fire!
                    </p>
                    <p className="text-xs text-amber-800 dark:text-amber-300/80">
                      {learningStreak} day learning streak
                    </p>
                  </div>
                </div>
              )}
              {totalLessonsCompleted >= 10 && (
                <div className="flex items-start gap-3 p-3 rounded-lg bg-white/50 dark:bg-black/20">
                  <div className="h-10 w-10 rounded-full bg-green-500 flex items-center justify-center flex-shrink-0">
                    <CheckCircle2 className="h-5 w-5 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm text-amber-900 dark:text-amber-100">
                      Dedicated Learner
                    </p>
                    <p className="text-xs text-amber-800 dark:text-amber-300/80">
                      {totalLessonsCompleted} lessons completed
                    </p>
                  </div>
                </div>
              )}
              {certificates.length > 0 && (
                <div className="flex items-start gap-3 p-3 rounded-lg bg-white/50 dark:bg-black/20">
                  <div className="h-10 w-10 rounded-full bg-blue-500 flex items-center justify-center flex-shrink-0">
                    <Award className="h-5 w-5 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm text-amber-900 dark:text-amber-100">
                      Certified
                    </p>
                    <p className="text-xs text-amber-800 dark:text-amber-300/80">
                      Earned {certificates.length} {certificates.length === 1 ? 'certificate' : 'certificates'}
                    </p>
                  </div>
                </div>
              )}
              {totalCourses > 0 && completedCourses === 0 && learningStreak < 7 && totalLessonsCompleted < 10 && certificates.length === 0 && (
                <div className="text-center py-4">
                  <Sparkles className="h-8 w-8 mx-auto text-amber-600 dark:text-amber-500 mb-2" />
                  <p className="text-sm text-amber-800 dark:text-amber-300">
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
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Recent Activity
            </CardTitle>
            <CardDescription>
              Your latest learning sessions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentProgress.map((progress) => (
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
                    <p className="font-medium text-sm truncate">
                      {progress.Lesson.title}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">
                      {progress.Lesson.Section.Course.title}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
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
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Award className="h-5 w-5" />
                  Your Certificates
                </CardTitle>
                <CardDescription>
                  Achievements you've earned
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {certificates.map((cert) => (
                <div
                  key={cert.id}
                  className="p-4 rounded-lg border bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/20 dark:to-orange-950/20"
                >
                  <Award className="h-8 w-8 text-amber-600 dark:text-amber-400 mb-2" />
                  <h3 className="font-semibold text-sm mb-1 line-clamp-2">
                    {cert.Course?.title || 'Certificate'}
                  </h3>
                  <p className="text-xs text-muted-foreground mb-3">
                    Issued {new Date(cert.issuedAt).toLocaleDateString()}
                  </p>
                  <Link href={`/certificates/${cert.id}`}>
                    <Button variant="outline" size="sm" className="w-full">
                      View Certificate
                    </Button>
                  </Link>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Empty State */}
      {totalCourses === 0 && (
        <Card>
          <CardContent className="py-12 text-center">
            <Sparkles className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Start Your Learning Journey</h3>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
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
