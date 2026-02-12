import { Metadata } from "next";
import { Sparkles } from "lucide-react";
import { PremiumHomepageExperience } from "@/components/home/PremiumHomepageExperience";
import { EmptyState } from "@/components/ui/empty-state";
import { Button } from "@/components/ui/button";
import { generateMetadata as generateSEOMetadata } from "@/lib/seo";
import { getHomepageStats } from "@/lib/homepage-stats";
import { getFeaturedTestimonials } from "@/lib/testimonials";
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

export default async function LandingPage() {
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

  return (
    <PageContainer className="space-y-6 lg:space-y-8" width="wide">
      <PremiumHomepageExperience
        metrics={{
          totalCourses: stats.totalCourses,
          totalStudents: stats.totalStudents,
          totalLessons: stats.totalLessons,
          averageRating: stats.averageRating,
          totalReviews: stats.totalReviews,
        }}
        featuredCourses={featuredCourses}
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
