"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import HeroLogosCarousel from "@/components/home/HeroLogosCarousel";
import {
  ArrowRight,
  BadgeCheck,
  BookOpen,
  Flame,
  Lock,
  Route,
  Star,
  Target,
  TrendingUp,
  Trophy,
  Users,
} from "lucide-react";
import { HeroPattern } from "@/components/ui/hero-pattern";
import type { HomepageStats } from "@/lib/homepage-stats";
import type { HeroLogo } from "@/lib/settings";

interface LandingHeroProps {
  stats: HomepageStats;
  heroLogos: HeroLogo[];
}

const RING_RADIUS = 45;
const RING_CIRCUMFERENCE = 2 * Math.PI * RING_RADIUS;
const HERO_PROGRESS = 68;
const progressOffset = RING_CIRCUMFERENCE - (HERO_PROGRESS / 100) * RING_CIRCUMFERENCE;

export function LandingHero({ stats, heroLogos }: LandingHeroProps) {
  const visibleHeroLogos = heroLogos.filter((logo) => logo.visible);

  return (
    <section className="relative py-12 sm:py-16 lg:py-20 min-h-0 overflow-hidden">
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full max-w-7xl opacity-20">
          <HeroPattern className="w-full h-full opacity-50" />
        </div>
        <div className="absolute top-24 left-1/2 -translate-x-1/2 h-[420px] w-[420px] bg-primary/15 blur-[120px] rounded-full" />
      </div>

      <div className="w-full max-w-7xl mx-auto px-5 sm:px-6 lg:px-8 relative z-10">
        <div className="grid gap-10 lg:grid-cols-[1.05fr,0.95fr] lg:gap-12 items-center">
          <div className="text-center lg:text-left space-y-7">
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45 }}
              className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-bold uppercase tracking-widest"
            >
              <Route className="h-3.5 w-3.5" />
              Learning paths first
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="space-y-4"
            >
              <h1 className="font-display text-4xl sm:text-6xl font-black tracking-tight leading-[1.05] text-foreground">
                Advance your career with
                <span className="block text-primary">AI learning paths</span>
              </h1>
              <p className="text-base sm:text-xl text-muted-foreground/90 leading-relaxed max-w-2xl mx-auto lg:mx-0">
                Build momentum with guided pathways, measurable progress, and certificates that showcase real outcomes.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="flex flex-col sm:flex-row gap-3 sm:gap-4 w-full sm:w-auto"
            >
              <Link href="/learning-paths" className="w-full sm:w-auto">
                <Button size="lg" variant="premium" className="w-full h-14 sm:px-8 rounded-2xl text-base shadow-xl shadow-primary/20">
                  Start Your Path
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link href="/pricing" className="w-full sm:w-auto">
                <Button size="lg" variant="outline" className="w-full h-14 sm:px-8 rounded-2xl text-base border-2">
                  View Pricing
                </Button>
              </Link>
            </motion.div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-left">
              {[
                { icon: Target, label: "Outcome-led curriculum" },
                { icon: TrendingUp, label: "Progress visibility" },
                { icon: BadgeCheck, label: "Verified certificates" },
              ].map((item, index) => (
                <motion.div
                  key={item.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.25 + index * 0.08 }}
                  className="rounded-2xl border bg-card/75 backdrop-blur px-4 py-3 flex items-center gap-2"
                >
                  <item.icon className="h-4 w-4 text-primary" />
                  <span className="text-xs font-semibold text-foreground/90">{item.label}</span>
                </motion.div>
              ))}
            </div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 28 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.65, delay: 0.2 }}
          >
            <Card glass className="rounded-[28px] border-white/20 p-5 sm:p-6 shadow-2xl">
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold text-muted-foreground">Path Momentum</p>
                <span className="text-xs font-bold uppercase tracking-wide text-primary">Live preview</span>
              </div>

              <div className="mt-5 grid sm:grid-cols-[120px,1fr] gap-5 items-center">
                <div className="relative mx-auto">
                  <svg className="h-28 w-28 -rotate-90" viewBox="0 0 120 120" aria-label="overall progress ring">
                    <circle cx="60" cy="60" r={RING_RADIUS} className="fill-none stroke-border" strokeWidth="10" />
                    <circle
                      cx="60"
                      cy="60"
                      r={RING_RADIUS}
                      className="fill-none stroke-primary transition-all duration-700"
                      strokeWidth="10"
                      strokeLinecap="round"
                      strokeDasharray={RING_CIRCUMFERENCE}
                      strokeDashoffset={progressOffset}
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-2xl font-black text-foreground">{HERO_PROGRESS}%</span>
                    <span className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">Complete</span>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="rounded-xl border bg-background/70 p-3 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Flame className="h-4 w-4 text-orange-500" />
                      <span className="text-sm font-medium">Learning streak</span>
                    </div>
                    <span className="text-sm font-bold">12 days</span>
                  </div>
                  <div className="rounded-xl border bg-background/70 p-3 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Trophy className="h-4 w-4 text-amber-500" />
                      <span className="text-sm font-medium">Next badge</span>
                    </div>
                    <span className="text-sm font-bold">2 lessons</span>
                  </div>
                  <div className="rounded-xl border bg-background/70 p-3 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <BookOpen className="h-4 w-4 text-blue-500" />
                      <span className="text-sm font-medium">Certificate path</span>
                    </div>
                    <span className="text-sm font-bold">AI Product Builder</span>
                  </div>
                </div>
              </div>
            </Card>
          </motion.div>
        </div>

        {visibleHeroLogos.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="pt-12 sm:pt-14"
          >
            <p className="text-center text-xs font-bold text-muted-foreground/50 mb-4 uppercase tracking-[0.2em]">
              Trusted by professionals at
            </p>
            <HeroLogosCarousel logos={visibleHeroLogos} direction="right" speed={20} />
          </motion.div>
        )}

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.75, delay: 0.4 }}
          className="mt-14 grid grid-cols-1 gap-4 sm:mt-16 sm:grid-cols-2 xl:grid-cols-4"
        >
          {[
            {
              icon: Users,
              value: stats.totalStudents >= 50 ? `${stats.totalStudents.toLocaleString()}+` : "Growing",
              label: "Learners advanced",
            },
            {
              icon: BadgeCheck,
              value: stats.totalLessons > 0 ? `${stats.totalLessons.toLocaleString()}+` : "New",
              label: "Milestones completed",
            },
            {
              icon: Star,
              value: stats.totalReviews > 0 ? stats.averageRating.toFixed(1) : "4.9",
              label: "Average learner rating",
            },
            {
              icon: Lock,
              value: stats.totalCourses > 0 ? `${stats.totalCourses}+` : "Secure",
              label: "Outcome-focused programs",
            },
          ].map((item) => (
            <Card
              key={item.label}
              glass
              className="min-w-0 border-white/10 p-5 text-center transition-all duration-300 hover:border-primary/25"
            >
              <item.icon className="h-5 w-5 text-primary mx-auto mb-2" />
              <p className="break-words text-[clamp(1.5rem,6vw,1.875rem)] font-black tracking-tight leading-tight">
                {item.value}
              </p>
              <p className="mt-1 break-words text-[11px] uppercase tracking-wide text-muted-foreground/80">
                {item.label}
              </p>
            </Card>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
