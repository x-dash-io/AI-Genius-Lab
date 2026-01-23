"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { SignOutButton } from "@/components/auth/SignOutButton";
import { BackgroundBlobs } from "@/components/ui/background-blobs";
import { Footer } from "@/components/layout/Footer";
import { CartIcon } from "@/components/cart/CartIcon";
import { Menu, X } from "lucide-react";
import { useState, useEffect, useRef } from "react";

export function PublicLayoutClient({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session } = useSession();
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const menuRef = useRef<HTMLElement>(null);

  // Close menu on scroll
  useEffect(() => {
    if (!mobileMenuOpen) return;

    const handleScroll = () => {
      setMobileMenuOpen(false);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [mobileMenuOpen]);

  // Close menu when clicking outside
  useEffect(() => {
    if (!mobileMenuOpen) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMobileMenuOpen(false);
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setMobileMenuOpen(false);
      }
    };

    // Add slight delay to avoid immediate close on menu open
    const timeoutId = setTimeout(() => {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("keydown", handleEscape);
    }, 100);

    return () => {
      clearTimeout(timeoutId);
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [mobileMenuOpen]);
  
  // Hide dashboard button on sign-in/sign-up pages to avoid conflicts during redirect
  const isAuthPage = pathname === "/sign-in" || pathname === "/sign-up";

  return (
    <div className="min-h-screen bg-background text-foreground relative overflow-x-hidden">
      <BackgroundBlobs />
      <header className="fixed top-0 left-0 right-0 z-50 border-b bg-background/80 backdrop-blur-md supports-[backdrop-filter]:bg-background/60">
        <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-3 sm:px-4 md:px-6 lg:px-8 pt-3 pb-3 sm:pt-4 sm:pb-4">
          <div className="flex-shrink-0">
            <Link
              href="/"
              className="font-display text-lg sm:text-xl font-bold tracking-tight"
            >
              AI GENIUS LAB
            </Link>
          </div>
          
          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-4 lg:gap-6">
            {!isAuthPage && (
              <>
                <Link
                  href="/courses"
                  className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground whitespace-nowrap"
                >
                  Courses
                </Link>
                <Link
                  href="/learning-paths"
                  className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground whitespace-nowrap"
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
                  <Button variant="ghost" size="sm" className="whitespace-nowrap">
                    Go to Dashboard
                  </Button>
                </Link>
              </>
            ) : !isAuthPage ? (
              <>
                <Link href="/sign-in">
                  <Button variant="ghost" size="sm" className="whitespace-nowrap">
                    Sign in
                  </Button>
                </Link>
                <Link href="/sign-up">
                  <Button size="sm" className="whitespace-nowrap">Sign up</Button>
                </Link>
              </>
            ) : null}
          </nav>

          {/* Mobile Menu Button */}
          <div className="flex items-center gap-2 md:hidden">
            {!isAuthPage && <CartIcon />}
            <ThemeToggle />
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden"
            >
              {mobileMenuOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <>
              {/* Backdrop */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 md:hidden"
                onClick={() => setMobileMenuOpen(false)}
              />
              
              {/* Menu Panel */}
              <motion.nav
                ref={menuRef}
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ 
                  duration: 0.3,
                  ease: [0.4, 0, 0.2, 1]
                }}
                className="relative z-50 border-t bg-background md:hidden shadow-lg"
              >
                <div className="mx-auto max-w-7xl px-4 py-6 space-y-1">
                  {!isAuthPage && (
                    <>
                      <motion.div
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.1 }}
                      >
                        <Link
                          href="/courses"
                          onClick={() => setMobileMenuOpen(false)}
                          className="flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium text-foreground transition-all hover:bg-accent hover:text-accent-foreground active:scale-[0.98]"
                        >
                          Courses
                        </Link>
                      </motion.div>
                      <motion.div
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.15 }}
                      >
                        <Link
                          href="/learning-paths"
                          onClick={() => setMobileMenuOpen(false)}
                          className="flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium text-foreground transition-all hover:bg-accent hover:text-accent-foreground active:scale-[0.98]"
                        >
                          Learning Paths
                        </Link>
                      </motion.div>
                      <Separator className="my-3" />
                    </>
                  )}
                  {!isAuthPage && session?.user ? (
                    <motion.div
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.2 }}
                    >
                      <Link href="/dashboard" onClick={() => setMobileMenuOpen(false)}>
                        <Button variant="default" size="sm" className="w-full">
                          Go to Dashboard
                        </Button>
                      </Link>
                    </motion.div>
                  ) : !isAuthPage ? (
                    <div className="space-y-2 pt-2">
                      <motion.div
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.2 }}
                      >
                        <Link href="/sign-in" onClick={() => setMobileMenuOpen(false)}>
                          <Button variant="outline" size="sm" className="w-full">
                            Sign in
                          </Button>
                        </Link>
                      </motion.div>
                      <motion.div
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.25 }}
                      >
                        <Link href="/sign-up" onClick={() => setMobileMenuOpen(false)}>
                          <Button size="sm" className="w-full">Sign up</Button>
                        </Link>
                      </motion.div>
                    </div>
                  ) : null}
                </div>
              </motion.nav>
            </>
          )}
        </AnimatePresence>
      </header>
      <motion.main
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3, delay: 0.1 }}
        className="mx-auto w-full max-w-7xl px-3 sm:px-4 md:px-6 lg:px-8 pt-20 sm:pt-24 md:pt-28 pb-6 sm:pb-10 relative z-10"
      >
        {children}
      </motion.main>
      <Footer />
    </div>
  );
}
