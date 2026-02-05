"use client";

import { motion } from "framer-motion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Filter, Shield, Route, TrendingUp, BookOpen, Users } from "lucide-react";
import type { HomepageStats } from "@/lib/homepage-stats";

interface TrustSectionProps {
  stats: HomepageStats;
}

export function TrustSection({ stats }: TrustSectionProps) {
  const trustCards = [
    {
      icon: Filter,
      title: "Curated, Not Crowded",
      description: stats.totalCourses > 0
        ? `${stats.totalCourses} carefully selected AI courses — no filler, no outdated content.`
        : "Only proven AI courses — no filler, no outdated content.",
    },
    {
      icon: Shield,
      title: "Buy Once, Learn Forever",
      description: "Pay once, unlock full courses with lifetime access.",
    },
    {
      icon: Route,
      title: "Structured Learning Paths",
      description: stats.categoriesWithCourses.length > 0
        ? `Courses organized across ${stats.categoriesWithCourses.length} categories by outcomes, not creators.`
        : "Courses organized by outcomes, not creators.",
    },
    {
      icon: TrendingUp,
      title: "Progress You Can See",
      description: "Track lessons completed, progress %, and activity history with detailed analytics.",
    },
  ];

  return (
    <section className="w-full max-w-7xl mx-auto px-5 sm:px-6 lg:px-8">
      <div className="grid gap-8">
        <div className="text-center">
          <h2 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">
            Why AI Genius Lab?
          </h2>
          <p className="mt-2 text-lg text-muted-foreground">
            Built for focused, outcome-driven learning
          </p>
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {trustCards.map((card, index) => {
            const Icon = card.icon;
            return (
              <motion.div
                key={card.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <Card className="h-full">
                  <CardHeader>
                    <Icon className="h-8 w-8 text-primary mb-2" />
                    <CardTitle className="text-lg">{card.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription>{card.description}</CardDescription>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
