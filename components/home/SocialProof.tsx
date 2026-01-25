"use client";

import { motion } from "framer-motion";
import { Users, BookOpen, Star, TrendingUp } from "lucide-react";
import type { HomepageStats } from "@/lib/homepage-stats";

interface SocialProofProps {
  stats: HomepageStats;
}

export function SocialProof({ stats }: SocialProofProps) {
  const metrics = [
    {
      icon: BookOpen,
      value: stats.totalCourses,
      label: "Premium Courses",
      show: stats.totalCourses > 0,
    },
    {
      icon: Users,
      value: stats.totalStudents,
      label: "Active Learners",
      show: stats.totalStudents >= 50,
    },
    {
      icon: Star,
      value: stats.averageRating > 0 ? `${stats.averageRating.toFixed(1)}/5` : null,
      label: `${stats.totalReviews} Reviews`,
      show: stats.totalReviews > 0,
    },
    {
      icon: TrendingUp,
      value: stats.totalLessons,
      label: "Lessons Available",
      show: stats.totalLessons > 0,
    },
  ].filter((metric) => metric.show);

  // If no metrics to show, display trust points
  if (metrics.length === 0) {
    const proofPoints = [
      "Built with modern AI learners in mind",
      "Designed for focused, outcome-driven learning",
      "Structured like a real curriculum — not YouTube chaos",
    ];

    return (
      <section className="grid gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center"
        >
          <h2 className="font-display text-2xl font-bold tracking-tight sm:text-3xl">
            Trusted by Learners
          </h2>
          <div className="mt-6 flex flex-wrap justify-center gap-6 text-muted-foreground">
            {proofPoints.map((point, index) => (
              <motion.p
                key={index}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="text-sm"
              >
                {point}
              </motion.p>
            ))}
          </div>
        </motion.div>
      </section>
    );
  }

  return (
    <section className="grid gap-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        className="text-center"
      >
        <h2 className="font-display text-2xl font-bold tracking-tight sm:text-3xl">
          Trusted by Learners Worldwide
        </h2>
        <p className="mt-2 text-muted-foreground">
          Join learners mastering AI through structured learning
        </p>
      </motion.div>

      <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
        {metrics.map((metric, index) => {
          const Icon = metric.icon;
          return (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="flex flex-col items-center text-center gap-3"
            >
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
                <Icon className="h-7 w-7 text-primary" />
              </div>
              <div>
                <p className="text-3xl font-bold">{metric.value?.toLocaleString()}</p>
                <p className="text-sm text-muted-foreground mt-1">{metric.label}</p>
              </div>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}
