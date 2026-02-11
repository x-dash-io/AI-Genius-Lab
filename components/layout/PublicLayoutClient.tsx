"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import {
  BookOpen,
  GraduationCap,
  Grid3X3,
  HelpCircle,
  LogIn,
  Menu,
  Newspaper,
  ShoppingCart,
  UserPlus,
  X,
} from "lucide-react";

import { SignOutButton } from "@/components/auth/SignOutButton";
import { useCart } from "@/components/cart/CartProvider";
import { Footer } from "@/components/layout/Footer";
import { AppShell } from "@/components/layout/shell";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { cn } from "@/lib/utils";
import { useCart } from "@/components/cart/CartProvider";
import { SocialLink } from "@/lib/settings";
import {
  Menu,
  X,
  BookOpen,
  Route,
  HelpCircle,
  Mail,
  Home,
  GraduationCap,
  ShoppingCart,
  LogIn,
  UserPlus,
  Newspaper,
  ChevronDown,
  Info,
  Users,
} from "lucide-react";
import { useState, useEffect, useRef } from "react";
import Image from "next/image";

// Primary navigation - core conversion paths
const primaryNavigation = [
  { name: "Home", href: "/", icon: Home },
  { name: "Paths", href: "/learning-paths", icon: Route },
  { name: "Cart", href: "/cart", icon: ShoppingCart },
];

const mainNav = [
  { name: "Courses", href: "/courses", icon: BookOpen },
  { name: "Learning Paths", href: "/learning-paths", icon: GraduationCap },
  { name: "Pricing", href: "/pricing", icon: Grid3X3 },
  { name: "Blog", href: "/blog", icon: Newspaper },
  { name: "FAQ", href: "/faq", icon: HelpCircle },
];

function isActivePath(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function PublicLayoutClient({
  children,
  socialLinks,
}: {
  children: React.ReactNode;
  socialLinks?: SocialLink[];
}) {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [resourcesOpen, setResourcesOpen] = useState(false);
  const mounted = true;
  const menuRef = useRef<HTMLElement>(null);
  const { cart } = useCart();
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  // Close menu on scroll
  useEffect(() => {
    if (!mobileMenuOpen) return;

    const handleScroll = () => {
      setMobileMenuOpen(false);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [mobileMenuOpen]);

  // Close menu when clicking outside or pressing Escape
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

  const mobileNav = useMemo(
    () => [
      ...mainNav,
      { name: "Cart", href: "/cart", icon: ShoppingCart },
      ...(session?.user ? [{ name: "Dashboard", href: "/dashboard", icon: GraduationCap }] : []),
    ],
    [session?.user]
  );

  return (
    <div className="min-h-screen bg-background text-foreground relative overflow-x-hidden">
      {/* Hero Background Blobs - more vibrant for all pages */}
      <HeroBackgroundBlobs />
      <div className="hidden lg:flex flex-col min-h-screen" suppressHydrationWarning>
        {/* Desktop Top Navigation Bar - Floating Glass */}
        <motion.header
          initial={{ y: -100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="sticky top-0 left-0 right-0 z-50 px-4 pt-3 pointer-events-none"
        >
          <div className="mx-auto w-full max-w-7xl pointer-events-auto">
            <div className="glass rounded-2xl h-16 px-6 flex items-center justify-between border border-border/60 shadow-[0_10px_30px_rgba(2,6,23,0.12)]">
              {/* Logo */}
              <Link href="/" className="flex items-center group transition-transform hover:scale-105">
                <div className="relative h-9 w-auto flex-shrink-0">
                  <Image
                    src="/logo.png"
                    alt="AI Genius Lab"
                    width={160}
                    height={36}
                    className="object-contain h-9 w-auto"
                    priority
                  />
                </div>
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-1.5">
            <ThemeToggle />

            <Link href="/cart" className="relative inline-flex">
              <Button variant="ghost" size="icon" aria-label="Shopping cart" className="h-11 w-11 rounded-full">
                <ShoppingCart className="h-4 w-4" />
              </Button>
              {cartCount > 0 ? (
                <Badge className="absolute -right-1 -top-1 h-4 min-w-4 px-1 text-[10px]">{cartCount > 9 ? "9+" : cartCount}</Badge>
              ) : null}
            </Link>

            {session?.user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="h-11 rounded-full px-1.5">
                    <Avatar className="h-7 w-7">
                      <AvatarImage src={session.user.image || undefined} alt={session.user.name || session.user.email || "User"} />
                      <AvatarFallback className="text-xs font-semibold">
                        {(session.user.name?.[0] || session.user.email?.[0] || "U").toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuItem asChild>
                    <Link href="/dashboard">Dashboard</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/profile">Profile</Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <div className="px-1 pb-1">
                    <SignOutButton className="h-11 w-full justify-start" />
                  </div>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="hidden items-center gap-2 sm:flex">
                <Link href="/sign-in">
                  <Button variant="ghost" size="sm" className="h-11 rounded-full">
                    Sign In
                  </Button>
                </Link>
                <Link href="/sign-up">
                  <Button variant="premium" size="sm" className="h-11 rounded-full px-4">
                    Create Account
                  </Button>
                </Link>
              </div>
            )}

            <Button
              variant="ghost"
              size="icon"
              className="h-11 w-11 rounded-full md:hidden"
              onClick={() => setIsMobileOpen((open) => !open)}
              aria-label="Toggle menu"
            >
              {isMobileOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
            </Button>
          </div>
        </div>
      </header>

      {isMobileOpen ? (
        <div className="border-b border-border/80 bg-background px-4 pb-4 pt-2 md:hidden">
          <nav className="grid gap-1">
            {mobileNav.map((item) => {
              const Icon = item.icon;
              return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsMobileOpen(false)}
                className={cn(
                  "inline-flex items-center gap-2 rounded-[var(--radius-sm)] px-3 py-2 text-sm font-medium",
                  isActivePath(pathname, item.href)
                      ? "bg-accent text-foreground"
                      : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {item.name}
                </Link>
              );
            })}
            {!session?.user ? (
              <div className="mt-3 grid gap-2 sm:grid-cols-2">
                <Link href="/sign-in">
                  <Button variant="outline" className="w-full justify-center gap-2" onClick={() => setIsMobileOpen(false)}>
                    <LogIn className="h-4 w-4" />
                    Sign In
                  </Button>
                </Link>
                <Link href="/sign-up">
                  <Button variant="premium" className="w-full justify-center gap-2" onClick={() => setIsMobileOpen(false)}>
                    <UserPlus className="h-4 w-4" />
                    Sign Up
                  </Button>
                </Link>
              </div>
            </Link>
            <div className="flex items-center gap-2 flex-shrink-0">
              <Button
                variant="ghost"
                size="icon"
                onClick={(e) => {
                  e.stopPropagation();
                  setMobileMenuOpen(!mobileMenuOpen);
                }}
                className="h-10 w-10"
                aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
              >
                {mobileMenuOpen ? (
                  <X className="h-5 w-5" />
                ) : (
                  <Menu className="h-5 w-5" />
                )}
              </Button>
            </div>
          </div>
        </header>

        {/* Mobile Menu Overlay */}
        <AnimatePresence mode="wait">
          {mobileMenuOpen && (
            <>
              {/* Backdrop */}
              <motion.div
                key="backdrop"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
                onClick={() => setMobileMenuOpen(false)}
              />

              {/* Menu Panel - Slides from Left */}
              <motion.nav
                key="menu"
                ref={menuRef}
                initial={{ x: "-100%" }}
                animate={{ x: 0 }}
                exit={{ x: "-100%" }}
                transition={{
                  type: "spring",
                  damping: 30,
                  stiffness: 300
                }}
                className="fixed left-0 top-0 bottom-0 z-50 w-72 max-w-[85vw] bg-card/96 backdrop-blur-xl border-r border-border/80 shadow-[0_18px_40px_rgba(2,6,23,0.35)] flex flex-col lg:hidden"
              >
                {/* Menu Header */}
                <div className="border-b p-4 flex items-center justify-between bg-card/95 backdrop-blur-md z-10 h-16 flex-shrink-0">
                  <Link href="/" onClick={() => setMobileMenuOpen(false)} className="flex items-center">
                    <div className="relative h-10 w-auto flex-shrink-0">
                      <Image
                        src="/logo.png"
                        alt="AI Genius Lab"
                        width={180}
                        height={40}
                        className="object-contain h-10 w-auto"
                        priority
                      />
                    </div>
                  </Link>
                </div>

                {/* Navigation Items */}
                <div className="px-3 py-4 space-y-1 flex-1 overflow-y-auto">
                  {publicNavigation.map((item, index) => {
                    const isActive = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href + "/"));
                    const Icon = item.icon;
                    const isCart = item.href === "/cart";
                    const cartCount = cart?.itemCount || 0;

                    return (
                      <motion.div
                        key={item.href}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.05 * (index + 1) }}
                      >
                        <Link
                          href={item.href}
                          onClick={() => setMobileMenuOpen(false)}
                          className={cn(
                            "flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-medium transition-all active:scale-[0.98]",
                            isActive
                              ? "bg-primary text-primary-foreground shadow-sm"
                              : "text-foreground hover:bg-accent hover:text-accent-foreground"
                          )}
                        >
                          <Icon className="h-5 w-5 flex-shrink-0" />
                          <span className="flex-1">{item.name}</span>
                          {isCart && cartCount > 0 && (
                            <Badge
                              variant="destructive"
                              className="h-5 min-w-[20px] flex items-center justify-center rounded-full px-1.5 text-[10px] font-bold"
                            >
                              {cartCount > 9 ? "9+" : cartCount}
                            </Badge>
                          )}
                        </Link>
                      </motion.div>
                    );
                  })}
                </div>

      <main className="flex-1">
        <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:py-8">{children}</div>
      </main>

      <Footer socialLinks={socialLinks} />
    </AppShell>
  );
}
