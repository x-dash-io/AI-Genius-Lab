import { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getServerSession } from "next-auth";
import { type ReactNode } from "react";
import { ArrowLeft, Award, BookOpen, CheckCircle2, Lock, Sparkles, Zap } from "lucide-react";
import { authOptions } from "@/lib/auth";
import {
  calculateLearningPathPrice,
  createLearningPathPurchases,
  getLearningPathBySlug,
  getLearningPathProgress,
  hasCompletedLearningPath,
  hasEnrolledInLearningPath,
} from "@/lib/learning-paths";
import { getUserSubscription } from "@/lib/subscriptions";
import { createPayPalOrder } from "@/lib/paypal";
import { prisma } from "@/lib/prisma";
import { generateMetadata as generateSEOMetadata } from "@/lib/seo";
import { generateLearningPathSchema } from "@/lib/seo/schemas";
import { LearningPathEnrollment } from "@/components/learning-paths/LearningPathEnrollment";
import { PathProgressSection } from "@/components/learning-paths/PathProgressSection";
import { PathObjectivesSection } from "@/components/learning-paths/PathObjectivesSection";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import {
  ContentRegion,
  PageContainer,
  PageHeader,
  StatusRegion,
} from "@/components/layout/shell";

export const dynamic = "force-dynamic";

type LearningPathDetailPageProps = {
  params: Promise<{ pathId: string }>;
};

export async function generateMetadata({
  params,
}: LearningPathDetailPageProps): Promise<Metadata> {
  const { pathId } = await params;
  const path = await getLearningPathBySlug(pathId);

  if (!path) {
    return generateSEOMetadata({
      title: "Learning Path Not Found",
      noindex: true,
    });
  }

  return generateSEOMetadata({
    title: path.title,
    description:
      path.description || `Follow this structured learning path to master ${path.title}.`,
    keywords: ["learning path", path.title, "structured learning"],
    url: `/learning-paths/${pathId}`,
    type: "website",
  });
}

function formatPrice(priceCents: number) {
  return `$${(priceCents / 100).toFixed(2)}`;
}

function AccessGateCard({
  title,
  description,
  bullets,
  actions,
}: {
  title: string;
  description: string;
  bullets: string[];
  actions: ReactNode;
}) {
  return (
    <Card className="ui-surface border">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-xl">
          <Lock className="h-5 w-5 text-primary" />
          {title}
        </CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-2">
          {bullets.map((bullet) => (
            <p key={bullet} className="flex items-start gap-2 text-sm text-muted-foreground">
              <CheckCircle2 className="mt-0.5 h-4 w-4 text-success" />
              <span>{bullet}</span>
            </p>
          ))}
        </div>
        <div className="flex flex-wrap gap-2">{actions}</div>
      </CardContent>
    </Card>
  );
}

export default async function LearningPathDetailPage({
  params,
}: LearningPathDetailPageProps) {
  const { pathId } = await params;
  const pathData = await getLearningPathBySlug(pathId);

  if (!pathData) {
    notFound();
  }

  type LearningPathCourse = (typeof pathData.courses)[number];

  const path = {
    ...pathData,
    courses: (pathData.courses || []).map((pathCourse: LearningPathCourse) => ({
      ...pathCourse,
      course: pathCourse.Course,
    })),
  };

  type PathCourse = (typeof path.courses)[number];

  const session = await getServerSession(authOptions);

  let hasAccessToPath = false;
  let userSubscription = null;

  if (session?.user) {
    userSubscription = await getUserSubscription(session.user.id);
    hasAccessToPath = userSubscription?.plan.tier === "founder";
  }

  const isEnrolled =
    session?.user && hasAccessToPath
      ? await hasEnrolledInLearningPath(session.user.id, path.id)
      : false;

  let pathProgress = null;
  let isPathCompleted = false;
  if (session?.user && hasAccessToPath) {
    pathProgress = await getLearningPathProgress(session.user.id, path.id);
    isPathCompleted = await hasCompletedLearningPath(session.user.id, path.id);
  }

  const totalPriceCents = path.courses.reduce(
    (sum: number, pathCourse: PathCourse) => sum + pathCourse.course.priceCents,
    0
  );

  const priceInfo = session?.user
    ? await calculateLearningPathPrice(session.user.id, path.id)
    : {
        fullPriceCents: totalPriceCents,
        adjustedPriceCents: totalPriceCents,
        alreadyPurchasedCents: 0,
        coursesToPurchase: path.courses.length,
        totalCourses: path.courses.length,
      };

  const purchasedCourseIds = session?.user
    ? new Set(
        (
          await prisma.purchase.findMany({
            where: {
              userId: session.user.id,
              courseId: { in: path.courses.map((pathCourse: PathCourse) => pathCourse.course.id) },
              status: "paid",
            },
            select: { courseId: true },
          })
        ).map((purchase) => purchase.courseId)
      )
    : new Set<string>();

  async function enrollInLearningPathAction() {
    "use server";

    const currentSession = await getServerSession(authOptions);
    if (!currentSession?.user) {
      throw new Error("You must be signed in to enroll");
    }

    const currentPath = await getLearningPathBySlug(pathId);
    if (!currentPath) {
      throw new Error("Learning path not found");
    }

    const { purchases, totalAmountCents } = await createLearningPathPurchases(
      currentSession.user.id,
      currentPath.id
    );

    if (!purchases.length) {
      throw new Error("No courses to purchase");
    }

    const purchaseIds = purchases.map((purchase) => purchase.id).join(",");
    const appUrl = process.env.NEXTAUTH_URL ?? "http://localhost:3000";
    const returnUrl = `${appUrl}/api/payments/paypal/capture?purchases=${encodeURIComponent(
      purchaseIds
    )}`;
    const cancelUrl = `${appUrl}/learning-paths/${pathId}?checkout=cancelled`;

    const { orderId, approvalUrl } = await createPayPalOrder({
      amountCents: totalAmountCents,
      currency: "usd",
      returnUrl,
      cancelUrl,
      purchaseId: purchases[0].id,
    });

    await prisma.purchase.updateMany({
      where: {
        id: { in: purchases.map((purchase) => purchase.id) },
      },
      data: {
        providerRef: orderId,
      },
    });

    return {
      orderId,
      approvalUrl,
    };
  }

  const learningPathSchema = generateLearningPathSchema({
    name: path.title,
    description:
      path.description || `Follow this structured learning path to master ${path.title}.`,
    url: `/learning-paths/${pathId}`,
    courses: path.courses.map((pathCourse: PathCourse) => ({
      name: pathCourse.course.title,
      url: `/courses/${pathCourse.course.slug}`,
    })),
  });

  const baseBreadcrumbs = [
    { label: "Home", href: "/" },
    { label: "Learning Paths", href: "/learning-paths" },
    { label: path.title },
  ];

  type LearningPathDetails = {
    estimatedHours?: number;
    objectives?: string[];
    skills?: string[];
    targetAudience?: string;
    prerequisites?: string;
  };
  const pathDetails = pathData as typeof pathData & LearningPathDetails;
  const estimatedHours = pathDetails.estimatedHours;
  const objectives = pathDetails.objectives;
  const skills = pathDetails.skills;
  const targetAudience = pathDetails.targetAudience;
  const prerequisites = pathDetails.prerequisites;
  const hasObjectivesData = Boolean(
    objectives?.length || skills?.length || targetAudience || prerequisites || estimatedHours
  );

  if (!session?.user) {
    return (
      <PageContainer className="space-y-6">
        <PageHeader
          title={path.title}
          description={
            path.description ||
            "This path bundles multiple courses into a guided progression from first lesson to completion."
          }
          breadcrumbs={baseBreadcrumbs}
          actions={
            <Link href="/learning-paths">
              <Button variant="ghost">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Paths
              </Button>
            </Link>
          }
        />

        <ContentRegion>
          <AccessGateCard
            title="Sign in to unlock this path"
            description="Learning paths are available with Founder-tier subscription access."
            bullets={[
              "Structured path progression across multiple courses",
              "Progress tracking at every course stage",
              "Learning-path completion and certification support",
            ]}
            actions={
              <>
                <Link href={`/sign-in?callbackUrl=${encodeURIComponent(`/learning-paths/${pathId}`)}`}>
                  <Button variant="premium">Sign in</Button>
                </Link>
                <Link href="/pricing">
                  <Button variant="outline">View plans</Button>
                </Link>
              </>
            }
          />
        </ContentRegion>
      </PageContainer>
    );
  }

  if (!hasAccessToPath) {
    return (
      <PageContainer className="space-y-6">
        <PageHeader
          title={path.title}
          description={path.description || "Upgrade to Founder to access this full learning path."}
          breadcrumbs={baseBreadcrumbs}
          actions={
            <Link href="/learning-paths">
              <Button variant="ghost">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Paths
              </Button>
            </Link>
          }
        />

        <ContentRegion>
          <AccessGateCard
            title="Founder plan required"
            description={`Your current plan is ${userSubscription?.plan.name || "Starter"}. Upgrade to unlock learning paths.`}
            bullets={[
              "Includes full access to published learning paths",
              "Supports advanced path milestones and completion flow",
              "Keeps progress and certificates aligned with your account",
            ]}
            actions={
              <>
                <Link href="/pricing">
                  <Button variant="premium">
                    <Zap className="mr-2 h-4 w-4" />
                    Upgrade to Founder
                  </Button>
                </Link>
                <Link href="/learning-paths">
                  <Button variant="outline">Browse other paths</Button>
                </Link>
              </>
            }
          />
        </ContentRegion>
      </PageContainer>
    );
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(learningPathSchema) }}
      />

      <PageContainer className="space-y-6">
        <PageHeader
          title={path.title}
          description={
            path.description ||
            "A guided path to build practical skills in a sequenced, measurable workflow."
          }
          breadcrumbs={baseBreadcrumbs}
          actions={
            <Link href="/learning-paths">
              <Button variant="ghost">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Paths
              </Button>
            </Link>
          }
        />

        <ContentRegion className="lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]">
          <div className="grid gap-6">
            <Card className="ui-surface border">
              <CardHeader>
                <CardTitle className="text-xl">Path overview</CardTitle>
                <CardDescription>
                  Complete each course in sequence to finish the full pathway.
                </CardDescription>
              </CardHeader>
              <CardContent className="grid gap-3 sm:grid-cols-3">
                <div className="rounded-[var(--radius-sm)] border bg-background p-3">
                  <p className="text-xs text-muted-foreground">Courses</p>
                  <p className="mt-1 text-2xl font-semibold">{path.courses.length}</p>
                </div>
                <div className="rounded-[var(--radius-sm)] border bg-background p-3">
                  <p className="text-xs text-muted-foreground">Full path value</p>
                  <p className="mt-1 text-2xl font-semibold">{formatPrice(totalPriceCents)}</p>
                </div>
                <div className="rounded-[var(--radius-sm)] border bg-background p-3">
                  <p className="text-xs text-muted-foreground">Estimated time</p>
                  <p className="mt-1 text-2xl font-semibold">
                    {estimatedHours ? `${estimatedHours}h` : "Self-paced"}
                  </p>
                </div>
              </CardContent>
            </Card>

            {isEnrolled && pathProgress ? (
              <PathProgressSection
                totalCourses={pathProgress.totalCourses}
                completedCount={pathProgress.completedCount}
                inProgressCount={pathProgress.inProgressCount}
                progressPercent={pathProgress.progressPercent}
                estimatedHours={estimatedHours}
                courses={pathProgress.courses}
              />
            ) : null}

            {hasObjectivesData ? (
              <PathObjectivesSection
                objectives={objectives}
                skills={skills}
                targetAudience={targetAudience}
                prerequisites={prerequisites}
                estimatedHours={estimatedHours}
              />
            ) : null}

            {path.courses.length ? (
              <Card className="ui-surface border">
                <CardHeader>
                  <CardTitle className="text-xl">Curriculum</CardTitle>
                  <CardDescription>Courses included in this path.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {path.courses.map((pathCourse: PathCourse, index: number) => (
                    <div
                      key={pathCourse.id}
                      className="rounded-[var(--radius-sm)] border bg-background px-3 py-3"
                    >
                      <div className="flex flex-wrap items-start justify-between gap-2">
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <span className="inline-flex h-6 w-6 items-center justify-center rounded-full border text-xs font-semibold">
                              {index + 1}
                            </span>
                            <p className="truncate text-sm font-semibold">{pathCourse.course.title}</p>
                          </div>
                          <p className="mt-1 text-sm text-muted-foreground">
                            {pathCourse.course.description || "Course description available on detail page."}
                          </p>
                        </div>
                        <div className="flex flex-wrap items-center gap-2">
                          <Badge variant="outline">{formatPrice(pathCourse.course.priceCents)}</Badge>
                          {purchasedCourseIds.has(pathCourse.course.id) ? (
                            <Badge variant="secondary">Owned</Badge>
                          ) : null}
                          <Link href={`/courses/${pathCourse.course.slug}`}>
                            <Button size="sm" variant="ghost">
                              Open
                            </Button>
                          </Link>
                        </div>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            ) : null}
          </div>

          <div className="grid gap-6">
            <Card className="ui-surface border">
              <CardHeader>
                <CardTitle className="text-xl">Enrollment</CardTitle>
                <CardDescription>Pay only for courses you do not already own.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                {priceInfo.alreadyPurchasedCents > 0 ? (
                  <>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Full path value</span>
                      <span className="font-semibold line-through">
                        {formatPrice(priceInfo.fullPriceCents)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Adjusted total</span>
                      <span className="text-lg font-semibold">
                        {formatPrice(priceInfo.adjustedPriceCents)}
                      </span>
                    </div>
                    <p className="rounded-[var(--radius-sm)] border bg-background px-3 py-2 text-xs text-muted-foreground">
                      You already own {formatPrice(priceInfo.alreadyPurchasedCents)} worth of courses.
                    </p>
                  </>
                ) : (
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Total price</span>
                    <span className="text-lg font-semibold">
                      {formatPrice(priceInfo.fullPriceCents)}
                    </span>
                  </div>
                )}

                <div className="pt-2">
                  {isEnrolled ? (
                    <Link href="/library">
                      <Button className="w-full" variant="premium">
                        Go to library
                      </Button>
                    </Link>
                  ) : priceInfo.adjustedPriceCents === 0 ? (
                    <Link href="/library">
                      <Button className="w-full" variant="premium">
                        Continue in library
                      </Button>
                    </Link>
                  ) : (
                    <LearningPathEnrollment
                      pathId={path.id}
                      totalPriceCents={priceInfo.adjustedPriceCents}
                      enrollAction={enrollInLearningPathAction}
                    />
                  )}
                </div>
              </CardContent>
            </Card>

            {isEnrolled && isPathCompleted ? (
              <Card className="ui-surface border">
                <CardHeader>
                  <CardTitle className="text-xl">Path completed</CardTitle>
                  <CardDescription>
                    You completed every course in this learning path.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="text-sm text-muted-foreground">
                    Completion status is ready. Generate your certificate from your profile and certificate pages.
                  </p>
                  <div className="rounded-[var(--radius-sm)] border bg-background px-3 py-2 text-xs text-muted-foreground">
                    <span className="inline-flex items-center gap-1.5">
                      <Award className="h-3.5 w-3.5 text-primary" />
                      Certificates are verifiable and tied to your completion records.
                    </span>
                  </div>
                  <Link href="/profile">
                    <Button className="w-full" variant="outline">
                      Open profile
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ) : (
              <Card className="ui-surface border">
                <CardHeader>
                  <CardTitle className="text-xl">Completion target</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm text-muted-foreground">
                  <p className="inline-flex items-start gap-2">
                    <Sparkles className="mt-0.5 h-4 w-4 text-primary" />
                    Finish all courses in this path to unlock completion recognition.
                  </p>
                  <p className="inline-flex items-start gap-2">
                    <BookOpen className="mt-0.5 h-4 w-4 text-primary" />
                    Progress is tracked automatically as lessons are completed.
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </ContentRegion>

        <StatusRegion>
          {!path.courses.length ? (
            <EmptyState
              icon={<BookOpen className="h-6 w-6" />}
              title="No courses in this path yet"
              description="This path has been created, but course sequencing has not been published yet."
              action={
                <Link href="/learning-paths">
                  <Button variant="outline">Back to learning paths</Button>
                </Link>
              }
            />
          ) : null}
        </StatusRegion>
      </PageContainer>
    </>
  );
}
