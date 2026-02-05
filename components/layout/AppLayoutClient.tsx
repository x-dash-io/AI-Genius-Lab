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
              className="w-64 flex-col border-r bg-card/80 backdrop-blur-md flex fixed left-0 top-0 bottom-0 z-20"
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
                <nav className="space-y-1">
                  {navigation.map((item) => {
                    const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
                    const Icon = item.icon;
                    const isCart = item.href === "/cart";
                    const cartCount = cart?.itemCount || 0;

                    return (
                      <motion.div
                        key={item.href}
                        whileHover={{ x: 4 }}
                        transition={{ type: "spring", stiffness: 400, damping: 17 }}
                      >
                        <Link
                          href={getHref(item.href)}
                          className={cn(
                            "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all",
                            isActive
                              ? "bg-primary text-primary-foreground shadow-sm"
                              : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
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
                </nav>
              </div>

              {/* Sidebar Footer - Fixed at bottom */}
              <div className="flex-shrink-0 p-4 mt-auto border-t border-border/50">
                {session?.user && (
                  <div className="space-y-4">
                    <Link href={getHref("/profile")}>
                      <motion.div
                        whileHover={{ scale: 1.01 }}
                        whileTap={{ scale: 0.99 }}
                        className="group flex items-center gap-3 p-3 rounded-2xl bg-accent/30 border border-transparent hover:border-primary/20 hover:bg-accent/50 transition-all cursor-pointer shadow-sm hover:shadow-md"
                      >
                        <Avatar className="h-10 w-10 ring-2 ring-primary/10 group-hover:ring-primary/30 transition-all">
                          <AvatarImage src={avatarUrl || undefined} alt={session.user.name || session.user.email || "User"} />
                          <AvatarFallback className="bg-primary text-primary-foreground text-xs font-black">
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
                        <div className="flex-1 overflow-hidden min-w-0">
                          <p className="truncate text-xs font-bold tracking-tight text-foreground/90 uppercase">
                            {session.user.name || session.user.email}
                          </p>
                          <p className="truncate text-[10px] font-black uppercase tracking-[0.1em] text-muted-foreground/60">
                            {session.user.email}
                          </p>
                        </div>
                      </motion.div>
                    </Link>

                    {/* Scientific Action Bar */}
                    <div className="flex items-center gap-1.5 p-1 rounded-xl bg-accent/20 border border-border/40">
                      <div className="flex-1 flex items-center gap-1 pl-1">
                        <ThemeToggle />
                      </div>
                      <SignOutButton className="h-9 px-3 text-[10px] font-bold uppercase tracking-widest bg-background/50 hover:bg-destructive hover:text-destructive-foreground hover:shadow-[0_2px_8px_hsl(var(--destructive)_/_0.3)] border-none shadow-none rounded-lg transition-all" />
                    </div>
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
                  <ThemeToggle />
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
                        className="border-t px-4 py-4 space-y-3 sticky bottom-0 bg-background/95 backdrop-blur-md"
                      >
                        <Link href={getHref("/profile")} onClick={() => setMobileMenuOpen(false)}>
                          <div className="flex items-center gap-3 p-3 rounded-lg hover:bg-accent transition-colors active:scale-[0.98]">
                            <Avatar className="h-10 w-10 ring-2 ring-primary/20">
                              <AvatarImage src={avatarUrl || undefined} alt={session.user.name || session.user.email || "User"} />
                              <AvatarFallback className="bg-primary text-primary-foreground text-sm font-semibold">
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
                            <div className="flex-1 overflow-hidden min-w-0">
                              <p className="truncate text-sm font-semibold">
                                {session.user.name || session.user.email}
                              </p>
                              {session.user.name && (
                                <p className="truncate text-xs text-muted-foreground">
                                  {session.user.email}
                                </p>
                              )}
                            </div>
                          </div>
                        </Link>
                        <div className="flex items-center gap-2 px-1">
                          <SignOutButton className="flex-1" />
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
            <main className="flex-1 px-4 sm:px-6 py-4 pt-28 pb-12 relative z-10">
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
    </ConfirmDialogProvider>
  );
}
