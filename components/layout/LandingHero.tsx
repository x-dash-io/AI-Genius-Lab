"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Check } from "lucide-react";
import { TypingAnimation } from "@/components/ui/typing-animation";

export function LandingHero() {
  const typingWords = [
    "structured paths",
    "verified access",
    "real outcomes",
    "premium learning",
    "secure commerce",
  ];

  return (
    <section className="grid gap-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="grid gap-6"
      >
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-muted-foreground">
          AI Courses E-commerce Platform
        </p>
        <h1 className="font-display text-5xl font-bold tracking-tight sm:text-6xl">
          Learn AI with{" "}
          <span className="relative inline-block">
            <TypingAnimation
              words={typingWords}
              className="text-primary"
              typingSpeed={80}
              deletingSpeed={40}
              pauseDuration={2500}
            />
          </span>
          .
        </h1>
        <p className="max-w-2xl text-lg text-muted-foreground">
          Synapze combines premium AI learning with secure commerce. Buy a
          course, unlock the full path, and track progress across every lesson.
        </p>
      </motion.div>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="flex flex-wrap items-center gap-4"
      >
        <Link href="/courses" className="inline-block">
          <Button size="lg" className="w-full sm:w-auto">Browse courses</Button>
        </Link>
        <Link href="/dashboard" className="inline-block">
          <Button variant="outline" size="lg" className="w-full sm:w-auto">
            Customer dashboard
          </Button>
        </Link>
      </motion.div>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <Card>
          <CardHeader>
            <CardTitle>What ships in the MVP:</CardTitle>
            <CardDescription>
              Core features for a complete learning platform
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="grid gap-3">
              <li className="flex items-start gap-3">
                <Check className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
                <span className="text-sm">
                  Secure login, pay-gated course access, and progress tracking.
                </span>
              </li>
              <li className="flex items-start gap-3">
                <Check className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
                <span className="text-sm">
                  Stripe checkout and verified webhook-based course grants.
                </span>
              </li>
              <li className="flex items-start gap-3">
                <Check className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
                <span className="text-sm">
                  Course catalog, learner library, and lesson viewer scaffolding.
                </span>
              </li>
            </ul>
          </CardContent>
        </Card>
      </motion.div>
    </section>
  );
}
