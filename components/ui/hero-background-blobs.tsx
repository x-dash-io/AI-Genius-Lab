"use client";

import { motion, useReducedMotion } from "framer-motion";

export function HeroBackgroundBlobs() {
  const shouldReduceMotion = useReducedMotion();

  const blobVariants = {
    animate: shouldReduceMotion ? {} : {
      x: [0, 50, 0],
      y: [0, 30, 0],
    }
  };

  return (
    <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none select-none">
      {/* Primary Blob - Top Left - Indigo/Primary */}
      <motion.div
        className="absolute -top-20 -left-20 w-[600px] h-[600px] rounded-full blur-[100px] opacity-40 dark:opacity-20"
        style={{
          background: "radial-gradient(circle, hsl(var(--primary) / 0.8), transparent)",
          willChange: "transform",
        }}
        animate={shouldReduceMotion ? {} : {
          x: [0, 80, 0],
          y: [0, 40, 0],
          scale: [1, 1.1, 1],
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      {/* Secondary Blob - Top Right - Accent/Purple */}
      <motion.div
        className="absolute top-[10%] -right-20 w-[500px] h-[500px] rounded-full blur-[120px] opacity-30 dark:opacity-15"
        style={{
          background: "radial-gradient(circle, hsl(262 83% 58% / 0.7), transparent)",
          willChange: "transform",
        }}
        animate={shouldReduceMotion ? {} : {
          x: [0, -60, 0],
          y: [0, 80, 0],
          scale: [1, 1.05, 1],
        }}
        transition={{
          duration: 25,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      {/* Accent Blob - Bottom Left - Sky/Cyan */}
      <motion.div
        className="absolute bottom-[-10%] left-[-5%] w-[550px] h-[550px] rounded-full blur-[100px] opacity-25 dark:opacity-10"
        style={{
          background: "radial-gradient(circle, hsl(199 89% 48% / 0.6), transparent)",
          willChange: "transform",
        }}
        animate={shouldReduceMotion ? {} : {
          x: [0, 100, 0],
          y: [0, -50, 0],
          scale: [1, 1.15, 1],
        }}
        transition={{
          duration: 30,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      {/* Noise Texture Overlay for subtle grains */}
      <div className="absolute inset-0 opacity-[0.07] dark:opacity-[0.05] pointer-events-none" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }}></div>
    </div>
  );
}
