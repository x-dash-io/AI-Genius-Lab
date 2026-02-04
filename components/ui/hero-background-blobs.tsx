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
    <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
      {/* Primary Blob - Top Left - Purple/Blue */}
      <motion.div
        className="absolute -top-20 -left-20 w-[500px] h-[500px] rounded-full blur-3xl opacity-60 dark:opacity-40"
        style={{
          background: "radial-gradient(circle, hsl(262 83% 58% / 0.8), hsl(262 83% 58% / 0.3))",
          willChange: "transform",
          transform: "translateZ(0)",
        }}
        variants={blobVariants}
        animate="animate"
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: "linear",
          repeatType: "reverse",
        }}
      />

      {/* Secondary Blob - Top Right - Pink/Red */}
      <motion.div
        className="absolute top-10 -right-10 w-[400px] h-[400px] rounded-full blur-3xl opacity-50 dark:opacity-35"
        style={{
          background: "radial-gradient(circle, hsl(346 77% 50% / 0.7), hsl(346 77% 50% / 0.2))",
          willChange: "transform",
          transform: "translateZ(0)",
        }}
        animate={shouldReduceMotion ? {} : {
          x: [0, -40, 0],
          y: [0, 50, 0],
        }}
        transition={{
          duration: 25,
          repeat: Infinity,
          ease: "linear",
          repeatType: "reverse",
        }}
      />

      {/* Accent Blob - Bottom Left - Blue/Cyan */}
      <motion.div
        className="absolute bottom-20 left-10 w-[450px] h-[450px] rounded-full blur-3xl opacity-55 dark:opacity-35"
        style={{
          background: "radial-gradient(circle, hsl(199 89% 48% / 0.7), hsl(199 89% 48% / 0.25))",
          willChange: "transform",
          transform: "translateZ(0)",
        }}
        animate={shouldReduceMotion ? {} : {
          x: [0, 60, 0],
          y: [0, -30, 0],
        }}
        transition={{
          duration: 30,
          repeat: Infinity,
          ease: "linear",
          repeatType: "reverse",
        }}
      />
    </div>
  );
}
