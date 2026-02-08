"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import { Facebook, Linkedin, Twitter, Instagram, Youtube, Github, Globe, Link as LinkIcon, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SocialLink } from "@/lib/settings";
import Image from "next/image";

interface FooterProps {
  socialLinks?: SocialLink[] | any; // Handle both array and potential legacy object
}

const iconMap: Record<string, any> = {
  facebook: Facebook,
  twitter: Twitter,
  linkedin: Linkedin,
  instagram: Instagram,
  youtube: Youtube,
  github: Github,
  discord: MessageCircle,
  website: Globe,
  other: LinkIcon,
  tiktok: (props: any) => (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5" />
    </svg>
  ),
};

export function Footer({ socialLinks }: FooterProps) {
  const { data: session } = useSession();

  // Normalize links to array
  let links: SocialLink[] = [];

  if (Array.isArray(socialLinks)) {
    links = socialLinks;
  } else if (socialLinks && typeof socialLinks === 'object') {
    // Legacy object support
    links = Object.entries(socialLinks).map(([platform, url]) => ({
      id: platform,
      platform,
      url: url as string,
      visible: !!url && url !== "#",
    }));
  } else {
    // defaults
    links = [
      { id: "facebook", platform: "facebook", url: "#", visible: true },
      { id: "twitter", platform: "twitter", url: "#", visible: true },
      { id: "linkedin", platform: "linkedin", url: "#", visible: true },
      { id: "instagram", platform: "instagram", url: "#", visible: true },
    ];
  }

  // Filter visible links
  const visibleLinks = links.filter(link => link.visible && link.url && link.url !== "#");

  return (
    <footer className="border-t bg-card/10 backdrop-blur-md mt-20">
      <div className="mx-auto w-full max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid gap-8 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:gap-12">
          <div className="space-y-6">
            <Link href="/" className="inline-block transition-transform hover:scale-105">
              <div className="relative h-8 w-auto">
                <Image
                  src="/logo.png"
                  alt="AI Genius Lab"
                  width={120}
                  height={28}
                  className="object-contain h-8 w-auto dark:brightness-125 sm:h-10 sm:w-auto"
                  priority
                />
              </div>
            </Link>
            <p className="text-sm text-muted-foreground leading-relaxed max-w-xs sm:max-w-sm font-medium">
              Empowering the next generation of AI professionals through structured, outcome-driven learning.
            </p>
            <div className="flex gap-3 flex-wrap">
              {visibleLinks.map((social) => {
                const Icon = iconMap[social.platform.toLowerCase()] || LinkIcon;
                return (
                  <Link
                    key={social.id || social.platform}
                    href={social.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="h-10 w-10 flex items-center justify-center rounded-xl bg-accent/50 text-muted-foreground hover:bg-primary hover:text-white transition-all duration-300"
                  >
                    <Icon className="h-5 w-5" />
                    <span className="sr-only">{social.platform}</span>
                  </Link>
                );
              })}
            </div>
          </div>

          <div className="grid gap-6">
            <h4 className="text-sm font-bold uppercase tracking-widest text-foreground/80">Platform</h4>
            <nav className="grid gap-3 grid-cols-1 sm:grid-cols-2">
              {["Courses", "Learning Paths", "Blog", "Dashboard"].map((item) => (
                <Link
                  key={item}
                  href={`/${item.toLowerCase().replace(" ", "-")}`}
                  className="text-sm text-muted-foreground transition-colors hover:text-primary hover:translate-x-1 duration-200 block"
                >
                  {item}
                </Link>
              ))}
            </nav>
          </div>

          <div className="grid gap-6">
            <h4 className="text-sm font-bold uppercase tracking-widest text-foreground/80">Company</h4>
            <nav className="grid gap-3 grid-cols-1 sm:grid-cols-2">
              {["About Us", "Testimonials", "Contact Us", "FAQ"].map((item) => (
                <Link
                  key={item}
                  href={`/${item.toLowerCase().replace(" ", "-")}`}
                  className="text-sm text-muted-foreground transition-colors hover:text-primary hover:translate-x-1 duration-200 block"
                >
                  {item}
                </Link>
              ))}
            </nav>
          </div>


        </div>

        <div className="mt-16 pt-8 border-t border-border/50 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-muted-foreground/80 font-medium">
            &copy; {new Date().getFullYear()} <span className="text-foreground font-bold">AI Genius Lab</span>. Designed for professionals.
          </p>
          <nav className="flex gap-6">
            <Link href="/privacy" className="text-xs text-muted-foreground hover:text-primary transition-colors">Privacy</Link>
            <Link href="/terms" className="text-xs text-muted-foreground hover:text-primary transition-colors">Terms</Link>
          </nav>
        </div>
      </div>
    </footer>
  );
}
