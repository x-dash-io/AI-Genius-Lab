import Link from "next/link";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { BookOpen } from "lucide-react";

import { authOptions } from "@/lib/auth";
import { subscriptionTierHasCourseAccess } from "@/lib/access";
import { prisma } from "@/lib/prisma";
import { getUserSubscription, isSubscriptionActiveNow } from "@/lib/subscriptions";
import { CourseProductCard } from "@/components/courses/CourseProductCard";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import {
  ContentRegion,
  PageContainer,
  PageHeader,
  StatusRegion,
  Toolbar,
} from "@/components/layout/shell";

export const dynamic = "force-dynamic";

function formatPrice(priceCents: number) {
  return priceCents === 0 ? "Included" : `$${(priceCents / 100).toFixed(2)}`;
}

export default async function LibraryPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    redirect("/sign-in");
  }

  const [purchases, subscription] = await Promise.all([
    prisma.purchase.findMany({
      where: {
        userId: session.user.id,
        status: "paid",
      },
      include: {
        Course: true,
      },
      orderBy: { createdAt: "desc" },
    }),
    getUserSubscription(session.user.id),
  ]);

  const hasActiveSubscription = isSubscriptionActiveNow(subscription);
  const purchasedCourseIds = new Set(purchases.map((purchase) => purchase.courseId));

  const subscriptionCourses =
    hasActiveSubscription && subscription
      ? await prisma.course.findMany({
          where: {
            isPublished: true,
            id: { notIn: Array.from(purchasedCourseIds) },
            ...(subscriptionTierHasCourseAccess(subscription.plan.tier, "PREMIUM")
              ? {}
              : { tier: "STANDARD" }),
          },
          select: {
            id: true,
            title: true,
            description: true,
            slug: true,
            category: true,
            imageUrl: true,
            tier: true,
          },
          orderBy: { updatedAt: "desc" },
          take: 60,
        })
      : [];

  const totalAccessibleCourses = purchases.length + subscriptionCourses.length;

  return (
    <PageContainer className="space-y-6">
      <PageHeader
        title="My Library"
        description={
          totalAccessibleCourses
            ? "Continue courses you purchased and those currently included with your active subscription."
            : hasActiveSubscription
              ? "Your subscription is active. Published courses in your tier will appear here."
              : "No purchased courses yet. Browse catalog and start building your learning stack."
        }
        breadcrumbs={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Library" },
        ]}
        actions={
          <Link href="/courses">
            <Button variant="outline" className="h-11">
              Browse courses
            </Button>
          </Link>
        }
      />

      <Toolbar className="justify-between gap-3">
        <p className="text-sm text-muted-foreground">
          {hasActiveSubscription
            ? "Lifetime purchases and plan-included courses are available from this workspace."
            : "Purchased courses remain available for resume access from this workspace."}
        </p>
        <span className="rounded-full border bg-background px-2.5 py-1 text-xs font-semibold">
          {totalAccessibleCourses} course{totalAccessibleCourses === 1 ? "" : "s"}
        </span>
      </Toolbar>

      <ContentRegion>
        {totalAccessibleCourses ? (
          <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {purchases.map((purchase) => (
              <CourseProductCard
                key={purchase.id}
                title={purchase.Course.title}
                description={purchase.Course.description || "Continue your learning journey with practical modules."}
                slug={purchase.Course.slug}
                categoryLabel={purchase.Course.category || "Course"}
                priceLabel={formatPrice(purchase.amountCents)}
                imageUrl={purchase.Course.imageUrl}
                tierLabel={purchase.Course.tier === "PREMIUM" ? "Advanced" : "Core"}
                metaItems={[
                  { label: "Status", value: "Purchased" },
                  { label: "Access", value: "Lifetime" },
                  { label: "Mode", value: "Self-paced" },
                ]}
                primaryAction={{ href: `/library/${purchase.Course.slug}`, label: "Open course" }}
                secondaryActions={[{ href: `/courses/${purchase.Course.slug}`, label: "Course detail" }]}
              />
            ))}

            {subscriptionCourses.map((course) => (
              <CourseProductCard
                key={`subscription-${course.id}`}
                title={course.title}
                description={course.description || "Included with your active subscription plan."}
                slug={course.slug}
                categoryLabel={course.category || "Course"}
                priceLabel="Included"
                imageUrl={course.imageUrl}
                tierLabel={course.tier === "PREMIUM" ? "Advanced" : "Core"}
                metaItems={[
                  { label: "Status", value: "Included" },
                  { label: "Access", value: "Subscription" },
                  { label: "Mode", value: "Self-paced" },
                ]}
                primaryAction={{ href: `/library/${course.slug}`, label: "Open course" }}
                secondaryActions={[{ href: `/courses/${course.slug}`, label: "Course detail" }]}
              />
            ))}
          </section>
        ) : null}
      </ContentRegion>

      <StatusRegion>
        {!totalAccessibleCourses ? (
          <EmptyState
            icon={<BookOpen className="h-6 w-6" />}
            title="Library is empty"
            description={
              hasActiveSubscription
                ? "No published courses are currently available for your subscription tier."
                : "Complete checkout to unlock courses and see them here."
            }
            action={
              <Link href="/courses">
                <Button variant={hasActiveSubscription ? "outline" : "premium"}>Explore catalog</Button>
              </Link>
            }
          />
        ) : (
          <Card className="ui-surface">
            <CardContent className="flex flex-wrap items-center justify-between gap-3 p-4 text-sm">
              <p className="text-muted-foreground">
                Need billing updates or plan access changes?
              </p>
              <Link href="/profile/subscription">
                <Button variant="ghost" size="sm">
                  Manage subscription
                </Button>
              </Link>
            </CardContent>
          </Card>
        )}
      </StatusRegion>
    </PageContainer>
  );
}
