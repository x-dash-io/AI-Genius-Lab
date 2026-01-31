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
    <section className="relative grid gap-16 py-12 sm:py-20">
      {/* Hero Content */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 grid gap-8 max-w-5xl mx-auto"
      >
        <div className="grid gap-6 text-center sm:text-left">
          <h1 className="font-display text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight leading-tight">
            <span className="block">Master AI With</span>
            <div className="block mt-2">
              <TypingAnimation
                words={typingWords}
                className="text-primary"
                typingSpeed={80}
                deletingSpeed={40}
                pauseDuration={2500}
              />
            </div>
          </h1>
          
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center justify-center sm:justify-start gap-3 text-xl sm:text-2xl font-semibold text-muted-foreground"
          >
            <Sparkles className="h-5 w-5 text-primary flex-shrink-0" />
            <span className="italic">Not Random Tutorials</span>
            <span className="text-primary hidden sm:inline">—</span>
            <span className="text-foreground">Real Learning Paths</span>
          </motion.div>
        </div>
        
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="max-w-3xl text-xl text-center sm:text-left text-muted-foreground leading-relaxed"
        >
          Learn AI for business, content, apps, and productivity through structured courses, tracked progress, and instant access after purchase.
        </motion.p>
        
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="flex items-center justify-center sm:justify-start gap-3 text-lg sm:text-xl font-medium text-primary bg-primary/5 dark:bg-primary/10 px-6 py-3 rounded-full border border-primary/20 w-fit"
        >
          <Zap className="h-5 w-5 sm:h-6 sm:w-6" />
          <span className="tracking-wide">The future belongs to those who master AI</span>
        </motion.div>
      </motion.div>

      {/* Real-time Stats */}
      {stats.totalCourses > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="relative z-10"
        >
          <div className="bg-card/50 dark:bg-card/30 backdrop-blur-sm border border-border/50 rounded-2xl p-8 max-w-4xl mx-auto">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 sm:gap-8">
              <div className="text-center sm:text-left">
                <div className="flex items-center justify-center sm:justify-start gap-3 mb-2">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 border border-primary/20">
                    <BookOpen className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <p className="text-3xl font-bold">{stats.totalCourses}</p>
                    <p className="text-sm text-muted-foreground">Courses Available</p>
                  </div>
                </div>
              </div>
              
              {stats.totalStudents >= 50 && (
                <div className="text-center sm:text-left">
                  <div className="flex items-center justify-center sm:justify-start gap-3 mb-2">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 border border-primary/20">
                      <Users className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <p className="text-3xl font-bold">{stats.totalStudents.toLocaleString()}</p>
                      <p className="text-sm text-muted-foreground">Active Learners</p>
                    </div>
                  </div>
                </div>
              )}
              
              {stats.totalLessons > 0 && (
                <div className="text-center sm:text-left">
                  <div className="flex items-center justify-center sm:justify-start gap-3 mb-2">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 border border-primary/20">
                      <GraduationCap className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <p className="text-3xl font-bold">{stats.totalLessons.toLocaleString()}</p>
                      <p className="text-sm text-muted-foreground">Lessons</p>
                    </div>
                  </div>
                </div>
              )}
              
              {stats.totalReviews > 0 && stats.averageRating > 0 && (
                <div className="text-center sm:text-left">
                  <div className="flex items-center justify-center sm:justify-start gap-3 mb-2">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 border border-primary/20">
                      <Star className="h-6 w-6 text-primary fill-primary" />
                    </div>
                    <div>
                      <p className="text-3xl font-bold">{stats.averageRating.toFixed(1)}</p>
                      <p className="text-sm text-muted-foreground">{stats.totalReviews} Reviews</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      )}
      
      {/* CTA Buttons */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.7 }}
        className="relative z-10 flex flex-col sm:flex-row items-center justify-center gap-4 max-w-md mx-auto sm:max-w-none"
      >
        <Link href="/courses" className="inline-block w-full sm:w-auto">
          <Button size="lg" className="w-full sm:w-auto text-lg px-8 py-3 h-auto">
            Browse Courses
          </Button>
        </Link>
        <Link href="/learning-paths" className="inline-block w-full sm:w-auto">
          <Button variant="outline" size="lg" className="w-full sm:w-auto text-lg px-8 py-3 h-auto border-2">
            View Learning Paths
          </Button>
        </Link>
      </motion.div>

      {/* Trust Indicators */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.8 }}
        className="relative z-10 flex flex-wrap items-center justify-center gap-8 text-sm text-muted-foreground"
      >
        <div className="flex items-center gap-2 bg-card/50 dark:bg-card/30 px-4 py-2 rounded-full border border-border/30">
          <Lock className="h-4 w-4 text-primary" />
          <span>Secure PayPal checkout</span>
        </div>
        <div className="flex items-center gap-2 bg-card/50 dark:bg-card/30 px-4 py-2 rounded-full border border-border/30">
          <BarChart className="h-4 w-4 text-primary" />
          <span>Progress tracked automatically</span>
        </div>
        <div className="flex items-center gap-2 bg-card/50 dark:bg-card/30 px-4 py-2 rounded-full border border-border/30">
          <GraduationCap className="h-4 w-4 text-primary" />
          <span>Lifetime access after purchase</span>
        </div>
      </motion.div>
    </section>
  );
}
