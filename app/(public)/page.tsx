import { Metadata } from "next";
import { LandingHero } from "@/components/layout/LandingHero";
import { TrustSection } from "@/components/home/TrustSection";
import { LaunchCurriculum } from "@/components/home/LaunchCurriculum";
import { HowItWorks } from "@/components/home/HowItWorks";
import { SocialProof } from "@/components/home/SocialProof";
import { SecuritySection } from "@/components/home/SecuritySection";
import { FinalCTA } from "@/components/home/FinalCTA";
import { generateMetadata as generateSEOMetadata } from "@/lib/seo";
import { getHomepageStats } from "@/lib/homepage-stats";

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
  const stats = await getHomepageStats();

  return (
    <div className="grid gap-16 md:gap-24">
      <LandingHero stats={stats} />
      <TrustSection stats={stats} />
      <LaunchCurriculum stats={stats} />
      <HowItWorks />
      <SocialProof stats={stats} />
      <SecuritySection />
      <FinalCTA />
    </div>
  );
}
