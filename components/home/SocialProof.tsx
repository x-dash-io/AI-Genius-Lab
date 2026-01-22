"use client";

import { motion } from "framer-motion";

const proofPoints = [
  "Built with modern AI learners in mind",
  "Designed for focused, outcome-driven learning",
  "Structured like a real curriculum — not YouTube chaos",
];

export function SocialProof() {
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
