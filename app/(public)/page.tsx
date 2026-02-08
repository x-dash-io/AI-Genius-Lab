import { Metadata } from "next";
// import { connection } from "next/server"; // Not available in Next.js 14
import { LandingHero } from "@/components/layout/LandingHero";
import { TrustSection } from "@/components/home/TrustSection";
import { LaunchCurriculum } from "@/components/home/LaunchCurriculum";
import { HowItWorks } from "@/components/home/HowItWorks";
import { SocialProof } from "@/components/home/SocialProof";
import { SecuritySection } from "@/components/home/SecuritySection";
import { HomeTestimonials } from "@/components/home/HomeTestimonials";
import { HomeFeaturedCourses } from "@/components/home/HomeFeaturedCourses";
import { FinalCTA } from "@/components/home/FinalCTA";
import { HeroBackgroundBlobs } from "@/components/ui/hero-background-blobs";
import { generateMetadata as generateSEOMetadata } from "@/lib/seo";
import { getHomepageStats } from "@/lib/homepage-stats";
import { getHeroLogos } from "@/lib/settings";
import { getFeaturedTestimonials } from "@/lib/testimonials";

export const dynamic = "force-dynamic";

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
  // await connection(); // Not available in Next.js 14
  // Fetch stats and logos
  let stats;
  let heroLogos: any[] = [];
  let testimonials: any[] = [];

  try {
    const [statsResult, logosResult, testimonialsResult] = await Promise.all([
      getHomepageStats(),
      getHeroLogos().catch(() => []), // Fallback to empty if fails
      getFeaturedTestimonials(),
    ]);
    stats = statsResult;
    heroLogos = logosResult;
    testimonials = testimonialsResult;
  } catch (error) {
    console.error("Failed to fetch homepage data:", error);
    // Use empty stats as fallback
    stats = {
      totalCourses: 0,
      totalStudents: 0,
      totalLessons: 0,
      averageRating: 0,
      totalReviews: 0,
      categoriesWithCourses: [],
    };
    heroLogos = [];
  }

  return (
    <div className="relative overflow-x-hidden">
      <HeroBackgroundBlobs />
      <div className="grid gap-16 md:gap-24 relative z-10 overflow-x-hidden">
        <LandingHero stats={stats} heroLogos={heroLogos} />
        <TrustSection stats={stats} />
        <HomeFeaturedCourses courses={stats.categoriesWithCourses.flatMap(c => c.courses).slice(0, 6)} />
        <LaunchCurriculum stats={stats} />
        <HowItWorks />
        <SocialProof stats={stats} />
        <HomeTestimonials testimonials={testimonials} />
        <SecuritySection />
        <FinalCTA />
      </div>
    </div>
  );
}
