"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Lock, BarChart, GraduationCap, Sparkles, Zap, Users, BookOpen, Star, ArrowRight } from "lucide-react";
import * as LucideIcons from "lucide-react";
import { TypingAnimation } from "@/components/ui/typing-animation";
import type { HomepageStats } from "@/lib/homepage-stats";
import type { HeroLogo } from "@/lib/settings";

interface LandingHeroProps {
  stats: HomepageStats;
  heroLogos: HeroLogo[];
}

export function LandingHero({ stats, heroLogos }: LandingHeroProps) {
  const typingWords = [
    "structured paths",
    "verified access",
    "real outcomes",
    "premium learning",
    "secure commerce",
    "curated courses",
  ];

  const renderLogo = (logo: HeroLogo) => {
    if (logo.type === "icon") {
      // @ts-ignore - Dynamic access to Lucide icons
      const IconComponent: any = LucideIcons[logo.value as keyof typeof LucideIcons] || LucideIcons.Zap;
      return (
        <div key={logo.id} className="flex flex-col items-center gap-2 group cursor-pointer relative" title={logo.name}>
          <IconComponent className="h-8 w-8 sm:h-10 sm:w-10 text-muted-foreground/60 group-hover:text-primary transition-colors duration-300" />
          <span className="text-[10px] font-bold text-muted-foreground group-hover:text-foreground transition-all opacity-0 group-hover:opacity-100 absolute -bottom-6 whitespace-nowrap">{logo.name}</span>
        </div>
      );
    }

    return (
      <div key={logo.id} className="relative h-10 sm:h-14 flex items-center justify-center group">
        <motion.img
          src={logo.value}
          alt={logo.name}
          title={logo.name}
          whileHover={{ scale: 1.1, opacity: 1 }}
          className="h-full w-auto object-contain opacity-60 grayscale hover:grayscale-0 transition-all duration-300"
          onError={(e) => {
            // Fallback for missing images
            (e.target as HTMLImageElement).style.display = 'none';
          }}
        />
      </div>
    );
  };

  return (
    <section className="relative py-12 sm:py-16 lg:py-20 min-h-0 overflow-y-visible">
      {/* Main Hero Grid - Split Layout */}
      <div className="w-full max-w-7xl mx-auto px-5 sm:px-6 lg:px-8 overflow-x-hidden">
        <div className="grid lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          {/* Left Column - Main Content */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, ease: [0.23, 1, 0.32, 1] }}
            className="lg:col-span-7 relative z-10 space-y-8 min-w-0"
          >
            {/* Heading */}
            <div className="space-y-6">
              <h1 className="font-display text-3xl sm:text-5xl md:text-6xl xl:text-7xl font-black tracking-tight leading-[1.1] max-w-full break-words">
                <span className="block text-foreground/90">Master AI With</span>
                <span className="block mt-2 w-full">
                  <TypingAnimation
                    words={typingWords}
                    className="text-primary drop-shadow-[0_4px_12px_hsl(var(--primary)/0.3)] break-words whitespace-pre-wrap"
                    typingSpeed={60}
                    deletingSpeed={30}
                    pauseDuration={3000}
                  />
                </span>
              </h1>

              <div className="flex flex-wrap items-center gap-6 text-xs font-black tracking-[0.3em] uppercase text-muted-foreground/40">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-primary/60" />
                  <span>Curated Curriculum</span>
                </div>
                <div className="h-1.5 w-1.5 rounded-full bg-primary/20" />
                <div className="flex items-center gap-2 text-foreground/60">
                  <Users className="h-4 w-4" />
                  <span>Elite Ecosystem</span>
                </div>
              </div>
            </div>

            {/* Description */}
            <p className="text-xl text-muted-foreground/80 leading-relaxed max-w-2xl font-medium border-l-2 border-primary/20 pl-6">
              Accelerate your engineering trajectory with practitioner-led AI modules. We provide the blueprint, the tools, and the terminal access you need to lead.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 sm:gap-5 pt-4 w-full">
              <Link href="/courses" className="w-full sm:w-auto sm:flex-1 sm:flex-none">
                <Button size="lg" variant="premium" className="w-full sm:px-10 h-14 rounded-2xl text-lg shadow-2xl shadow-primary/20 group whitespace-nowrap">
                  Explore Mastery
                  <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-2" />
                </Button>
              </Link>
              <Link href="/learning-paths" className="w-full sm:w-auto sm:flex-1 sm:flex-none">
                <Button size="lg" variant="outline" className="w-full sm:px-10 h-14 rounded-2xl border-2 font-bold hover:bg-accent/50 transition-all whitespace-nowrap">
                  Learning Paths
                </Button>
              </Link>
            </div>

            {/* Trust Badges */}
            <div className="flex flex-wrap items-center gap-x-4 gap-y-3 sm:gap-x-8 sm:gap-y-4 pt-10 border-t border-border/50">
              {[
                { icon: Lock, label: "Verified Access" },
                { icon: BarChart, label: "Live Analytics" },
                { icon: GraduationCap, label: "Lifetime Rights" },
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-muted-foreground/30 hover:text-primary/60 transition-colors cursor-default whitespace-nowrap">
                  <item.icon className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                  <span>{item.label}</span>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Right Column - Artistic Stats Grid */}
          {stats.totalCourses > 0 && (
            <motion.div
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2, ease: [0.23, 1, 0.32, 1] }}
              className="lg:col-span-5 relative hidden lg:block"
            >
              {/* Background Glows */}
              <div className="absolute -inset-10 bg-primary/10 blur-[100px] rounded-full opacity-50 animate-pulse" />
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[120%] w-[120%] bg-premium-gradient opacity-[0.03] rounded-full blur-[80px]" />

              <div className="grid grid-cols-2 gap-5 relative z-10">
                {/* Stats Cards with deliberate artistic "off-grid" feel */}
                <div className="space-y-5 pt-12">
                  <Card glass className="p-8 border-white/10 hover:border-primary/30 transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl group">
                    <BookOpen className="h-10 w-10 text-primary mb-6 group-hover:scale-110 transition-transform" />
                    <p className="text-4xl font-black tracking-tighter mb-1">{stats.totalCourses}</p>
                    <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground/60">Expert Modules</p>
                  </Card>

                  {stats.totalReviews > 0 && (
                    <Card glass className="p-8 border-white/10 hover:border-amber-500/20 transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl group">
                      <Star className="h-10 w-10 text-amber-500 fill-amber-500 mb-6 group-hover:rotate-12 transition-transform" />
                      <p className="text-4xl font-black tracking-tighter mb-1">{stats.averageRating.toFixed(1)}</p>
                      <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground/60">Average Rating</p>
                    </Card>
                  )}
                </div>

                <div className="space-y-5">
                  {stats.totalStudents >= 50 && (
                    <Card glass className="p-8 border-white/10 hover:border-primary/30 transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl group">
                      <Users className="h-10 w-10 text-primary mb-6 group-hover:scale-110 transition-transform" />
                      <p className="text-4xl font-black tracking-tighter mb-1">{stats.totalStudents.toLocaleString()}+</p>
                      <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground/60">Engineers Trained</p>
                    </Card>
                  )}

                  {stats.totalLessons > 0 && (
                    <Card glass className="p-8 border-white/10 hover:border-primary/30 transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl group">
                      <Zap className="h-10 w-10 text-primary mb-6 group-hover:scale-110 transition-transform" />
                      <p className="text-4xl font-black tracking-tighter mb-1">{stats.totalLessons.toLocaleString()}</p>
                      <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground/60">Learning Units</p>
                    </Card>
                  )}
                </div>
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
            <div className="flex gap-4 overflow-x-auto snap-x snap-mandatory -mx-5 px-5 sm:mx-0 sm:px-0 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
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
        {/* Trusted By Section - Dynamic Logos */}
        {heroLogos.filter(l => l.visible).length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.8 }}
            className="mt-24 sm:mt-32 pt-12 border-t border-border/50"
          >
            <p className="text-center text-sm font-semibold text-muted-foreground/60 mb-8 uppercase tracking-[0.2em]">
              Trusted by professionals at
            </p>
            <div className="flex flex-wrap justify-center items-center gap-8 sm:gap-12 lg:gap-16">
              {heroLogos
                .filter((logo) => logo.visible)
                .map((logo) => renderLogo(logo))}
            </div>
          </motion.div>
        )}
      </div>
    </section>
  );
}
