"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";

export function FinalCTA() {
  return (
    <section className="grid gap-6 text-center">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        className="grid gap-4"
      >
        <h2 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">
          Start Learning AI the Right Way
        </h2>
        <div className="flex flex-wrap justify-center items-center gap-4">
          <Link href="/courses">
            <Button size="lg">Browse Courses</Button>
          </Link>
          <Link href="/sign-up">
            <Button variant="outline" size="lg">Create Free Account</Button>
          </Link>
        </div>
        <p className="text-sm text-muted-foreground mt-4">
          Pay once per course. Lifetime access. No recurring fees.
        </p>
      </motion.div>
    </section>
  );
}
