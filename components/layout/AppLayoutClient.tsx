"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
import {
  Activity,
  BookOpen,
  CreditCard,
  GraduationCap,
  LayoutDashboard,
  Menu,
  Newspaper,
  ShoppingCart,
  User,
  X,
} from "lucide-react";

import { SignOutButton } from "@/components/auth/SignOutButton";
import { useCart } from "@/components/cart/CartProvider";
import { Footer } from "@/components/layout/Footer";
import { AppShell } from "@/components/layout/shell";
import { PreviewBanner } from "@/components/admin/PreviewBanner";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { CourseProgressProvider } from "@/contexts/CourseProgressContext";
import { cn } from "@/lib/utils";

const appNavigation = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "My Library", href: "/library", icon: BookOpen },
  { name: "Courses", href: "/courses", icon: GraduationCap },
  { name: "Learning Paths", href: "/learning-paths", icon: GraduationCap },
  { name: "Subscription", href: "/profile/subscription", icon: CreditCard },
  { name: "Activity", href: "/activity", icon: Activity },
  { name: "Blog", href: "/blog", icon: Newspaper },
  { name: "Profile", href: "/profile", icon: User },
];

const mobileBottomNavigation = [
  { name: "Home", href: "/dashboard", icon: LayoutDashboard },
  { name: "Library", href: "/library", icon: BookOpen },
  { name: "Cart", href: "/cart", icon: ShoppingCart },
  { name: "Activity", href: "/activity", icon: Activity },
  { name: "Profile", href: "/profile", icon: User },
];

function isActivePath(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`);
}

interface AppLayoutClientProps {
  children: React.ReactNode;
  planName?: string;
}

export function AppLayoutClient({ children, planName = "Member" }: AppLayoutClientProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const mounted = true;
  const { cart } = useCart();
  const menuRef = useRef<HTMLElement>(null);
  const [avatarOverride, setAvatarOverride] = useState<string | null | undefined>(undefined);

  // Listen for avatar updates
  useEffect(() => {
    if (!mounted) return;

    const handleAvatarUpdate = (event: CustomEvent) => {
      setAvatarOverride(event.detail.imageUrl);
    };

    window.addEventListener('avatarUpdated', handleAvatarUpdate as EventListener);
    return () => {
      window.removeEventListener('avatarUpdated', handleAvatarUpdate as EventListener);
    };
  }, [mounted]);

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

  const isAdmin = session?.user?.role === "admin";
  const isPreviewMode = searchParams.get("preview") === "true";
  const preservePreview = isAdmin && isPreviewMode;

  const cartCount = cart?.itemCount ?? 0;
  const avatarUrl = avatarOverride ?? session?.user?.image;

  const getHref = (baseHref: string) => {
    if (preservePreview) {
      return `${baseHref}?preview=true`;
    }

    return baseHref;
  };

  const currentSection = useMemo(() => {
    const match = appNavigation.find((item) => isActivePath(pathname, item.href));
    return match?.name ?? "Workspace";
  }, [pathname]);

  return (
    <CourseProgressProvider>
      <AppShell area="app">
        <div className="hidden lg:block">
          <aside className="fixed inset-y-0 left-0 z-30 flex w-72 flex-col border-r bg-card/80 px-4 py-4 backdrop-blur">
            <Link href={getHref("/dashboard")} className="flex h-12 items-center px-2" aria-label="Dashboard">
              <Image src="/logo.png" alt="AI Genius Lab" width={164} height={36} className="h-8 w-auto object-contain" priority />
            </Link>

          {/* Desktop Layout */}
          <div className="hidden lg:flex min-h-screen" suppressHydrationWarning>
            {/* Desktop Sidebar - Fixed */}
            <motion.aside
              initial={{ x: -100, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ duration: 0.3 }}
              className="w-64 flex-col border-r border-white/10 flex fixed left-0 top-0 bottom-0 z-20"
              style={{
                background: "hsl(var(--card) / 0.82)",
                backdropFilter: "blur(16px)"
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
                            <AvatarImage src={(avatarOverride ?? session?.user?.image) || undefined} alt={session.user.name || session.user.email || "User"} />
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

            <div className="mt-4 space-y-3 border-t pt-4">
              <Link href={getHref("/profile")} className="ui-surface glass flex items-center gap-3 rounded-[var(--radius-md)] border p-3">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={avatarUrl || undefined} alt={session?.user?.name || session?.user?.email || "User"} />
                  <AvatarFallback>{(session?.user?.name?.[0] || session?.user?.email?.[0] || "U").toUpperCase()}</AvatarFallback>
                </Avatar>
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold">{session?.user?.name || "User"}</p>
                  <p className="truncate text-xs text-muted-foreground">{planName}</p>
                </div>
              </Link>

              <div className="flex items-center justify-between">
                <ThemeToggle />
                <SignOutButton className="h-9 w-auto px-3" />
              </div>
            </div>
          </aside>

          <div className="pl-72">
            <header className="sticky top-0 z-20 border-b border-border/80 bg-background/90 backdrop-blur">
              <div className="mx-auto flex h-14 w-full max-w-7xl items-center justify-between px-6">
                <p className="font-display text-base font-semibold tracking-tight">{currentSection}</p>
                <div className="flex items-center gap-2">
                  <Link href={getHref("/cart")} className="relative inline-flex">
                    <Button variant="ghost" size="icon" className="h-9 w-9 rounded-full" aria-label="Cart">
                      <ShoppingCart className="h-4 w-4" />
                    </Button>
                    {cartCount > 0 ? (
                      <Badge className="absolute -right-1 -top-1 h-4 min-w-4 px-1 text-[10px]">{cartCount > 9 ? "9+" : cartCount}</Badge>
                    ) : null}
                  </Link>
                  <ThemeToggle />
                </div>
              </div>
            </header>

            {isPreviewMode ? <PreviewBanner /> : null}

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
                    className="fixed left-0 top-0 bottom-0 z-50 w-72 max-w-[85vw] bg-card/96 backdrop-blur-xl border-r border-border/80 shadow-[0_18px_40px_rgba(2,6,23,0.35)] overflow-y-auto lg:hidden"
                  >
                    {/* Menu Header */}
                    <div className="border-b border-border/80 p-4 flex items-center justify-between sticky top-0 bg-card/96 backdrop-blur-xl z-10 h-16">
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
                        className="border-t border-border/80 px-4 py-4 space-y-3 sticky bottom-0 bg-card/96 backdrop-blur-xl"
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
                                <AvatarImage src={(avatarOverride ?? session?.user?.image) || undefined} alt={session.user.name || session.user.email || "User"} />
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
                                {planName}
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
                            <SignOutButton className="w-full h-10 text-[10px] font-bold uppercase tracking-widest shadow-lg hover:shadow-xl hover:shadow-destructive/25 border-none rounded-xl transition-all duration-300" />
                          </motion.div>
                        </div>
                      </motion.div>
                    )}
                  </motion.nav>
                </>
              )}
            </AnimatePresence>

            <Footer />
          </div>
        </div>

        <div className="lg:hidden">
          <header className="sticky top-0 z-40 border-b border-border/80 bg-background/95 backdrop-blur">
            <div className="mx-auto flex h-14 w-full max-w-7xl items-center justify-between px-4">
              <Link href={getHref("/dashboard")} className="inline-flex items-center">
                <Image src="/logo.png" alt="AI Genius Lab" width={132} height={30} className="h-7 w-auto object-contain" priority />
              </Link>
              <div className="flex items-center gap-1">
                <Link href={getHref("/cart")} className="relative inline-flex">
                  <Button variant="ghost" size="icon" className="h-9 w-9 rounded-full" aria-label="Cart">
                    <ShoppingCart className="h-4 w-4" />
                  </Button>
                  {cartCount > 0 ? (
                    <Badge className="absolute -right-1 -top-1 h-4 min-w-4 px-1 text-[10px]">{cartCount > 9 ? "9+" : cartCount}</Badge>
                  ) : null}
                </Link>
                <ThemeToggle />
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-9 w-9 rounded-full"
                  onClick={() => setIsMobileOpen((open) => !open)}
                  aria-label="Toggle menu"
                >
                  {isMobileOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
                </Button>
              </div>
            </div>
          </header>

          {isMobileOpen ? (
            <div className="border-b border-border/80 bg-background px-4 pb-4 pt-2">
              <nav className="grid gap-1">
                {appNavigation.map((item) => {
                  const Icon = item.icon;
                  const active = isActivePath(pathname, item.href);

                  return (
                    <Link
                      key={item.href}
                      href={getHref(item.href)}
                      onClick={() => setIsMobileOpen(false)}
                      className={cn(
                        "inline-flex items-center gap-2 rounded-[var(--radius-sm)] px-3 py-2 text-sm font-medium",
                        active
                          ? "bg-accent text-foreground"
                          : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                      )}
                    >
                      <Icon className="h-4 w-4" />
                      {item.name}
                    </Link>
                  );
                })}
                <div className="mt-2 border-t pt-3">
                  <SignOutButton className="h-9 w-full justify-center" />
                </div>
              </nav>
            </div>
          ) : null}

          {isPreviewMode ? <PreviewBanner /> : null}

          <main className="pb-16">
            <div className="mx-auto w-full max-w-7xl px-4 py-5">{children}</div>
          </main>

          <nav className="fixed inset-x-0 bottom-0 z-30 border-t border-border/80 bg-background/95 backdrop-blur">
            <div className="grid grid-cols-5 px-2 py-1">
              {mobileBottomNavigation.map((item) => {
                const Icon = item.icon;
                const active = isActivePath(pathname, item.href);

                return (
                  <Link
                    key={item.href}
                    href={getHref(item.href)}
                    className={cn(
                      "flex min-h-[48px] flex-col items-center justify-center gap-1 rounded-[var(--radius-sm)] text-[11px] font-medium",
                      active ? "text-primary" : "text-muted-foreground"
                    )}
                  >
                    <Icon className="h-4 w-4" />
                    <span>{item.name}</span>
                  </Link>
                );
              })}
            </div>
          </nav>
        </div>
      </AppShell>
    </CourseProgressProvider>
  );
}
