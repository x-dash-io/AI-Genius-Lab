"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";

export function Footer() {
  const { data: session } = useSession();

  return (
    <footer className="border-t bg-background/50 backdrop-blur-sm">
      <div className="mx-auto w-full max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-8 md:grid-cols-4">
          <div className="grid gap-4">
            <h3 className="font-display text-lg font-bold">AI Genius Lab</h3>
            <p className="text-sm text-muted-foreground">
              Premium AI learning platform with structured courses and secure commerce.
            </p>
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
            <h4 className="text-sm font-semibold">Account</h4>
            <nav className="grid gap-2">
              {session?.user ? (
                <>
                  <Link
                    href="/dashboard"
                    className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                  >
                    Dashboard
                  </Link>
                  <Link
                    href="/library"
                    className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                  >
                    My Library
                  </Link>
                </>
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
