"use client";

import { motion } from "framer-motion";
import { BookOpen, Lock, Zap, BarChart } from "lucide-react";

const steps = [
  {
    icon: BookOpen,
    title: "Browse curated AI courses",
    description: "Explore courses organized by outcomes and skill level.",
  },
  {
    icon: Lock,
    title: "Purchase securely with PayPal",
    description: "One-time payment, instant access to full course content.",
  },
  {
    icon: Zap,
    title: "Access full lessons instantly",
    description: "Start learning immediately after purchase confirmation.",
  },
  {
    icon: BarChart,
    title: "Track progress in your library",
    description: "Monitor completion, resume where you left off, and see your learning journey.",
  },
];

export function HowItWorks() {
  return (
    <section className="w-full max-w-7xl mx-auto px-5 sm:px-6 lg:px-8">
      <div className="grid gap-8">
        <div className="text-center">
          <h2 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">
            How Learning Works
          </h2>
          <p className="mt-2 text-lg text-muted-foreground">
            A simple, structured path to mastering AI
          </p>
        </div>
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          {steps.map((step, index) => {
            const Icon = step.icon;
            return (
              <motion.div
                key={step.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="relative"
              >
                <div className="flex flex-col items-center text-center gap-4">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                    <Icon className="h-8 w-8 text-primary" />
                  </div>
                  <div className="grid gap-2">
                    <div className="flex items-center justify-center gap-2">
                      <span className="text-sm font-semibold text-primary">
                        Step {index + 1}
                      </span>
                    </div>
                    <h3 className="text-lg font-semibold">{step.title}</h3>
                    <p className="text-sm text-muted-foreground">
                      {step.description}
                    </p>
                  </div>
                </div>
                {index < steps.length - 1 && (
                  <div className="hidden lg:block absolute top-8 left-full w-full h-0.5 bg-border -z-10" style={{ width: 'calc(100% - 4rem)', marginLeft: '2rem' }} />
                )}
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
