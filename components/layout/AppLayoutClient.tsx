"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  BookOpen,
  Activity,
  Menu,
  X,
  GraduationCap,
  User,
  Route,
  ShoppingCart,
  Newspaper,
  CreditCard,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { SignOutButton } from "@/components/auth/SignOutButton";
import { HeroBackgroundBlobs } from "@/components/ui/hero-background-blobs";
import { useCart } from "@/components/cart/CartProvider";
import { ConfirmDialogProvider } from "@/components/ui/confirm-dialog";
import { CourseProgressProvider } from "@/contexts/CourseProgressContext";
import { cn } from "@/lib/utils";
import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { PreviewBanner } from "@/components/admin/PreviewBanner";
import { Footer } from "@/components/layout/Footer";

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "My Courses", href: "/library", icon: BookOpen },
  { name: "Browse Courses", href: "/courses", icon: GraduationCap },
  { name: "Learning Paths", href: "/learning-paths", icon: Route },
  { name: "Subscription", href: "/profile/subscription", icon: CreditCard },
  { name: "Blog", href: "/blog", icon: Newspaper },
  { name: "Cart", href: "/cart", icon: ShoppingCart },
  { name: "Activity", href: "/activity", icon: Activity },
  { name: "Profile", href: "/profile", icon: User },
];

export function AppLayoutClient({ children }: { children: React.ReactNode }) {
  const { data: session } = useSession();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const { cart } = useCart();
  const menuRef = useRef<HTMLElement>(null);
  const [avatarUrl, setAvatarUrl] = useState<string | null | undefined>(session?.user?.image);

  // Prevent hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  // Listen for avatar updates
  useEffect(() => {
    if (!mounted) return;

    const handleAvatarUpdate = (event: CustomEvent) => {
      setAvatarUrl(event.detail.imageUrl);
    };

    window.addEventListener('avatarUpdated', handleAvatarUpdate as EventListener);
    return () => {
      window.removeEventListener('avatarUpdated', handleAvatarUpdate as EventListener);
    };
  }, [mounted]);

  // Update avatar when session changes
  useEffect(() => {
    setAvatarUrl(session?.user?.image);
  }, [session?.user?.image]);

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

  // Check if admin is in preview mode - preserve preview param in all links
  const isAdmin = session?.user?.role === "admin";
  const isPreviewMode = searchParams.get("preview") === "true";
  const shouldPreservePreview = isAdmin && isPreviewMode;

  // Helper to add preview param to links for admin users
  const getHref = (baseHref: string) => {
    if (shouldPreservePreview) {
      return `${baseHref}?preview=true`;
    }
    return baseHref;
  };

  // Don't render until mounted to prevent hydration mismatch
  if (!mounted) {
    return (
      <div className="min-h-screen bg-background text-foreground relative overflow-x-hidden">
        <HeroBackgroundBlobs />
      </div>
    );
  }

  return (
    <ConfirmDialogProvider>
      <CourseProgressProvider>
        <div className="min-h-screen bg-background font-sans antialiased">
          <HeroBackgroundBlobs />

          {/* Desktop Layout */}
          <div className="hidden lg:flex min-h-screen" suppressHydrationWarning>
            {/* Desktop Sidebar - Fixed */}
            <motion.aside
              initial={{ x: -100, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ duration: 0.3 }}
              className="w-64 flex-col border-r border-white/10 flex fixed left-0 top-0 bottom-0 z-20"
              style={{
                background: "linear-gradient(180deg, rgba(var(--card-rgb), 0.95) 0%, rgba(var(--card-rgb), 0.85) 100%)",
                backdropFilter: "blur(20px)"
              }}
            >
              {/* Sidebar Header - Fixed at top */}
              <div className="flex-shrink-0 border-b p-6">
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Link href={getHref("/dashboard")} className="flex items-center">
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
                </motion.div>
              </div>

              {/* Scrollable Navigation */}
              <div className="flex-1 overflow-y-auto px-4 py-6">
                <p className="px-3 text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/60 mb-4">
                  Navigation
                </p>
                <nav className="space-y-1">
                  {navigation.map((item) => {
                    const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
                    const Icon = item.icon;
                    const isCart = item.href === "/cart";
                    const cartCount = cart?.itemCount || 0;

                    return (
                      <motion.div
                        key={item.href}
                        whileHover={{ x: 4, scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        transition={{ type: "spring", stiffness: 400, damping: 17 }}
                      >
                        <Link
                          href={getHref(item.href)}
                          className={cn(
                            "group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200 overflow-hidden",
                            "hover:bg-gradient-to-r hover:from-primary/15 hover:to-primary/5",
                            "hover:shadow-sm hover:shadow-primary/10",
                            isActive
                              ? "bg-gradient-to-r from-primary to-primary/80 text-primary-foreground shadow-lg shadow-primary/20"
                              : "text-muted-foreground hover:text-foreground"
                          )}
                        >
                          {/* Active glow effect */}
                          {isActive && (
                            <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-transparent opacity-50 blur-xl" />
                          )}
                          {/* Hover overlay */}
                          <div className="absolute inset-0 bg-gradient-to-r from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                          <Icon className="h-5 w-5 flex-shrink-0 transition-transform duration-200 group-hover:scale-110 relative z-10" />
                          <span className="flex-1 relative z-10">{item.name}</span>
                          {isCart && cartCount > 0 && (
                            <Badge
                              variant="destructive"
                              className="h-5 min-w-[20px] flex items-center justify-center rounded-full px-1.5 text-[10px] font-bold relative z-10 shadow-lg shadow-destructive/25"
                            >
                              {cartCount > 9 ? "9+" : cartCount}
                            </Badge>
                          )}

                          {/* Active indicator bar */}
                          {isActive && (
                            <motion.div
                              className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-white/80 rounded-full shadow-sm"
                              layoutId="activeNavIndicator"
                              initial={{ opacity: 0, scale: 0 }}
                              animate={{ opacity: 1, scale: 1 }}
                              transition={{ type: "spring", stiffness: 300, damping: 20 }}
                            />
                          )}
                        </Link>
                      </motion.div>
                    );
                  })}
                </nav>
              </div>

              {/* Sidebar Footer - Fixed at bottom */}
              <div className="flex-shrink-0 p-4 mt-auto border-t border-white/10">
                {session?.user && (
                  <div className="space-y-4">
                    <Link href={getHref("/profile")}>
                      <motion.div
                        whileHover={{ y: -2, scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="group relative flex items-center gap-3 p-4 rounded-2xl backdrop-blur-md cursor-pointer shadow-lg hover:shadow-xl transition-all duration-300"
                        style={{
                          background: "linear-gradient(135deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.03) 100%)",
                          border: "1px solid rgba(255,255,255,0.1)"
                        }}
                      >
                        {/* Animated gradient overlay */}
                        <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                        <div className="relative">
                          <Avatar className="h-11 w-11 ring-2 ring-primary/20 group-hover:ring-primary/40 transition-all duration-300">
                            <AvatarImage src={avatarUrl || undefined} alt={session.user.name || session.user.email || "User"} />
                            <AvatarFallback className="bg-gradient-to-br from-primary to-primary/70 text-primary-foreground text-sm font-black">
                              {(() => {
                                const name = session.user.name;
                                const email = session.user.email || "";
                                if (name && name.trim()) {
                                  return name.trim()[0].toUpperCase();
                                }
                                return email.charAt(0).toUpperCase();
                              })()}
                            </AvatarFallback>
                          </Avatar>
                          {/* Pulse ring animation */}
                          <motion.div
                            className="absolute -inset-0.5 rounded-full border-2 border-primary/20"
                            animate={{
                              scale: [1, 1.15, 1],
                              opacity: [0.3, 0.1, 0.3]
                            }}
                            transition={{
                              duration: 3,
                              repeat: Infinity,
                              ease: "easeInOut"
                            }}
                          />
                        </div>

                        <div className="flex-1 overflow-hidden min-w-0 flex flex-col justify-center">
                          <p className="truncate text-sm font-bold text-foreground group-hover:text-primary transition-colors duration-200">
                            {session.user.name || "User"}
                          </p>
                          <p className="truncate text-[10px] uppercase font-bold tracking-wider text-muted-foreground group-hover:text-foreground/80 transition-colors duration-200">
                            Member
                          </p>
                        </div>
                      </motion.div>
                    </Link>

                    {/* Modern Action Bar */}
                    <motion.div
                      className="flex items-center gap-2 p-2 rounded-xl backdrop-blur-md shadow-lg"
                      style={{
                        background: "linear-gradient(135deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.02) 100%)",
                        border: "1px solid rgba(255,255,255,0.08)"
                      }}
                    >
                      <div className="flex items-center gap-1 flex-1">
                        <motion.div
                          className="p-2 rounded-lg hover:bg-white/10 transition-colors duration-200 cursor-pointer"
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          <ThemeToggle />
                        </motion.div>
                      </div>
                      <motion.div
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <SignOutButton className="h-9 px-4 text-[10px] font-bold uppercase tracking-widest bg-gradient-to-r from-destructive/90 to-destructive hover:from-destructive hover:to-destructive/90 text-white shadow-md hover:shadow-lg hover:shadow-destructive/25 border-none rounded-lg transition-all duration-300" />
                      </motion.div>
                    </motion.div>
                  </div>
                )}
              </div>
            </motion.aside>

            {/* Desktop Main Content Area */}
            <div className="flex-1 flex flex-col ml-64">
              {/* Preview Banner for Admin */}
              <PreviewBanner />
              {/* Scrollable Main Content */}
              <main className="flex-1">
                <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 py-4 sm:py-6 pb-12">
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    {children}
                  </motion.div>
                </div>
              </main>
              <Footer />
            </div>
          </div>

          {/* Mobile Layout */}
          <div className="flex lg:hidden flex-col min-h-screen" suppressHydrationWarning>
            <header className="fixed top-0 left-0 right-0 z-50 border-b bg-background/80 backdrop-blur-md supports-[backdrop-filter]:bg-background/60 h-16">
              <div className="flex items-center justify-between px-4 h-full">
                <Link href={getHref("/dashboard")} className="flex items-center">
                  <div className="relative h-8 w-auto flex-shrink-0">
                    <Image
                      src="/logo.png"
                      alt="AI Genius Lab"
                      width={150}
                      height={32}
                      className="object-contain h-8 w-auto"
                      priority
                    />
                  </div>
                </Link>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                    className="h-10 w-10"
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
                    className="fixed left-0 top-0 bottom-0 z-50 w-72 max-w-[85vw] bg-card/95 backdrop-blur-md border-r shadow-2xl overflow-y-auto lg:hidden"
                  >
                    {/* Menu Header */}
                    <div className="border-b p-4 flex items-center justify-between sticky top-0 bg-card/95 backdrop-blur-md z-10 h-16">
                      <Link href={getHref("/dashboard")} onClick={() => setMobileMenuOpen(false)} className="flex items-center">
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
                    <div className="px-3 py-4 pb-32 space-y-1">
                      {navigation.map((item, index) => {
                        const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
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
                              href={getHref(item.href)}
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

                    {/* User Profile Section */}
                    {session?.user && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                        className="border-t px-4 py-4 space-y-3 sticky bottom-0 bg-card/95 backdrop-blur-md"
                      >
                        <Link href={getHref("/profile")} onClick={() => setMobileMenuOpen(false)}>
                          <motion.div
                            className="group relative flex items-center gap-3 p-3 rounded-2xl backdrop-blur-md bg-white/10 border border-white/20 transition-all cursor-pointer shadow-lg hover:shadow-xl"
                            whileHover={{ y: -1, scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            style={{
                              background: "linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)"
                            }}
                          >
                            {/* Animated gradient overlay */}
                            <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                            <div className="relative">
                              <Avatar className="h-10 w-10 ring-2 ring-primary/20 group-hover:ring-primary/40 transition-all duration-300">
                                <AvatarImage src={avatarUrl || undefined} alt={session.user.name || session.user.email || "User"} />
                                <AvatarFallback className="bg-gradient-to-br from-primary to-primary/80 text-primary-foreground text-sm font-bold">
                                  {(() => {
                                    const name = session.user.name;
                                    const email = session.user.email || "";
                                    if (name && name.trim()) {
                                      const nameParts = name.trim().split(/\s+/);
                                      return nameParts[0][0].toUpperCase();
                                    }
                                    return email.charAt(0).toUpperCase();
                                  })()}
                                </AvatarFallback>
                              </Avatar>
                              {/* Animated avatar ring */}
                              <motion.div
                                className="absolute -inset-1 rounded-full border-2 border-primary/30"
                                animate={{
                                  scale: [1, 1.1, 1],
                                  opacity: [0.3, 0.6, 0.3]
                                }}
                                transition={{
                                  duration: 2,
                                  repeat: Infinity,
                                  ease: "easeInOut"
                                }}
                              />
                            </div>

                            <div className="flex-1 overflow-hidden min-w-0">
                              <p className="truncate text-sm font-semibold group-hover:text-foreground transition-colors duration-200">
                                {session.user.name || "User"}
                              </p>
                              <p className="truncate text-xs text-muted-foreground group-hover:text-muted-foreground transition-colors duration-200">
                                Member
                              </p>
                            </div>
                          </motion.div>
                        </Link>
                        <div className="flex items-center gap-3 px-1 mt-2">
                          <div className="bg-muted/50 p-2 rounded-xl border">
                            <ThemeToggle />
                          </div>
                          <motion.div
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            className="flex-1"
                          >
                            <SignOutButton className="w-full h-10 text-[10px] font-bold uppercase tracking-widest bg-destructive text-destructive-foreground hover:bg-destructive/90 shadow-lg hover:shadow-xl hover:shadow-destructive/25 border-none rounded-xl transition-all duration-300" />
                          </motion.div>
                        </div>
                      </motion.div>
                    )}
                  </motion.nav>
                </>
              )}
            </AnimatePresence>

            {/* Preview Banner for Admin (Mobile) */}
            <div className="pt-14 sm:pt-16">
              <PreviewBanner />
            </div>

            {/* Main Content */}
            <main className="flex-1 px-4 sm:px-6 pt-28 pb-12 relative z-10">
              <div className="mx-auto w-full max-w-none sm:max-w-7xl">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  {children}
                </motion.div>
              </div>
            </main>
            <Footer />
          </div>
        </div>
      </CourseProgressProvider>
    </ConfirmDialogProvider >
  );
}
