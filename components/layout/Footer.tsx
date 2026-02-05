"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import { Facebook, Linkedin, Twitter } from "lucide-react";
import { SocialLinks } from "@/lib/settings";

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
  };

  return (
    <footer className="border-t bg-background/50 backdrop-blur-sm">
      <div className="mx-auto w-full max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-8 md:grid-cols-4">
          <div className="grid gap-4">
            <h3 className="font-display text-lg font-bold">AI Genius Lab</h3>
            <p className="text-sm text-muted-foreground">
              Premium AI learning platform with structured courses and secure commerce.
            </p>
            <div className="flex gap-4">
              <Link href={links.facebook} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-foreground transition-colors">
                <Facebook className="h-5 w-5" />
                <span className="sr-only">Facebook</span>
              </Link>
              <Link href={links.linkedin} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-foreground transition-colors">
                <Linkedin className="h-5 w-5" />
                <span className="sr-only">LinkedIn</span>
              </Link>
              <Link href={links.twitter} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-foreground transition-colors">
                <Twitter className="h-5 w-5" />
                <span className="sr-only">X (Twitter)</span>
              </Link>
              <Link href={links.tiktok} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-foreground transition-colors">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-5 w-5"
                >
                  <path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5" />
                </svg>
                <span className="sr-only">TikTok</span>
              </Link>
            </div>
          </div>
          <div className="grid gap-4">
            <h4 className="text-sm font-semibold">Learn</h4>
            <nav className="grid gap-2">
              <Link
                href="/courses"
                className="text-sm text-muted-foreground transition-colors hover:text-foreground"
              >
                Courses
              </Link>
              <Link
                href="/learning-paths"
                className="text-sm text-muted-foreground transition-colors hover:text-foreground"
              >
                Learning Paths
              </Link>
              <Link
                href="/blog"
                className="text-sm text-muted-foreground transition-colors hover:text-foreground"
              >
                Blog
              </Link>
              {session?.user && (
                <Link
                  href="/dashboard"
                  className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                >
                  Dashboard
                </Link>
              )}
            </nav>
          </div>
          <div className="grid gap-4">
            <h4 className="text-sm font-semibold">Legal</h4>
            <nav className="grid gap-2">
              <Link
                href="/privacy"
                className="text-sm text-muted-foreground transition-colors hover:text-foreground"
              >
                Privacy Policy
              </Link>
              <Link
                href="/terms"
                className="text-sm text-muted-foreground transition-colors hover:text-foreground"
              >
                Terms of Service
              </Link>
            </nav>
          </div>
          <div className="grid gap-4">
            <h4 className="text-sm font-semibold">Support</h4>
            <nav className="grid gap-2">
              <Link
                href="/faq"
                className="text-sm text-muted-foreground transition-colors hover:text-foreground"
              >
                FAQ
              </Link>
              <Link
                href="/contact"
                className="text-sm text-muted-foreground transition-colors hover:text-foreground"
              >
                Contact Us
              </Link>
              {session?.user ? (
                <Link
                  href="/dashboard"
                  className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                >
                  Dashboard
                </Link>
              ) : (
                <>
                  <Link
                    href="/sign-in"
                    className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                  >
                    Sign In
                  </Link>
                  <Link
                    href="/sign-up"
                    className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                  >
                    Sign Up
                  </Link>
                </>
              )}
            </nav>
          </div>
        </div>
        <div className="mt-8 border-t pt-8 text-center text-sm text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} AI Genius Lab. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
