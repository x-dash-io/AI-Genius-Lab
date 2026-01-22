import { Metadata } from "next";
import Link from "next/link";
import { redirect, notFound } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getLearningPathBySlug, createLearningPathPurchases, hasEnrolledInLearningPath } from "@/lib/learning-paths";
import { createPayPalOrder } from "@/lib/paypal";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, BookOpen, CheckCircle2 } from "lucide-react";
import { generateMetadata as generateSEOMetadata } from "@/lib/seo";
import { generateLearningPathSchema } from "@/lib/seo/schemas";
import { LearningPathEnrollment } from "@/components/learning-paths/LearningPathEnrollment";

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
    description: path.description || `Follow this structured learning path to master ${path.title}.`,
    keywords: ["learning path", path.title, "structured learning"],
    url: `/learning-paths/${pathId}`,
    type: "website",
  });
}

export default async function LearningPathDetailPage({
  params,
}: LearningPathDetailPageProps) {
  const { pathId } = await params;
  const path = await getLearningPathBySlug(pathId);

  if (!path) {
    notFound();
  }

  const session = await getServerSession(authOptions);
  const isEnrolled = session?.user
    ? await hasEnrolledInLearningPath(session.user.id, path.id)
    : false;

  const totalPrice = path.courses.reduce(
    (sum, pc) => sum + pc.course.priceCents,
    0
  );

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
    const purchaseIds = purchases.map((p) => p.id).join(",");
    const order = await createPayPalOrder({
      purchaseIds,
      amountCents: totalAmountCents,
      currency: "usd",
    });

    return {
      orderId: order.id,
      approvalUrl: order.links?.find((link: any) => link.rel === "approve")?.href || null,
    };
  }

  const learningPathSchema = generateLearningPathSchema({
    name: path.title,
    description: path.description || `Follow this structured learning path to master ${path.title}.`,
    url: `/learning-paths/${pathId}`,
    courses: path.courses.map((pc) => ({
      name: pc.course.title,
      url: `/courses/${pc.course.slug}`,
    })),
  });

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
              {path.courses.map((pathCourse, index) => (
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
                  <p className="text-2xl font-bold">
                    ${(totalPrice / 100).toFixed(2)}
                  </p>
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
                  ) : (
                    <LearningPathEnrollment
                      pathId={path.id}
                      totalPriceCents={totalPrice}
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
