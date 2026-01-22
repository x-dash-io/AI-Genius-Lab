"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { SignOutButton } from "@/components/auth/SignOutButton";
import { BackgroundBlobs } from "@/components/ui/background-blobs";
import { Footer } from "@/components/layout/Footer";
import { CartIcon } from "@/components/cart/CartIcon";

export function PublicLayoutClient({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session } = useSession();
  const pathname = usePathname();
  
  // Hide dashboard button on sign-in/sign-up pages to avoid conflicts during redirect
  const isAuthPage = pathname === "/sign-in" || pathname === "/sign-up";

  return (
    <div className="min-h-screen bg-background text-foreground relative overflow-x-hidden">
      <BackgroundBlobs />
      <header className="fixed top-0 left-0 right-0 z-50 border-b bg-background/80 backdrop-blur-md supports-[backdrop-filter]:bg-background/60">
        <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-4 pt-4 pb-4 sm:px-6 sm:pt-5 sm:pb-5 lg:px-8 overflow-x-hidden">
          <div>
            <Link
              href="/"
              className="font-display text-xl font-bold tracking-tight"
            >
              AI GENIUS LAB
            </Link>
          </div>
          <nav className="flex items-center gap-6 flex-wrap">
            {!isAuthPage && (
              <>
                <Link
                  href="/courses"
                  className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
                >
                  Courses
                </Link>
                <Link
                  href="/learning-paths"
                  className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
                >
                  Learning Paths
                </Link>
              </>
            )}
            {!isAuthPage && <CartIcon />}
            <ThemeToggle />
            {!isAuthPage && session?.user ? (
              <>
                <Link href="/dashboard">
                  <Button variant="ghost" size="sm">
                    Go to Dashboard
                  </Button>
                </Link>
              </>
            ) : !isAuthPage ? (
              <>
                <Link href="/sign-in">
                  <Button variant="ghost" size="sm">
                    Sign in
                  </Button>
                </Link>
                <Link href="/sign-up">
                  <Button size="sm">Sign up</Button>
                </Link>
              </>
            ) : null}
          </nav>
        </div>
      </header>
      <motion.main
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3, delay: 0.1 }}
        className="mx-auto w-full max-w-7xl px-4 pt-24 py-10 sm:px-6 sm:pt-28 lg:px-8 relative z-10"
      >
        {children}
      </motion.main>
      <Footer />
    </div>
  );
}
