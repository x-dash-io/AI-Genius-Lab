"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Lock, BarChart, GraduationCap, Sparkles, Zap, Users, BookOpen, Star } from "lucide-react";
import { TypingAnimation } from "@/components/ui/typing-animation";
import type { HomepageStats } from "@/lib/homepage-stats";

interface LandingHeroProps {
  stats: HomepageStats;
}

export function LandingHero({ stats }: LandingHeroProps) {
  const typingWords = [
    "structured paths",
    "verified access",
    "real outcomes",
    "premium learning",
    "secure commerce",
    "curated courses",
  ];

  return (
    <section className="grid gap-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="grid gap-6"
      >
        <div className="grid gap-3">
          <h1 className="font-display text-5xl font-bold tracking-tight sm:text-6xl">
            Master AI With{" "}
            <TypingAnimation
              words={typingWords}
              className="text-primary"
              typingSpeed={80}
              deletingSpeed={40}
              pauseDuration={2500}
            />
          </h1>
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="flex items-center gap-3 text-xl sm:text-2xl font-semibold text-muted-foreground"
          >
            <Sparkles className="h-5 w-5 text-primary" />
            <span className="italic">Not Random Tutorials</span>
            <span className="text-primary">—</span>
            <span className="text-foreground">Real Learning Paths</span>
          </motion.div>
        </div>
        <p className="max-w-2xl text-lg text-muted-foreground">
          Learn AI for business, content, apps, and productivity through structured courses, tracked progress, and instant access after purchase.
        </p>
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="flex items-center gap-2 text-base sm:text-lg font-medium text-primary"
        >
          <Zap className="h-4 w-4 sm:h-5 sm:w-5" />
          <span className="tracking-wide">The future belongs to those who master AI</span>
        </motion.div>
      </motion.div>

      {/* Real-time Stats */}
      {stats.totalCourses > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.15 }}
          className="flex flex-wrap items-center gap-6 sm:gap-8 text-sm"
        >
          <div className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
              <BookOpen className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats.totalCourses}</p>
              <p className="text-xs text-muted-foreground">Courses Available</p>
            </div>
          </div>
          {stats.totalStudents > 0 && (
            <div className="flex items-center gap-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                <Users className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.totalStudents.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground">Active Learners</p>
              </div>
            </div>
          )}
          {stats.totalLessons > 0 && (
            <div className="flex items-center gap-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                <GraduationCap className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.totalLessons.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground">Lessons</p>
              </div>
            </div>
          )}
          {stats.totalReviews > 0 && stats.averageRating > 0 && (
            <div className="flex items-center gap-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                <Star className="h-5 w-5 text-primary fill-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.averageRating.toFixed(1)}</p>
                <p className="text-xs text-muted-foreground">{stats.totalReviews} Reviews</p>
              </div>
            </div>
          )}
        </motion.div>
      )}
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="flex flex-wrap items-center gap-4"
      >
        <Link href="/courses" className="inline-block">
          <Button size="lg" className="w-full sm:w-auto">Browse Courses</Button>
        </Link>
        <Link href="/learning-paths" className="inline-block">
          <Button variant="outline" size="lg" className="w-full sm:w-auto">
            View Learning Paths
          </Button>
        </Link>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="flex flex-wrap items-center gap-6 text-sm text-muted-foreground"
      >
        <div className="flex items-center gap-2">
          <Lock className="h-4 w-4" />
          <span>Secure PayPal checkout</span>
        </div>
        <div className="flex items-center gap-2">
          <BarChart className="h-4 w-4" />
          <span>Progress tracked automatically</span>
        </div>
        <div className="flex items-center gap-2">
          <GraduationCap className="h-4 w-4" />
          <span>Lifetime access after purchase</span>
        </div>
      </motion.div>
    </section>
  );
}
