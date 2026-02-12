"use client";

import React from "react";
import { motion } from "framer-motion";
import type { HeroLogo } from "@/lib/settings";
import { Route, type LucideIcon } from "lucide-react";
import * as LucideIcons from "lucide-react";

interface Props {
  logos: HeroLogo[];
  direction?: "left" | "right";
  speed?: number;
}

export default function HeroLogosCarousel({
  logos,
  direction = "right",
  speed = 20,
}: Props) {
  if (logos.length === 0) {
    return null;
  }

  const slides = [...logos, ...logos];
  const animateFrom = direction === "right" ? "0%" : "-50%";
  const animateTo = direction === "right" ? "-50%" : "0%";

  const renderLogo = (logo: HeroLogo, index: number) => {
    if (logo.type === "icon") {
      const iconCandidate = LucideIcons[logo.value as keyof typeof LucideIcons];
      const Icon: LucideIcon =
        typeof iconCandidate === "function" ? (iconCandidate as LucideIcon) : Route;

      return (
        <div
          key={`${logo.id}-${index}`}
          className="mx-4 flex h-10 flex-shrink-0 items-center justify-center sm:h-14 group"
          title={logo.name}
        >
          <Icon
            className="h-6 w-6 text-muted-foreground/60 transition-colors duration-300 group-hover:text-primary sm:h-8 sm:w-8"
          />
        </div>
      );
    }

    return (
      <div
        key={`${logo.id}-${index}`}
        className="group relative mx-4 flex h-10 flex-shrink-0 items-center justify-center sm:h-14"
      >
        <motion.img
          src={logo.value}
          alt={logo.name}
          title={logo.name}
          className="h-full w-auto object-contain opacity-60 grayscale transition-all duration-300 group-hover:opacity-100 group-hover:grayscale-0"
          onError={(e) => {
            (e.target as HTMLImageElement).style.display = "none";
          }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95, filter: "grayscale(0%)" }}
        />
      </div>
    );
  };

  return (
    <div className="relative w-full overflow-hidden">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-y-0 left-0 z-10 w-14 bg-gradient-to-r from-background to-transparent"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-y-0 right-0 z-10 w-14 bg-gradient-to-l from-background to-transparent"
      />

      <motion.div
        className="flex w-max items-center will-change-transform"
        animate={{ x: [animateFrom, animateTo] }}
        transition={{
          ease: "linear",
          duration: speed,
          repeat: Infinity,
        }}
      >
        {slides.map(renderLogo)}
      </motion.div>
    </div>
  );
}
