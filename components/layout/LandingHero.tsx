"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Lock, BarChart, GraduationCap, Sparkles, Zap, Users, BookOpen, Star, ArrowRight } from "lucide-react";
import * as LucideIcons from "lucide-react";
import { TypingAnimation } from "@/components/ui/typing-animation";
import { HeroPattern } from "@/components/ui/hero-pattern";
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
    <section className="relative py-12 sm:py-16 lg:py-20 min-h-0 overflow-hidden">
      {/* Background Ambience */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full max-w-7xl opacity-30">
          <HeroPattern className="w-full h-full opacity-50" />
        </div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[500px] w-[500px] bg-primary/20 blur-[120px] rounded-full opacity-40 mix-blend-screen" />
      </div>

      <div className="w-full max-w-7xl mx-auto px-5 sm:px-6 lg:px-8 relative z-10">

        {/* Central Content Column */}
        <div className="flex flex-col items-center text-center space-y-10 max-w-4xl mx-auto">

          {/* Badge / Pill */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-bold uppercase tracking-widest"
          >
            <Sparkles className="h-3 w-3" />
            <span>Curated Curriculum</span>
          </motion.div>

          {/* Heading */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="space-y-4"
          >
            <h1 className="font-display text-4xl sm:text-6xl md:text-7xl font-black tracking-tight leading-[1.1] text-foreground">
              Master AI With <br className="hidden sm:block" />
              <span className="block mt-2">
                <TypingAnimation
                  words={typingWords}
                  className="text-primary drop-shadow-[0_4px_12px_hsl(var(--primary)/0.3)]"
                  typingSpeed={60}
                  deletingSpeed={30}
                  pauseDuration={3000}
                />
              </span>
            </h1>
            <p className="text-xl sm:text-2xl text-muted-foreground/80 leading-relaxed max-w-2xl mx-auto font-medium">
              Accelerate your engineering trajectory with practitioner-led AI modules.
            </p>
          </motion.div>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto"
          >
            <Link href="/courses" className="w-full sm:w-auto">
              <Button size="lg" variant="premium" className="w-full sm:px-10 h-14 rounded-2xl text-lg shadow-2xl shadow-primary/20 group whitespace-nowrap">
                Explore Mastery
                <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-2" />
              </Button>
            </Link>
            <Link href="/learning-paths" className="w-full sm:w-auto">
              <Button size="lg" variant="secondary" className="w-full sm:px-10 h-14 rounded-2xl font-bold whitespace-nowrap backdrop-blur-sm">
                Learning Paths
              </Button>
            </Link>
          </motion.div>

          {/* Trusted By Section (Logos) */}
          {heroLogos.filter(l => l.visible).length > 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="pt-8 sm:pt-12 w-full"
            >
              <p className="text-center text-xs font-bold text-muted-foreground/40 mb-6 uppercase tracking-[0.2em]">
                Trusted by professionals at
              </p>
              <div className="flex flex-wrap justify-center items-center gap-8 sm:gap-12 lg:gap-16 opacity-70 grayscale hover:grayscale-0 transition-all duration-500">
                {heroLogos
                  .filter((logo) => logo.visible)
                  .map((logo) => renderLogo(logo))}
              </div>
            </motion.div>
          )}

        </div>

        {/* Stats Grid - Bottom */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6, ease: [0.23, 1, 0.32, 1] }}
          className="mt-20 sm:mt-24 grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 lg:gap-8"
        >
          {stats.totalCourses > 0 && (
            <Card glass className="p-6 sm:p-8 border-white/10 hover:border-primary/30 transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl group text-center flex flex-col items-center justify-center">
              <div className="p-3 rounded-full bg-primary/10 mb-4 group-hover:scale-110 transition-transform duration-300">
                <BookOpen className="h-6 w-6 sm:h-8 sm:w-8 text-primary" />
              </div>
              <p className="text-3xl sm:text-4xl font-black tracking-tighter mb-1 text-foreground">{stats.totalCourses}</p>
              <p className="text-[10px] sm:text-xs font-bold uppercase tracking-widest text-muted-foreground/70">Expert Modules</p>
            </Card>
          )}

          {stats.totalStudents >= 50 && (
            <Card glass className="p-6 sm:p-8 border-white/10 hover:border-primary/30 transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl group text-center flex flex-col items-center justify-center">
              <div className="p-3 rounded-full bg-primary/10 mb-4 group-hover:scale-110 transition-transform duration-300">
                <Users className="h-6 w-6 sm:h-8 sm:w-8 text-primary" />
              </div>
              <p className="text-3xl sm:text-4xl font-black tracking-tighter mb-1 text-foreground">{stats.totalStudents.toLocaleString()}+</p>
              <p className="text-[10px] sm:text-xs font-bold uppercase tracking-widest text-muted-foreground/70">Engineers Trained</p>
            </Card>
          )}

          {stats.totalLessons > 0 && (
            <Card glass className="p-6 sm:p-8 border-white/10 hover:border-primary/30 transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl group text-center flex flex-col items-center justify-center">
              <div className="p-3 rounded-full bg-primary/10 mb-4 group-hover:scale-110 transition-transform duration-300">
                <Zap className="h-6 w-6 sm:h-8 sm:w-8 text-primary" />
              </div>
              <p className="text-3xl sm:text-4xl font-black tracking-tighter mb-1 text-foreground">{stats.totalLessons.toLocaleString()}</p>
              <p className="text-[10px] sm:text-xs font-bold uppercase tracking-widest text-muted-foreground/70">Learning Units</p>
            </Card>
          )}

          {stats.totalReviews > 0 && (
            <Card glass className="p-6 sm:p-8 border-white/10 hover:border-amber-500/20 transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl group text-center flex flex-col items-center justify-center">
              <div className="p-3 rounded-full bg-amber-500/10 mb-4 group-hover:rotate-12 transition-transform duration-300">
                <Star className="h-6 w-6 sm:h-8 sm:w-8 text-amber-500 fill-amber-500" />
              </div>
              <p className="text-3xl sm:text-4xl font-black tracking-tighter mb-1 text-foreground">{stats.averageRating.toFixed(1)}</p>
              <p className="text-[10px] sm:text-xs font-bold uppercase tracking-widest text-muted-foreground/70">Average Rating</p>
            </Card>
          )}
        </motion.div>

        {/* Small Trust Indicators */}
        <div className="mt-12 sm:mt-16 flex flex-wrap justify-center gap-6 sm:gap-10 border-t border-border/40 pt-8 opacity-60">
          {[
            { icon: Lock, label: "Verified Access" },
            { icon: BarChart, label: "Live Analytics" },
            { icon: GraduationCap, label: "Lifetime Rights" },
          ].map((item, i) => (
            <div key={i} className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-muted-foreground hover:text-primary transition-colors cursor-default whitespace-nowrap">
              <item.icon className="h-3.5 w-3.5" />
              <span>{item.label}</span>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
