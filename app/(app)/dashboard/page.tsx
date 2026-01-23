import { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { 
  BookOpen, 
  Activity, 
  TrendingUp, 
  Clock, 
  Award,
  PlayCircle,
  CheckCircle2,
  Target,
  Sparkles
} from "lucide-react";
import { generateMetadata as generateSEOMetadata } from "@/lib/seo";

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
        course: {
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
        lesson: {
          include: {
            section: {
              include: {
                course: {
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
        course: {
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
        course: {
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
  const coursesWithProgress = await Promise.all(
    purchases.map(async (purchase) => {
      const lessonIds = purchase.course.sections.flatMap(s => s.lessons.map(l => l.id));
      const progressRecords = await prisma.progress.findMany({
        where: {
          userId: session.user.id,
          lessonId: { in: lessonIds }
        }
      });

      const totalLessons = lessonIds.length;
      const completedLessons = progressRecords.filter(p => p.completedAt !== null).length;
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
    })
  );

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

  return (
    <div className="space-y-6 sm:space-y-8">
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
        <Card>
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

        <Card>
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

        <Card>
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

        <Card>
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

      {/* Continue Learning Section */}
      {sortedCourses.length > 0 && (
        <Card>
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
                        {course.course.title}
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
                  <Link href={`/library/${course.course.slug}`} className="w-full sm:w-auto">
                    <Button className="w-full sm:w-auto" size="sm">
                      {course.completionPercent === 0 ? "Start" : "Continue"}
                    </Button>
                  </Link>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
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
                      {progress.lesson.title}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">
                      {progress.lesson.section.course.title}
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
                    {cert.course.title}
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
