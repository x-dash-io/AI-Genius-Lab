import { Metadata } from "next";
import Link from "next/link";
import { redirect, notFound } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getLearningPathBySlug, createLearningPathPurchases, hasEnrolledInLearningPath, calculateLearningPathPrice, getLearningPathProgress, hasCompletedLearningPath } from "@/lib/learning-paths";
import { getUserSubscription } from "@/lib/subscriptions";
import { createPayPalOrder } from "@/lib/paypal";
import { generateLearningPathCertificate } from "@/lib/certificates";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, BookOpen, CheckCircle2, Lock, Zap, Award } from "lucide-react";
import { generateMetadata as generateSEOMetadata } from "@/lib/seo";
import { generateLearningPathSchema } from "@/lib/seo/schemas";
import { LearningPathEnrollment } from "@/components/learning-paths/LearningPathEnrollment";
import { PathProgressSection } from "@/components/learning-paths/PathProgressSection";
import { PathObjectivesSection } from "@/components/learning-paths/PathObjectivesSection";

export const dynamic = "force-dynamic";

type LearningPathDetailPageProps = {
  params: Promise<{ pathId: string }>;
};

export async function generateMetadata({
  params,
}: LearningPathDetailPageProps): Promise<Metadata> {
  const { pathId } = params;
  const path = await getLearningPathBySlug(pathId);

  if (!path) {
    return generateSEOMetadata({
      title: "Learning Path Not Found",
      noindex: true,
    });
  }

  return generateSEOMetadata({
    title: path.title,
    description: path.description || `Follow this structured learning path to master ${path.title}.`,
    keywords: ["learning path", path.title, "structured learning"],
    url: `/learning-paths/${pathId}`,
    type: "website",
  });
}

export default async function LearningPathDetailPage({
  params,
}: LearningPathDetailPageProps) {
  const { pathId } = params;
  const pathData = await getLearningPathBySlug(pathId);

  if (!pathData) {
    notFound();
  }

  // Transform the data to match expected format
  const path = {
    ...pathData,
    courses: (pathData.courses || []).map((lpc: any) => ({
      ...lpc,
      course: lpc.Course,
    })),
  };

  const session = await getServerSession(authOptions);

  // Check if user has access to learning paths (Pro or Elite subscription)
  let hasAccessToPath = false;
  let userSubscription = null;

  if (session?.user) {
    userSubscription = await getUserSubscription(session.user.id);
    hasAccessToPath = userSubscription?.plan.tier === "elite" || false;
  }

  const isEnrolled = session?.user && hasAccessToPath
    ? await hasEnrolledInLearningPath(session.user.id, path.id)
    : false;

  // Get progress if user has access
  let pathProgress = null;
  let isPathCompleted = false;
  if (session?.user && hasAccessToPath) {
    pathProgress = await getLearningPathProgress(session.user.id, path.id);
    isPathCompleted = await hasCompletedLearningPath(session.user.id, path.id);
  }

  const totalPrice = path.courses.reduce(
    (sum: number, pc: any) => sum + pc.course.priceCents,
    0
  );

  // Calculate adjusted price (excluding already purchased courses)
  const priceInfo = session?.user
    ? await calculateLearningPathPrice(session.user.id, path.id)
    : {
      fullPriceCents: totalPrice,
      adjustedPriceCents: totalPrice,
      alreadyPurchasedCents: 0,
      coursesToPurchase: path.courses.length,
      totalCourses: path.courses.length,
    };

  // Get purchased course IDs for UI display
  const purchasedCourseIds = session?.user
    ? new Set(
      (
        await prisma.purchase.findMany({
          where: {
            userId: session.user.id,
            courseId: { in: path.courses.map((pc: any) => pc.course.id) },
            status: "paid",
          },
          select: { courseId: true },
        })
      ).map((p: any) => p.courseId)
    )
    : new Set<string>();

  async function enrollInLearningPathAction() {
    "use server";

    const currentSession = await getServerSession(authOptions);
    if (!currentSession?.user) {
      throw new Error("You must be signed in to enroll");
    }

    // Get path again inside server action since we can't use closure
    const currentPath = await getLearningPathBySlug(pathId);
    if (!currentPath) {
      throw new Error("Learning path not found");
    }

    const { purchases, totalAmountCents } = await createLearningPathPurchases(
      currentSession.user.id,
      currentPath.id
    );

    if (purchases.length === 0) {
      throw new Error("No courses to purchase");
    }

    // Create PayPal order for all purchases
    const purchaseIds = purchases.map((p: any) => p.id).join(",");
    const appUrl = process.env.NEXTAUTH_URL ?? "http://localhost:3000";

    // For multiple purchases, pass them as query parameter
    // PayPal will append ?token=ORDER_ID to this URL
    const returnUrl = `${appUrl}/api/payments/paypal/capture?purchases=${encodeURIComponent(purchaseIds)}`;
    const cancelUrl = `${appUrl}/learning-paths/${pathId}?checkout=cancelled`;

    console.log("Creating PayPal order:", {
      amountCents: totalAmountCents,
      returnUrl,
      cancelUrl,
      purchaseId: purchases[0].id,
    });

    // Use the first purchase ID for custom_id (PayPal requires a single ID)
    const { orderId, approvalUrl } = await createPayPalOrder({
      amountCents: totalAmountCents,
      currency: "usd",
      returnUrl,
      cancelUrl,
      purchaseId: purchases[0].id, // Use first purchase ID for custom_id
    });

    console.log("PayPal order created:", { orderId, approvalUrl });

    if (!approvalUrl) {
      throw new Error("Failed to get PayPal approval URL");
    }

    // Update all purchases with the order ID
    await prisma.purchase.updateMany({
      where: {
        id: { in: purchases.map((p: any) => p.id) },
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
    description: path.description || `Follow this structured learning path to master ${path.title}.`,
    url: `/learning-paths/${pathId}`,
    courses: path.courses.map((pc: any) => ({
      name: pc.course.title,
      url: `/courses/${pc.course.slug}`,
    })),
  });

  // Access restriction section for non-Elite users
  if (!session?.user) {
    // Not logged in - show sign in prompt
    return (
      <section className="grid gap-8">
        <div>
          <Link
            href="/learning-paths"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-4"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Learning Paths
          </Link>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
            Learning Path
          </p>
          <h1 className="mt-2 font-display text-4xl font-bold tracking-tight">
            {path.title}
          </h1>
          {path.description && (
            <p className="mt-3 max-w-2xl text-lg text-muted-foreground">
              {path.description}
            </p>
          )}
        </div>

        <Card className="border-l-4 border-l-blue-500">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-foreground">
              <Lock className="h-5 w-5 text-blue-600" />
              Learning Paths Require Premium Access
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">
              Learning Paths are premium, curated learning journeys exclusive to our Elite subscribers. They guide you through complete learning paths with carefully sequenced courses.
            </p>
            <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900 rounded-lg p-4 space-y-3">
              <h3 className="font-semibold text-foreground flex items-center gap-2">
                <Zap className="h-4 w-4 text-blue-600" />
                Elite Membership Includes:
              </h3>
              <ul className="space-y-2 text-sm text-foreground/80">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                  Access to all Learning Paths
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                  All premium courses included
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                  Unlimited certificates
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                  Priority support
                </li>
              </ul>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <Link href={`/sign-in?callbackUrl=${encodeURIComponent(`/learning-paths/${pathId}`)}`}>
                <Button size="lg" className="w-full sm:w-auto">
                  Sign In
                </Button>
              </Link>
              <Link href="/pricing">
                <Button size="lg" variant="outline" className="w-full sm:w-auto">
                  View Plans
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </section>
    );
  }

  if (!hasAccessToPath) {
    // Logged in but not Pro or Elite - show upgrade prompt
    return (
      <section className="grid gap-8">
        <div>
          <Link
            href="/learning-paths"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-4"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Learning Paths
          </Link>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
            Learning Path
          </p>
          <h1 className="mt-2 font-display text-4xl font-bold tracking-tight">
            {path.title}
          </h1>
          {path.description && (
            <p className="mt-3 max-w-2xl text-lg text-muted-foreground">
              {path.description}
            </p>
          )}
        </div>

        <Card className="border-l-4 border-l-amber-500">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-foreground">
              <Lock className="h-5 w-5 text-amber-600" />
              Upgrade Your Plan
            </CardTitle>
            <CardDescription className="text-foreground/60 mt-2">
              Learning Paths are exclusive to Elite members
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h3 className="font-semibold text-lg text-foreground mb-2">
                Your Current Plan: <span className="text-amber-600">{userSubscription?.plan.name || 'Free'}</span>
              </h3>
              <p className="text-muted-foreground mb-4">
                Upgrade to Elite to unlock this learning path and access all premium structured learning journeys.
              </p>
            </div>

            <div className="space-y-3">
              <h4 className="font-semibold text-foreground flex items-center gap-2">
                <Zap className="h-4 w-4 text-amber-600" />
                Why Choose Elite?
              </h4>
              <div className="grid gap-2">
                <div className="flex items-center gap-2 text-sm text-foreground/80">
                  <CheckCircle2 className="h-4 w-4 text-green-600 flex-shrink-0" />
                  Access to all Learning Paths
                </div>
                <div className="flex items-center gap-2 text-sm text-foreground/80">
                  <CheckCircle2 className="h-4 w-4 text-green-600 flex-shrink-0" />
                  Premium and standard courses included
                </div>
                <div className="flex items-center gap-2 text-sm text-foreground/80">
                  <CheckCircle2 className="h-4 w-4 text-green-600 flex-shrink-0" />
                  Generate certificates upon completion
                </div>
                <div className="flex items-center gap-2 text-sm text-foreground/80">
                  <CheckCircle2 className="h-4 w-4 text-green-600 flex-shrink-0" />
                  Track progress and earn achievements
                </div>
                <div className="flex items-center gap-2 text-sm text-foreground/80">
                  <CheckCircle2 className="h-4 w-4 text-green-600 flex-shrink-0" />
                  Flexible subscription - cancel anytime
                </div>
              </div>
            </div>

            <div className="pt-4 flex flex-col sm:flex-row gap-3">
              <Link href="/pricing">
                <Button size="lg" className="w-full sm:w-auto">
                  <Zap className="h-4 w-4 mr-2" />
                  Upgrade to Elite
                </Button>
              </Link>
              <Link href="/learning-paths">
                <Button size="lg" variant="outline" className="w-full sm:w-auto">
                  View Other Paths
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </section>
    );
  }

  return (
    <section className="grid gap-8">
      <div>
        <Link
          href="/learning-paths"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-4"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Learning Paths
        </Link>
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
          Learning Path
        </p>
        <h1 className="mt-2 font-display text-4xl font-bold tracking-tight">
          {path.title}
        </h1>
        {path.description && (
          <p className="mt-3 max-w-2xl text-lg text-muted-foreground">
            {path.description}
          </p>
        )}
      </div>

      {/* Progress Section for enrolled users */}
      {isEnrolled && pathProgress && (
        <PathProgressSection
          totalCourses={pathProgress.totalCourses}
          completedCount={pathProgress.completedCount}
          inProgressCount={pathProgress.inProgressCount}
          progressPercent={pathProgress.progressPercent}
          estimatedHours={(pathData as any).estimatedHours}
          courses={pathProgress.courses}
        />
      )}

      {/* Objectives Section */}
      {(((pathData as any).objectives?.length) || ((pathData as any).skills?.length) || ((pathData as any).targetAudience) || ((pathData as any).prerequisites) || ((pathData as any).estimatedHours)) && (
        <PathObjectivesSection
          objectives={(pathData as any).objectives}
          skills={(pathData as any).skills}
          targetAudience={(pathData as any).targetAudience}
          prerequisites={(pathData as any).prerequisites}
          estimatedHours={(pathData as any).estimatedHours}
        />
      )}

      {/* Completion Certificate Section */}
      {isEnrolled && isPathCompleted && (
        <Card className="border-l-4 border-l-green-500 bg-green-50 dark:bg-green-950/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-foreground">
              <Award className="h-5 w-5 text-green-600" />
              Path Completed! 🎉
            </CardTitle>
            <CardDescription className="text-foreground/60 mt-2">
              You've successfully completed all courses in this learning path
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-foreground">
              Congratulations on completing <span className="font-semibold">{path.title}</span>! Generate your official completion certificate to showcase your achievement.
            </p>
            <Button size="lg" variant="premium" className="w-full sm:w-auto">
              <Award className="h-4 w-4 mr-2" />
              Generate Completion Certificate
            </Button>
          </CardContent>
        </Card>
      )}

      {path.courses.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <BookOpen className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground">
              No courses in this learning path yet.
            </p>
          </CardContent>
        </Card>
      ) : (
        <>
          <Card>
            <CardHeader>
              <CardTitle>Path Overview</CardTitle>
              <CardDescription>
                Complete these courses in order to master this learning path
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4 text-sm">
                <div>
                  <span className="font-medium">{path.courses.length}</span>{" "}
                  {path.courses.length === 1 ? "course" : "courses"}
                </div>
                <div>
                  <span className="font-medium">
                    ${(totalPrice / 100).toFixed(2)}
                  </span>{" "}
                  total
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="space-y-4">
            <h2 className="text-2xl font-semibold">Courses in This Path</h2>
            <div className="space-y-4">
              {path.courses.map((pathCourse: any, index: number) => (
                <Card key={pathCourse.id}>
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-semibold">
                            {index + 1}
                          </div>
                          <h3 className="text-lg font-semibold">
                            {pathCourse.course.title}
                          </h3>
                        </div>
                        {pathCourse.course.description && (
                          <p className="text-sm text-muted-foreground ml-11">
                            {pathCourse.course.description}
                          </p>
                        )}
                        <div className="flex items-center gap-4 mt-3 ml-11">
                          <Badge variant="secondary">
                            ${(pathCourse.course.priceCents / 100).toFixed(2)}
                          </Badge>
                          {session?.user && purchasedCourseIds.has(pathCourse.course.id) && (
                            <Badge variant="default" className="bg-green-600">
                              <CheckCircle2 className="h-3 w-3 mr-1" />
                              Already Purchased
                            </Badge>
                          )}
                        </div>
                      </div>
                      <Link href={`/courses/${pathCourse.course.slug}`}>
                        <Button variant="outline">View Course</Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Path Price</p>
                  <div className="space-y-1">
                    {priceInfo.alreadyPurchasedCents > 0 ? (
                      <>
                        <div className="flex items-center gap-2">
                          <p className="text-lg font-semibold line-through text-muted-foreground">
                            ${(priceInfo.fullPriceCents / 100).toFixed(2)}
                          </p>
                          <p className="text-2xl font-bold text-green-600">
                            ${(priceInfo.adjustedPriceCents / 100).toFixed(2)}
                          </p>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          You already own ${(priceInfo.alreadyPurchasedCents / 100).toFixed(2)} worth of courses
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Pay only for {priceInfo.coursesToPurchase} remaining {priceInfo.coursesToPurchase === 1 ? "course" : "courses"}
                        </p>
                      </>
                    ) : (
                      <p className="text-2xl font-bold">
                        ${(priceInfo.fullPriceCents / 100).toFixed(2)}
                      </p>
                    )}
                  </div>
                  {isEnrolled && (
                    <Badge variant="default" className="mt-2">
                      <CheckCircle2 className="h-3 w-3 mr-1" />
                      Enrolled
                    </Badge>
                  )}
                </div>
                {session?.user ? (
                  isEnrolled ? (
                    <Link href="/library">
                      <Button size="lg">Go to Library</Button>
                    </Link>
                  ) : priceInfo.adjustedPriceCents === 0 ? (
                    <Link href="/library">
                      <Button size="lg">Go to Library</Button>
                    </Link>
                  ) : (
                    <LearningPathEnrollment
                      pathId={path.id}
                      totalPriceCents={priceInfo.adjustedPriceCents}
                      enrollAction={enrollInLearningPathAction}
                    />
                  )
                ) : (
                  <Link href={`/sign-in?callbackUrl=${encodeURIComponent(`/learning-paths/${pathId}`)}`}>
                    <Button size="lg">Sign in to Enroll</Button>
                  </Link>
                )}
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </section>
  );
}
