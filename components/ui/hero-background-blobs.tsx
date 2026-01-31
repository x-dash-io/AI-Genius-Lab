"use client";

import { motion } from "framer-motion";

export function HeroBackgroundBlobs() {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
      {/* Hero-specific larger, more prominent blobs */}
      
      {/* Primary Blob - Top Left - Purple/Blue */}
      <motion.div
        className="absolute -top-20 -left-20 w-[500px] h-[500px] rounded-full blur-3xl opacity-60 dark:opacity-40"
        style={{
          background: "radial-gradient(circle, hsl(262 83% 58% / 0.8), hsl(262 83% 58% / 0.3))",
        }}
        animate={{
          x: [0, 80, 0],
          y: [0, 60, 0],
          scale: [1, 1.2, 1],
        }}
        transition={{
          duration: 25,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
      
      {/* Secondary Blob - Top Right - Pink/Red */}
      <motion.div
        className="absolute top-10 -right-10 w-[400px] h-[400px] rounded-full blur-3xl opacity-50 dark:opacity-35"
        style={{
          background: "radial-gradient(circle, hsl(346 77% 50% / 0.7), hsl(346 77% 50% / 0.2))",
        }}
        animate={{
          x: [0, -60, 0],
          y: [0, 80, 0],
          scale: [1, 1.3, 1],
        }}
        transition={{
          duration: 30,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
      
      {/* Accent Blob - Bottom Left - Blue/Cyan */}
      <motion.div
        className="absolute bottom-20 left-10 w-[450px] h-[450px] rounded-full blur-3xl opacity-55 dark:opacity-35"
        style={{
          background: "radial-gradient(circle, hsl(199 89% 48% / 0.7), hsl(199 89% 48% / 0.25))",
        }}
        animate={{
          x: [0, 100, 0],
          y: [0, -50, 0],
          scale: [1, 1.25, 1],
        }}
        transition={{
          duration: 35,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
      
      {/* Warm Blob - Bottom Right - Orange/Yellow */}
      <motion.div
        className="absolute -bottom-10 right-20 w-[350px] h-[350px] rounded-full blur-3xl opacity-45 dark:opacity-30"
        style={{
          background: "radial-gradient(circle, hsl(38 92% 50% / 0.6), hsl(38 92% 50% / 0.2))",
        }}
        animate={{
          x: [0, -70, 0],
          y: [0, 40, 0],
          scale: [1, 1.15, 1],
        }}
        transition={{
          duration: 28,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
      
      {/* Center Glow - Green/Teal - More subtle */}
      <motion.div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] rounded-full blur-3xl opacity-25 dark:opacity-20"
        style={{
          background: "radial-gradient(circle, hsl(142 76% 36% / 0.4), hsl(142 76% 36% / 0.1))",
        }}
        animate={{
          scale: [1, 1.3, 1],
          opacity: [0.25, 0.35, 0.25],
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
    </div>
  );
}
