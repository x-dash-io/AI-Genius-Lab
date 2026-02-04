"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Lock, BarChart, GraduationCap, Sparkles, Zap, Users, BookOpen, Star, ArrowRight } from "lucide-react";
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
    <section className="relative py-12 sm:py-16 lg:py-20">
      {/* Main Hero Grid - Split Layout */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left Column - Main Content */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="relative z-10 space-y-6 sm:space-y-8"
          >
            {/* Heading */}
            <div className="space-y-4">
              <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold tracking-tight leading-[1.1]">
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
                transition={{ duration: 0.5, delay: 0.2 }}
                className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-3 text-lg sm:text-xl font-semibold text-muted-foreground"
              >
                <div className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-primary flex-shrink-0" />
                  <span className="italic">Not Random Tutorials</span>
                </div>
                <span className="text-primary hidden sm:inline">—</span>
                <span className="text-foreground">Real Learning Paths</span>
              </motion.div>
            </div>

            {/* Description */}
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="text-base sm:text-lg text-muted-foreground leading-relaxed max-w-2xl"
            >
              Learn AI for business, content, apps, and productivity through structured courses, tracked progress, and instant access after purchase.
            </motion.p>

            {/* Tagline Badge */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="inline-flex items-center gap-2 sm:gap-3 text-sm sm:text-base font-medium text-primary bg-primary/5 dark:bg-primary/10 px-4 sm:px-6 py-2 sm:py-3 rounded-full border border-primary/20"
            >
              <Zap className="h-4 w-4 sm:h-5 sm:w-5" />
              <span className="tracking-wide">The future belongs to those who master AI</span>
            </motion.div>

            {/* CTA Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.5 }}
              className="flex flex-col sm:flex-row gap-3 sm:gap-4 pt-2 sm:pt-4"
            >
              <Link href="/courses" className="inline-block w-full sm:w-auto">
                <Button
                  size="lg"
                  className="w-full sm:w-auto text-base sm:text-lg px-6 sm:px-8 py-5 sm:py-6 h-auto bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 shadow-lg hover:shadow-xl transition-all duration-300 group"
                >
                  Browse Courses
                  <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              <Link href="/learning-paths" className="inline-block w-full sm:w-auto">
                <Button
                  variant="outline"
                  size="lg"
                  className="w-full sm:w-auto text-base sm:text-lg px-6 sm:px-8 py-5 sm:py-6 h-auto border-2 hover:bg-accent/50 transition-all duration-300"
                >
                  View Learning Paths
                </Button>
              </Link>
            </motion.div>

            {/* Trust Indicators */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.6 }}
              className="flex flex-wrap items-center gap-3 sm:gap-4 pt-4 sm:pt-6 text-xs sm:text-sm text-muted-foreground"
            >
              <div className="flex items-center gap-2 bg-card/50 dark:bg-card/30 px-3 sm:px-4 py-2 rounded-full border border-border/30">
                <Lock className="h-3 w-3 sm:h-4 sm:w-4 text-primary" />
                <span>Secure checkout</span>
              </div>
              <div className="flex items-center gap-2 bg-card/50 dark:bg-card/30 px-3 sm:px-4 py-2 rounded-full border border-border/30">
                <BarChart className="h-3 w-3 sm:h-4 sm:w-4 text-primary" />
                <span>Progress tracked</span>
              </div>
              <div className="flex items-center gap-2 bg-card/50 dark:bg-card/30 px-3 sm:px-4 py-2 rounded-full border border-border/30">
                <GraduationCap className="h-3 w-3 sm:h-4 sm:w-4 text-primary" />
                <span>Lifetime access</span>
              </div>
            </motion.div>
          </motion.div>

          {/* Right Column - Stats Cards */}
          {stats.totalCourses > 0 && (
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="relative z-10 hidden lg:block"
            >
              <div className="grid grid-cols-2 gap-4 xl:gap-6">
                {/* Stat Card 1 - Courses */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.7 }}
                  className="bg-card/60 dark:bg-card/40 backdrop-blur-xl border border-border/50 rounded-2xl p-6 hover:scale-105 hover:shadow-2xl transition-all duration-300"
                >
                  <div className="flex flex-col items-center text-center space-y-3">
                    <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 border border-primary/20">
                      <BookOpen className="h-7 w-7 text-primary" />
                    </div>
                    <div>
                      <p className="text-4xl font-bold text-foreground">
                        {stats.totalCourses}
                      </p>
                      <p className="text-sm text-muted-foreground font-medium">Courses Available</p>
                    </div>
                  </div>
                </motion.div>

                {/* Stat Card 2 - Students */}
                {stats.totalStudents >= 50 && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.8 }}
                    className="bg-card/60 dark:bg-card/40 backdrop-blur-xl border border-border/50 rounded-2xl p-6 hover:scale-105 hover:shadow-2xl transition-all duration-300"
                  >
                    <div className="flex flex-col items-center text-center space-y-3">
                      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 border border-primary/20">
                        <Users className="h-7 w-7 text-primary" />
                      </div>
                      <div>
                        <p className="text-4xl font-bold text-foreground">
                          {stats.totalStudents.toLocaleString()}
                        </p>
                        <p className="text-sm text-muted-foreground font-medium">Active Learners</p>
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* Stat Card 3 - Lessons */}
                {stats.totalLessons > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.9 }}
                    className="bg-card/60 dark:bg-card/40 backdrop-blur-xl border border-border/50 rounded-2xl p-6 hover:scale-105 hover:shadow-2xl transition-all duration-300"
                  >
                    <div className="flex flex-col items-center text-center space-y-3">
                      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 border border-primary/20">
                        <GraduationCap className="h-7 w-7 text-primary" />
                      </div>
                      <div>
                        <p className="text-4xl font-bold text-foreground">
                          {stats.totalLessons.toLocaleString()}
                        </p>
                        <p className="text-sm text-muted-foreground font-medium">Lessons</p>
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* Stat Card 4 - Rating */}
                {stats.totalReviews > 0 && stats.averageRating > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 1.0 }}
                    className="bg-card/60 dark:bg-card/40 backdrop-blur-xl border border-border/50 rounded-2xl p-6 hover:scale-105 hover:shadow-2xl transition-all duration-300"
                  >
                    <div className="flex flex-col items-center text-center space-y-3">
                      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 border border-primary/20">
                        <Star className="h-7 w-7 text-primary fill-primary" />
                      </div>
                      <div>
                        <p className="text-4xl font-bold text-foreground">
                          {stats.averageRating.toFixed(1)}
                        </p>
                        <p className="text-sm text-muted-foreground font-medium">{stats.totalReviews} Reviews</p>
                      </div>
                    </div>
                  </motion.div>
                )}
              </div>
            </motion.div>
          )}
        </div>

        {/* Mobile Stats - Horizontal Scroll */}
        {stats.totalCourses > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.6 }}
            className="lg:hidden mt-8 sm:mt-10"
          >
            <div className="flex gap-4 overflow-x-auto pb-4 snap-x snap-mandatory -mx-4 px-4 sm:mx-0 sm:px-0">
              {/* Mobile Stat Card 1 */}
              <div className="flex-shrink-0 w-44 sm:w-48 snap-center bg-card/60 dark:bg-card/40 backdrop-blur-xl border border-border/50 rounded-2xl p-5 sm:p-6">
                <div className="flex flex-col items-center text-center space-y-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 border border-primary/20">
                    <BookOpen className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <p className="text-3xl font-bold text-foreground">{stats.totalCourses}</p>
                    <p className="text-sm text-muted-foreground">Courses</p>
                  </div>
                </div>
              </div>

              {stats.totalStudents >= 50 && (
                <div className="flex-shrink-0 w-44 sm:w-48 snap-center bg-card/60 dark:bg-card/40 backdrop-blur-xl border border-border/50 rounded-2xl p-5 sm:p-6">
                  <div className="flex flex-col items-center text-center space-y-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 border border-primary/20">
                      <Users className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <p className="text-3xl font-bold text-foreground">{stats.totalStudents.toLocaleString()}</p>
                      <p className="text-sm text-muted-foreground">Learners</p>
                    </div>
                  </div>
                </div>
              )}

              {stats.totalLessons > 0 && (
                <div className="flex-shrink-0 w-44 sm:w-48 snap-center bg-card/60 dark:bg-card/40 backdrop-blur-xl border border-border/50 rounded-2xl p-5 sm:p-6">
                  <div className="flex flex-col items-center text-center space-y-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 border border-primary/20">
                      <GraduationCap className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <p className="text-3xl font-bold text-foreground">{stats.totalLessons.toLocaleString()}</p>
                      <p className="text-sm text-muted-foreground">Lessons</p>
                    </div>
                  </div>
                </div>
              )}

              {stats.totalReviews > 0 && stats.averageRating > 0 && (
                <div className="flex-shrink-0 w-44 sm:w-48 snap-center bg-card/60 dark:bg-card/40 backdrop-blur-xl border border-border/50 rounded-2xl p-5 sm:p-6">
                  <div className="flex flex-col items-center text-center space-y-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 border border-primary/20">
                      <Star className="h-6 w-6 text-primary fill-primary" />
                    </div>
                    <div>
                      <p className="text-3xl font-bold text-foreground">{stats.averageRating.toFixed(1)}</p>
                      <p className="text-sm text-muted-foreground">{stats.totalReviews} Reviews</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </div>
    </section>
  );
}
