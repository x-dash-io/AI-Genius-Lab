"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  BookOpen,
  Users,
  ShoppingCart,
  Receipt,
  Menu,
  X,
  Shield,
  Route,
  User,
  Eye,
  Newspaper,
  CreditCard,
  ShieldCheck,
  Ticket,
  Settings,
  PanelLeftClose,
  PanelLeft,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { SignOutButton } from "@/components/auth/SignOutButton";
import { HeroBackgroundBlobs } from "@/components/ui/hero-background-blobs";
import { CartIcon } from "@/components/cart/CartIcon";
import { ConfirmDialogProvider } from "@/components/ui/confirm-dialog";
import { Footer } from "@/components/layout/Footer";
import { cn } from "@/lib/utils";
import { useState, useEffect, useRef } from "react";

const adminNavigation = [
  { name: "Dashboard", href: "/admin", icon: LayoutDashboard },
  { name: "Courses", href: "/admin/courses", icon: BookOpen },
  { name: "Learning Paths", href: "/admin/learning-paths", icon: Route },
  { name: "Categories", href: "/admin/categories", icon: ShoppingCart },
  { name: "Subscription Plans", href: "/admin/subscriptions/plans", icon: CreditCard },
  { name: "User Subscriptions", href: "/admin/subscriptions/users", icon: ShieldCheck },
  { name: "Users", href: "/admin/users", icon: Users },
  { name: "Purchases", href: "/admin/purchases", icon: Receipt },
  { name: "Coupons", href: "/admin/coupons", icon: Ticket },
  { name: "Blog", href: "/admin/blog", icon: Newspaper },
  { name: "Settings", href: "/admin/settings", icon: Settings },
  { name: "Profile", href: "/admin/profile", icon: User },
];

const customerPreviewLinks = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Course Catalog", href: "/courses", icon: BookOpen },
  { name: "Learning Paths", href: "/learning-paths", icon: Route },
];

export function AdminLayoutClient({ children }: { children: React.ReactNode }) {
  const { data: session } = useSession();
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const menuRef = useRef<HTMLElement>(null);
  const avatarUrl = session?.user?.image;

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

  return (
    <ConfirmDialogProvider>
      <div className="min-h-screen bg-background text-foreground relative overflow-x-hidden">
        <HeroBackgroundBlobs />

        {/* Desktop Layout */}
        <div className="hidden md:flex min-h-screen">
          {/* Desktop Sidebar - Fixed */}
          <motion.aside
            initial={{ x: -100, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.3 }}
            className="w-64 flex-col border-r bg-background/90 backdrop-blur-md flex fixed left-0 top-0 bottom-0 z-20"
          >
            {/* Sidebar Header - Fixed at top */}
            <div className="flex-shrink-0 border-b p-6">
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="flex items-center gap-2"
              >
                <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center">
                  <Shield className="h-5 w-5 text-white" />
                </div>
                <Link href="/admin" className="font-display text-lg font-bold tracking-tight">
                  ADMIN
                </Link>
              </motion.div>
            </div>

            {/* Scrollable Navigation */}
            <div className="flex-1 overflow-y-auto px-4 py-6">
              <div className="space-y-6">
                <div>
                  <p className="px-3 text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground mb-3">
                    Admin Panel
                  </p>
                  <nav className="space-y-1">
                    {adminNavigation.map((item) => {
                      const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
                      const Icon = item.icon;
                      return (
                        <motion.div
                          key={item.href}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          transition={{ type: "spring", stiffness: 400, damping: 17 }}
                        >
                          <Link
                            href={item.href}
                            className={cn(
                              "group relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200 overflow-hidden",
                              "hover:bg-gradient-to-r hover:from-primary/10 hover:to-primary/5",
                              "hover:shadow-sm hover:shadow-primary/10",
                              isActive
                                ? "bg-gradient-to-r from-primary/90 to-primary text-primary-foreground shadow-sm"
                                : "text-muted-foreground hover:text-accent-foreground"
                            )}
                          >
                            {/* Animated gradient background for active state */}
                            {isActive && (
                              <motion.div
                                className="absolute inset-0 bg-gradient-to-r from-primary/80 to-primary opacity-90"
                                initial={false}
                                animate={{
                                  background: [
                                    "linear-gradient(90deg, rgb(var(--color-primary) * 0.8) 0%, rgb(var(--color-primary)) 50%, rgb(var(--color-primary) * 0.8) 100%)",
                                    "linear-gradient(90deg, rgb(var(--color-primary)) 0%, rgb(var(--color-primary) * 0.8) 50%, rgb(var(--color-primary)) 100%)",
                                    "linear-gradient(90deg, rgb(var(--color-primary) * 0.8) 0%, rgb(var(--color-primary)) 50%, rgb(var(--color-primary) * 0.8) 100%)"
                                  ]
                                }}
                                transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                              />
                            )}
                            {/* Hover overlay */}
                            <div className="absolute inset-0 bg-gradient-to-r from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                            <Icon className="nav-icon h-5 w-5 flex-shrink-0 transition-transform duration-200 group-hover:scale-110 group-hover:rotate-3 relative z-10" />
                            <span className="relative z-10 transition-colors duration-200">{item.name}</span>

                            {/* Active indicator */}
                            {isActive && (
                              <motion.div
                                className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-primary rounded-full shadow-sm shadow-primary/50"
                                layoutId="activeIndicator"
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

                <div className="border-t pt-6">
                  <div className="px-3 flex items-center gap-2 mb-3">
                    <Eye className="h-3.5 w-3.5 text-amber-500" />
                    <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                      Customer Preview
                    </p>
                  </div>
                  <p className="px-3 text-xs text-muted-foreground mb-3">
                    View pages as customers see them
                  </p>
                  <nav className="space-y-1">
                    {customerPreviewLinks.map((item) => {
                      const Icon = item.icon;
                      const previewHref = `${item.href}?preview=true`;
                      return (
                        <motion.div
                          key={item.href}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          transition={{ type: "spring", stiffness: 400, damping: 17 }}
                        >
                          <Link
                            href={previewHref}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={cn(
                              "group relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200 overflow-hidden",
                              "hover:bg-gradient-to-r hover:from-amber-500/10 hover:to-amber-400/5",
                              "hover:shadow-sm hover:shadow-amber-500/10",
                              "text-foreground hover:text-amber-700 dark:hover:text-amber-300"
                            )}
                          >
                            {/* Hover overlay */}
                            <div className="absolute inset-0 bg-gradient-to-r from-amber-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                            <Icon className="nav-icon h-5 w-5 flex-shrink-0 transition-transform duration-200 group-hover:scale-110 group-hover:rotate-3 relative z-10" />
                            <span className="relative z-10 transition-colors duration-200">{item.name}</span>

                            {/* External link indicator */}
                            <div className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                              <div className="h-3 w-3 rounded-full bg-amber-500/20 flex items-center justify-center">
                                <div className="h-1.5 w-1.5 rounded-full bg-amber-500" />
                              </div>
                            </div>
                          </Link>
                        </motion.div>
                      );
                    })}
                  </nav>
                </div>
              </div>
            </div>

            {/* Sidebar Footer - Fixed at bottom */}
            <div className="flex-shrink-0 p-4 mt-auto border-t border-border/50">
              {session?.user && (
                <div className="space-y-4">
                  <Link href="/admin/profile">
                    <motion.div
                      whileHover={{ y: -2, boxShadow: "0 12px 40px rgba(0,0,0,0.15)" }}
                      whileTap={{ scale: 0.98 }}
                      className="group relative flex items-center gap-3 p-4 rounded-2xl backdrop-blur-md bg-white/10 border border-white/20 transition-all cursor-pointer shadow-lg hover:shadow-xl"
                      style={{
                        background: "linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)",
                        backdropFilter: "blur(10px)"
                      }}
                    >
                      {/* Animated gradient overlay */}
                      <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                      <div className="relative">
                        <Avatar className="h-12 w-12 ring-2 ring-primary/20 group-hover:ring-primary/40 transition-all duration-300">
                          <AvatarImage src={avatarUrl || undefined} alt={session.user.name || session.user.email || "Admin"} />
                          <AvatarFallback className="bg-gradient-to-br from-primary to-primary/80 text-primary-foreground text-sm font-bold">
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
                        <p className="truncate text-sm font-bold tracking-tight text-foreground/90 group-hover:text-foreground transition-colors duration-200">
                          {session.user.name || session.user.email}
                        </p>
                        <p className="truncate text-xs font-semibold uppercase tracking-[0.1em] text-muted-foreground/70 group-hover:text-muted-foreground transition-colors duration-200">
                          Administrator
                        </p>
                      </div>

                      {/* Hover indicator */}
                      <motion.div
                        className="absolute inset-0 rounded-2xl border border-primary/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                        initial={false}
                        animate={{
                          background: [
                            "linear-gradient(45deg, transparent 30%, rgba(var(--color-primary), 0.1) 50%, transparent 70%)",
                            "linear-gradient(45deg, transparent 30%, rgba(var(--color-primary), 0.05) 50%, transparent 70%)"
                          ]
                        }}
                        transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                      />
                    </motion.div>
                  </Link>

                  {/* Modern Action Bar */}
                  <motion.div
                    className="flex items-center gap-2 p-2 rounded-2xl backdrop-blur-md bg-white/5 border border-white/10 shadow-lg"
                    whileHover={{ y: -1, boxShadow: "0 8px 32px rgba(0,0,0,0.12)" }}
                    style={{
                      background: "linear-gradient(135deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.02) 100%)"
                    }}
                  >
                    <div className="flex items-center gap-1 flex-1">
                      <motion.div
                        className="p-2 rounded-xl hover:bg-white/10 transition-colors duration-200 cursor-pointer"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <CartIcon />
                      </motion.div>
                      <motion.div
                        className="p-2 rounded-xl hover:bg-white/10 transition-colors duration-200 cursor-pointer"
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
                      <SignOutButton className="modern-btn h-10 px-4 text-[10px] font-bold uppercase tracking-widest bg-gradient-to-r from-destructive to-destructive/80 hover:from-destructive/90 hover:to-destructive text-white shadow-lg hover:shadow-xl hover:shadow-destructive/25 border-none rounded-xl transition-all duration-300" />
                    </motion.div>
                  </motion.div>
                </div>
              )}
            </div>
          </motion.aside>

          {/* Desktop Main Content Area */}
          <div className="flex-1 flex flex-col ml-64">
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
        <div className="flex md:hidden flex-col min-h-screen">
          <header className="fixed top-0 left-0 right-0 z-50 border-b bg-background/80 backdrop-blur-md supports-[backdrop-filter]:bg-background/60 h-16">
            <div className="flex items-center justify-between px-4 h-full">
              <Link href="/admin" className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center">
                  <Shield className="h-5 w-5 text-white" />
                </div>
                <span className="font-display text-lg font-bold tracking-tight">
                  ADMIN
                </span>
              </Link>
              <div className="flex items-center gap-2 flex-shrink-0">
                <CartIcon />
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
                  className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 md:hidden"
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
                  className="fixed left-0 top-0 bottom-0 z-50 w-72 max-w-[85vw] bg-background/95 backdrop-blur-md border-r shadow-2xl overflow-y-auto md:hidden"
                >
                  {/* Menu Header */}
                  <div className="border-b p-4 flex items-center justify-between sticky top-0 bg-card/95 backdrop-blur-md z-10 h-16">
                    <Link href="/admin" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-2">
                      <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center">
                        <Shield className="h-5 w-5 text-white" />
                      </div>
                      <span className="font-display text-lg font-bold">
                        ADMIN
                      </span>
                    </Link>
                  </div>

                  {/* Navigation Items */}
                  <div className="px-3 py-4 pb-32">
                    <div className="space-y-4">
                      <div>
                        <p className="px-3 text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground mb-2">
                          Admin Panel
                        </p>
                        <div className="space-y-1">
                          {adminNavigation.map((item, index) => {
                            const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
                            const Icon = item.icon;
                            return (
                              <motion.div
                                key={item.href}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.05 * (index + 1) }}
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                              >
                                <Link
                                  href={item.href}
                                  onClick={() => setMobileMenuOpen(false)}
                                  className={cn(
                                    "group relative flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-medium transition-all duration-200 overflow-hidden active:scale-[0.98]",
                                    "hover:bg-gradient-to-r hover:from-primary/10 hover:to-primary/5",
                                    "hover:shadow-sm hover:shadow-primary/10",
                                    isActive
                                      ? "bg-gradient-to-r from-primary/90 to-primary text-primary-foreground shadow-sm"
                                      : "text-foreground hover:text-accent-foreground"
                                  )}
                                >
                                  {/* Animated gradient background for active state */}
                                  {isActive && (
                                    <motion.div
                                      className="absolute inset-0 bg-gradient-to-r from-primary/80 to-primary opacity-90"
                                      initial={false}
                                      animate={{
                                        background: [
                                          "linear-gradient(90deg, rgb(var(--color-primary) * 0.8) 0%, rgb(var(--color-primary)) 50%, rgb(var(--color-primary) * 0.8) 100%)",
                                          "linear-gradient(90deg, rgb(var(--color-primary)) 0%, rgb(var(--color-primary) * 0.8) 50%, rgb(var(--color-primary)) 100%)",
                                          "linear-gradient(90deg, rgb(var(--color-primary) * 0.8) 0%, rgb(var(--color-primary)) 50%, rgb(var(--color-primary) * 0.8) 100%)"
                                        ]
                                      }}
                                      transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                                    />
                                  )}
                                  {/* Hover overlay */}
                                  <div className="absolute inset-0 bg-gradient-to-r from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                                  <Icon className="nav-icon h-5 w-5 flex-shrink-0 transition-transform duration-200 group-hover:scale-110 group-hover:rotate-3 relative z-10" />
                                  <span className="relative z-10 transition-colors duration-200">{item.name}</span>

                                  {/* Active indicator */}
                                  {isActive && (
                                    <motion.div
                                      className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-primary rounded-full shadow-sm shadow-primary/50"
                                      initial={{ opacity: 0, scale: 0 }}
                                      animate={{ opacity: 1, scale: 1 }}
                                      transition={{ type: "spring", stiffness: 300, damping: 20 }}
                                    />
                                  )}
                                </Link>
                              </motion.div>
                            );
                          })}
                        </div>
                      </div>

                      <div className="border-t pt-4">
                        <div className="flex items-center gap-2 mb-2 px-3">
                          <Eye className="h-3.5 w-3.5 text-amber-500" />
                          <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                            Customer Preview
                          </p>
                        </div>
                        <p className="px-3 text-xs text-muted-foreground mb-2">
                          Opens in new tab
                        </p>
                        <div className="space-y-1">
                          {customerPreviewLinks.map((item, index) => {
                            const Icon = item.icon;
                            const previewHref = `${item.href}?preview=true`;
                            return (
                              <motion.div
                                key={item.href}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.05 * (index + 4) }}
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                              >
                                <Link
                                  href={previewHref}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  onClick={() => setMobileMenuOpen(false)}
                                  className={cn(
                                    "group relative flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-medium transition-all duration-200 overflow-hidden active:scale-[0.98]",
                                    "hover:bg-gradient-to-r hover:from-amber-500/10 hover:to-amber-400/5",
                                    "hover:shadow-sm hover:shadow-amber-500/10",
                                    "text-foreground hover:text-amber-700 dark:hover:text-amber-300"
                                  )}
                                >
                                  {/* Hover overlay */}
                                  <div className="absolute inset-0 bg-gradient-to-r from-amber-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                                  <Icon className="nav-icon h-5 w-5 flex-shrink-0 transition-transform duration-200 group-hover:scale-110 group-hover:rotate-3 relative z-10" />
                                  <span className="relative z-10 transition-colors duration-200">{item.name}</span>

                                  {/* External link indicator */}
                                  <div className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                                    <div className="h-3 w-3 rounded-full bg-amber-500/20 flex items-center justify-center">
                                      <div className="h-1.5 w-1.5 rounded-full bg-amber-500" />
                                    </div>
                                  </div>
                                </Link>
                              </motion.div>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* User Profile Section */}
                  {session?.user && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.4 }}
                      className="border-t px-4 py-4 space-y-3 sticky bottom-0 bg-card/95 backdrop-blur-md"
                    >
                      <Link href="/admin/profile" onClick={() => setMobileMenuOpen(false)}>
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
                              <AvatarImage src={avatarUrl || undefined} alt={session.user.name || session.user.email || "Admin"} />
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
                              {session.user.name || session.user.email}
                            </p>
                            <p className="truncate text-xs text-muted-foreground group-hover:text-muted-foreground transition-colors duration-200">
                              Admin
                            </p>
                          </div>
                        </motion.div>
                      </Link>
                      <div className="flex items-center gap-2 px-1">
                        <motion.div
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          className="flex-1"
                        >
                          <SignOutButton className="modern-btn w-full h-10 text-[10px] font-bold uppercase tracking-widest bg-gradient-to-r from-destructive to-destructive/80 hover:from-destructive/90 hover:to-destructive text-white shadow-lg hover:shadow-xl hover:shadow-destructive/25 border-none rounded-xl transition-all duration-300" />
                        </motion.div>
                      </div>
                    </motion.div>
                  )}
                </motion.nav>
              </>
            )}
          </AnimatePresence>

          {/* Main Content */}
          <main className="flex-1 px-4 sm:px-6 py-4 pt-20 pb-12 relative z-10">
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
    </ConfirmDialogProvider>
  );
}
