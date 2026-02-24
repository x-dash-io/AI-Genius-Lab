import { Metadata } from "next";
import { getServerSession } from "next-auth";
import { Sparkles } from "lucide-react";
import { PremiumHomepageExperience } from "@/components/home/PremiumHomepageExperience";
import { EmptyState } from "@/components/ui/empty-state";
import { Button } from "@/components/ui/button";
import { authOptions } from "@/lib/auth";
import { subscriptionTierHasCourseAccess } from "@/lib/access";
import { generateMetadata as generateSEOMetadata } from "@/lib/seo";
import { getHomepageStats } from "@/lib/homepage-stats";
import { getFeaturedTestimonials } from "@/lib/testimonials";
import { prisma } from "@/lib/prisma";
import { getUserSubscription, isSubscriptionActiveNow } from "@/lib/subscriptions";
import { getHeroLogos, defaultHeroLogos } from "@/lib/settings";
import { PageContainer, StatusRegion } from "@/components/layout/shell";
import Link from "next/link";

export const dynamic = "force-dynamic";

type HomepageStats = Awaited<ReturnType<typeof getHomepageStats>>;

export const metadata: Metadata = generateSEOMetadata({
  title: "Master AI With Curated Learning Paths",
  description:
    "Learn AI for business, content, apps, and productivity through structured courses, tracked progress, and instant access after purchase.",
  keywords: [
    "AI courses",
    "artificial intelligence",
    "online learning",
    "structured learning",
    "AI education",
  ],
});

const HARD_CODED_LANDING_METRICS = {
  totalCourses: 64,
  totalStudents: 14850,
  totalLessons: 540,
  averageRating: 4.8,
  totalReviews: 3200,
};

export default async function LandingPage() {
  const session = await getServerSession(authOptions);

  const emptyStats: HomepageStats = {
    totalCourses: 0,
    totalStudents: 0,
    totalLessons: 0,
    averageRating: 0,
    totalReviews: 0,
    categoriesWithCourses: [],
  };

  let stats = emptyStats;
  let testimonials: Array<{
    id: string;
    name: string;
    role: string;
    avatar?: string | null;
    rating: number;
    text: string;
  }> = [];
  let heroLogos: Awaited<ReturnType<typeof getHeroLogos>> = [];

  try {
    const [statsResult, testimonialsResult, heroLogosResult] = await Promise.all([
      getHomepageStats(),
      getFeaturedTestimonials(),
      getHeroLogos(),
    ]);
    stats = statsResult;
    testimonials = testimonialsResult;
    heroLogos = heroLogosResult;
  } catch (error) {
    console.error("Failed to fetch homepage data:", error);
    heroLogos = defaultHeroLogos;
  }

  if (!heroLogos || !heroLogos.some((logo) => logo.visible)) {
    heroLogos = defaultHeroLogos;
  }

  const featuredCourses = Array.from(
    new Map(
      stats.categoriesWithCourses.flatMap((category) =>
        category.courses.map((course) => [
          course.id,
          {
            ...course,
            categoryName: category.name || "General",
            tier: course.priceCents > 0 ? "PREMIUM" : "STANDARD",
          },
        ] as const)
      )
    ).values()
  ).slice(0, 6);

  const featuredCourseIds = featuredCourses.map((course) => course.id);
  const accessibleCourseIds = new Set<string>();
  featuredCourses.forEach((course) => {
    if (course.priceCents === 0) {
      accessibleCourseIds.add(course.id);
    }
  });

  if (session?.user && featuredCourseIds.length) {
    if (session.user.role === "admin") {
      featuredCourseIds.forEach((courseId) => accessibleCourseIds.add(courseId));
    } else {
      const [purchases, subscription] = await Promise.all([
        prisma.purchase.findMany({
          where: {
            userId: session.user.id,
            status: "paid",
            courseId: { in: featuredCourseIds },
          },
          select: { courseId: true },
        }),
        getUserSubscription(session.user.id),
      ]);

      purchases.forEach((purchase) => accessibleCourseIds.add(purchase.courseId));

      if (subscription && isSubscriptionActiveNow(subscription)) {
        featuredCourses.forEach((course) => {
          const tier = course.tier === "PREMIUM" ? "PREMIUM" : "STANDARD";
          if (subscriptionTierHasCourseAccess(subscription.plan.tier, tier)) {
            accessibleCourseIds.add(course.id);
          }
        });
      }
    }
  }

  const featuredCoursesWithAccess = featuredCourses.map((course) => ({
    ...course,
    hasAccess: accessibleCourseIds.has(course.id),
  }));

  return (
    <PageContainer className="space-y-6 lg:space-y-8" width="wide">
      <PremiumHomepageExperience
        metrics={HARD_CODED_LANDING_METRICS}
        featuredCourses={featuredCoursesWithAccess}
        testimonials={testimonials}
        heroLogos={heroLogos}
      />

      <StatusRegion>
        {!featuredCourses.length ? (
          <EmptyState
            icon={<Sparkles className="h-6 w-6" />}
            title="Course catalog is being prepared"
            description="New learning tracks are being published. Browse pricing or contact the team for early access."
            action={
              <div className="flex flex-wrap items-center justify-center gap-2">
                <Link href="/pricing">
                  <Button variant="outline">View pricing</Button>
                </Link>
                <Link href="/contact">
                  <Button variant="premium">Contact team</Button>
                </Link>
              </div>
            }
          />
        ) : null}
      </StatusRegion>
    </PageContainer>
  );
}
