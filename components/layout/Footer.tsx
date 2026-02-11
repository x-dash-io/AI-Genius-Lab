"use client";

import Link from "next/link";
import Image from "next/image";
import type { ComponentType } from "react";
import {
  Facebook,
  Github,
  Globe,
  Instagram,
  Linkedin,
  Link as LinkIcon,
  MessageCircle,
  Twitter,
  Youtube,
} from "lucide-react";
import { type SocialLink } from "@/lib/settings";

interface FooterProps {
  socialLinks?: SocialLink[] | Record<string, string>;
}

const iconMap: Record<string, ComponentType<{ className?: string }>> = {
  facebook: Facebook,
  twitter: Twitter,
  linkedin: Linkedin,
  instagram: Instagram,
  youtube: Youtube,
  github: Github,
  discord: MessageCircle,
  website: Globe,
  other: LinkIcon,
};

function normalizeLinks(socialLinks?: FooterProps["socialLinks"]): SocialLink[] {
  if (Array.isArray(socialLinks)) {
    return socialLinks;
  }

  if (socialLinks && typeof socialLinks === "object") {
    return Object.entries(socialLinks).map(([platform, url]) => ({
      id: platform,
      platform,
      url,
      visible: Boolean(url) && url !== "#",
    }));
  }

  return [];
}

export function Footer({ socialLinks }: FooterProps) {
  const links = normalizeLinks(socialLinks).filter((link) => link.visible && link.url && link.url !== "#");

  return (
    <footer className="mt-12 border-t border-border/80 bg-card/60">
      <div className="mx-auto grid w-full max-w-7xl gap-10 px-4 py-12 sm:px-6 lg:grid-cols-[1.2fr_1fr_1fr]">
        <div className="space-y-5">
          <Link href="/" className="inline-flex items-center" aria-label="AI Genius Lab home">
            <Image src="/logo.png" alt="AI Genius Lab" width={144} height={34} className="h-9 w-auto object-contain" priority />
          </Link>
          <p className="max-w-sm text-sm text-muted-foreground">
            Outcome-driven AI education with structured learning paths, practical coursework, and clear progress tracking.
          </p>
          {links.length ? (
            <div className="flex flex-wrap items-center gap-2">
              {links.map((social) => {
                const Icon = iconMap[social.platform.toLowerCase()] || LinkIcon;
                return (
                  <Link
                    key={social.id || social.platform}
                    href={social.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex h-9 w-9 items-center justify-center rounded-full border text-muted-foreground hover:border-primary/40 hover:text-primary"
                    aria-label={social.platform}
                  >
                    <Icon className="h-4 w-4" />
                  </Link>
                );
              })}
            </div>
          ) : null}
        </div>

        <div className="space-y-3">
          <h4 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Learn</h4>
          <div className="grid gap-2 text-sm">
            <Link href="/courses" className="hover:text-primary">Courses</Link>
            <Link href="/learning-paths" className="hover:text-primary">Learning Paths</Link>
            <Link href="/pricing" className="hover:text-primary">Pricing</Link>
            <Link href="/blog" className="hover:text-primary">Blog</Link>
          </div>
        </div>

        <div className="space-y-3">
          <h4 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Company</h4>
          <div className="grid gap-2 text-sm">
            <Link href="/about" className="hover:text-primary">About</Link>
            <Link href="/contact" className="hover:text-primary">Contact</Link>
            <Link href="/faq" className="hover:text-primary">FAQ</Link>
            <Link href="/testimonials" className="hover:text-primary">Testimonials</Link>
          </div>
        </div>
      </div>

      <div className="border-t border-border/70">
        <div className="mx-auto flex w-full max-w-7xl flex-col gap-3 px-4 py-4 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <p>© {new Date().getFullYear()} AI Genius Lab. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <Link href="/privacy" className="hover:text-primary">Privacy</Link>
            <Link href="/terms" className="hover:text-primary">Terms</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
