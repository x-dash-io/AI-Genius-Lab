"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Lock, BarChart, GraduationCap, Sparkles } from "lucide-react";
import { TypingAnimation } from "@/components/ui/typing-animation";

export function LandingHero() {
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
      </motion.div>
      
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
            View Launch Curriculum
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
