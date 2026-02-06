"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import { Facebook, Linkedin, Twitter, Instagram } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SocialLinks } from "@/lib/settings";

import Image from "next/image";

interface FooterProps {
  socialLinks?: SocialLinks;
}

export function Footer({ socialLinks }: FooterProps) {
  const { data: session } = useSession();

  const links = socialLinks || {
    facebook: "#",
    linkedin: "#",
    twitter: "#",
    tiktok: "#",
    instagram: "#",
  };

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
            <div className="flex gap-3">
              {[
                { icon: Facebook, href: links.facebook, label: "Facebook" },
                { icon: Twitter, href: links.twitter, label: "Twitter" },
                { icon: Linkedin, href: links.linkedin, label: "LinkedIn" },
                { icon: Instagram, href: links.instagram, label: "Instagram" }
              ].map((social) => (
                <Link
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="h-10 w-10 flex items-center justify-center rounded-xl bg-accent/50 text-muted-foreground hover:bg-primary hover:text-white transition-all duration-300"
                >
                  <social.icon className="h-5 w-5" />
                  <span className="sr-only">{social.label}</span>
                </Link>
              ))}
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
