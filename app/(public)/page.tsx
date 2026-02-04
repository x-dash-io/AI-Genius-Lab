import { Metadata } from "next";
// import { connection } from "next/server"; // Not available in Next.js 14
import { LandingHero } from "@/components/layout/LandingHero";
import { TrustSection } from "@/components/home/TrustSection";
import { LaunchCurriculum } from "@/components/home/LaunchCurriculum";
import { HowItWorks } from "@/components/home/HowItWorks";
import { SocialProof } from "@/components/home/SocialProof";
import { SecuritySection } from "@/components/home/SecuritySection";
import { FinalCTA } from "@/components/home/FinalCTA";
import { HeroBackgroundBlobs } from "@/components/ui/hero-background-blobs";
import { generateMetadata as generateSEOMetadata } from "@/lib/seo";
import { getHomepageStats } from "@/lib/homepage-stats";

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
  // Fetch stats with error handling - page will still render if DB is unavailable
  let stats;
  try {
    stats = await getHomepageStats();
  } catch (error) {
    console.error("Failed to fetch homepage stats:", error);
    // Use empty stats as fallback
    stats = {
      totalCourses: 0,
      totalStudents: 0,
      totalLessons: 0,
      averageRating: 0,
      totalReviews: 0,
      categoriesWithCourses: [],
    };
  }

  return (
    <div className="relative overflow-x-hidden">
      <HeroBackgroundBlobs />
      <div className="grid gap-16 md:gap-24 relative z-10 overflow-x-hidden">
        <LandingHero stats={stats} />
        <TrustSection stats={stats} />
        <LaunchCurriculum stats={stats} />
        <HowItWorks />
        <SocialProof stats={stats} />
        <SecuritySection />
        <FinalCTA />
      </div>
    </div>
  );
}
