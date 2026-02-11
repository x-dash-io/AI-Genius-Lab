"use client";

/** LEGACY UI COMPONENT
 * Retained only for older decorative screens.
 * Do not use for new UI work; use minimal tokenized backgrounds.
 */
import { motion } from "framer-motion";

export function BackgroundBlobs() {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
      {/* Blob 1 - Top Left - Purple/Blue */}
      <motion.div
        className="absolute -top-40 -left-40 w-96 h-96 rounded-full blur-3xl opacity-50 dark:opacity-30"
        style={{
          background: "radial-gradient(circle, hsl(262 83% 58% / 0.6), hsl(262 83% 58% / 0.2))",
        }}
        animate={{
          x: [0, 50, 0],
          y: [0, 30, 0],
          scale: [1, 1.1, 1],
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
      
      {/* Blob 2 - Top Right - Pink/Red */}
      <motion.div
        className="absolute -top-20 -right-40 w-96 h-96 rounded-full blur-3xl opacity-50 dark:opacity-30"
        style={{
          background: "radial-gradient(circle, hsl(346 77% 50% / 0.6), hsl(346 77% 50% / 0.2))",
        }}
        animate={{
          x: [0, -40, 0],
          y: [0, 50, 0],
          scale: [1, 1.2, 1],
        }}
        transition={{
          duration: 25,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
      
      {/* Blob 3 - Bottom Left - Blue/Cyan */}
      <motion.div
        className="absolute bottom-0 left-0 w-96 h-96 rounded-full blur-3xl opacity-50 dark:opacity-30"
        style={{
          background: "radial-gradient(circle, hsl(199 89% 48% / 0.6), hsl(199 89% 48% / 0.2))",
        }}
        animate={{
          x: [0, 60, 0],
          y: [0, -40, 0],
          scale: [1, 1.15, 1],
        }}
        transition={{
          duration: 30,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
      
      {/* Blob 4 - Bottom Right - Orange/Yellow */}
      <motion.div
        className="absolute -bottom-40 -right-20 w-96 h-96 rounded-full blur-3xl opacity-50 dark:opacity-30"
        style={{
          background: "radial-gradient(circle, hsl(38 92% 50% / 0.6), hsl(38 92% 50% / 0.2))",
        }}
        animate={{
          x: [0, -50, 0],
          y: [0, 30, 0],
          scale: [1, 1.1, 1],
        }}
        transition={{
          duration: 22,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
      
      {/* Blob 5 - Center - Green/Teal */}
      <motion.div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full blur-3xl opacity-35 dark:opacity-25"
        style={{
          background: "radial-gradient(circle, hsl(142 76% 36% / 0.5), hsl(142 76% 36% / 0.1))",
        }}
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.35, 0.45, 0.35],
        }}
        transition={{
          duration: 15,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
    </div>
  );
}
