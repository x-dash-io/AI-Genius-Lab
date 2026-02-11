"use client";

import { motion, useReducedMotion } from "framer-motion";

export function HeroBackgroundBlobs() {
  const shouldReduceMotion = useReducedMotion();

  return (
    <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none select-none">
      <motion.div
        className="absolute -top-36 -left-24 w-[72vw] max-w-[720px] h-[72vw] max-h-[720px] rounded-full blur-[115px] opacity-35 dark:opacity-28"
        style={{
          background: "radial-gradient(circle, hsl(var(--primary) / 0.45), transparent 64%)",
          willChange: "transform",
        }}
        animate={shouldReduceMotion ? {} : { x: [0, 56, 0], y: [0, 30, 0], scale: [1, 1.06, 1] }}
        transition={{ duration: 24, repeat: Infinity, ease: "easeInOut" }}
      />

      <motion.div
        className="absolute top-[6%] -right-28 w-[66vw] max-w-[620px] h-[66vw] max-h-[620px] rounded-full blur-[130px] opacity-28 dark:opacity-20"
        style={{
          background: "radial-gradient(circle, hsl(190 94% 57% / 0.26), transparent 66%)",
          willChange: "transform",
        }}
        animate={shouldReduceMotion ? {} : { x: [0, -50, 0], y: [0, 68, 0], scale: [1, 1.04, 1] }}
        transition={{ duration: 30, repeat: Infinity, ease: "easeInOut" }}
      />

      <motion.div
        className="absolute bottom-[-20%] left-[10%] w-[74vw] max-w-[700px] h-[74vw] max-h-[700px] rounded-full blur-[130px] opacity-25 dark:opacity-18"
        style={{
          background: "radial-gradient(circle, hsl(258 90% 62% / 0.18), transparent 70%)",
          willChange: "transform",
        }}
        animate={shouldReduceMotion ? {} : { x: [0, 80, 0], y: [0, -48, 0] }}
        transition={{ duration: 34, repeat: Infinity, ease: "easeInOut" }}
      />

      <div
        className="absolute inset-0 opacity-[0.04] dark:opacity-[0.03]"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E\")",
        }}
      />
    </div>
  );
}
