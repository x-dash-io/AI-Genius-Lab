"use client";

import { type ReactNode } from "react";
import { domAnimation, LazyMotion, m, useReducedMotion } from "framer-motion";
import { PageContainer } from "@/components/layout/shell";

interface AuthPageLayoutProps {
  children: ReactNode;
}

export function AuthPageLayout({ children }: AuthPageLayoutProps) {
  const prefersReducedMotion = useReducedMotion();

  return (
    <div className="relative overflow-hidden">
      <div className="pointer-events-none absolute inset-0 -z-10" aria-hidden="true">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_6%,hsl(var(--primary)/0.14),transparent_56%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(hsl(var(--foreground)/0.04)_1px,transparent_1px),linear-gradient(90deg,hsl(var(--foreground)/0.03)_1px,transparent_1px)] bg-[size:30px_30px] opacity-20" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,hsl(var(--background)/0)_44%,hsl(var(--background)/0.78)_100%)]" />
      </div>

      <PageContainer width="default" className="py-8 sm:py-10 lg:py-14">
        <LazyMotion features={domAnimation}>
          <m.div
            initial={prefersReducedMotion ? false : { opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: prefersReducedMotion ? 0 : 0.32,
              ease: [0.2, 0.8, 0.2, 1],
            }}
            className="mx-auto flex min-h-[74vh] w-full max-w-[34rem] flex-col items-center justify-center gap-4"
          >
            {children}
          </m.div>
        </LazyMotion>
      </PageContainer>
    </div>
  );
}
