"use client";

import React from "react";
import { motion } from "framer-motion";

interface BlogHeroProps {
  title: string;
  subtitle?: string;
}

export default function BlogHero({ title, subtitle }: BlogHeroProps) {
  return (
    <section className="relative overflow-hidden">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage:
            "radial-gradient(circle at 16% 14%, hsl(var(--primary) / 0.18), transparent 42%), radial-gradient(circle at 84% 10%, hsl(var(--primary) / 0.12), transparent 34%), linear-gradient(to right, hsl(var(--foreground) / 0.03) 1px, transparent 1px), linear-gradient(to bottom, hsl(var(--foreground) / 0.02) 1px, transparent 1px)",
          backgroundSize: "auto, auto, 24px 24px, 24px 24px",
        }}
      />
      <div className="relative z-[1] mx-auto max-w-7xl px-5">
        <motion.div
          className="text-center py-16 space-y-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="text-5xl font-extrabold font-display">{title}</h1>
          {subtitle ? <p className="mx-auto max-w-2xl text-muted-foreground">{subtitle}</p> : null}
        </motion.div>
      </div>
    </section>
  );
}
