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
  Settings,
  Menu,
  X,
  Shield,
  Route,
  User,
  Eye,
  ExternalLink,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { SignOutButton } from "@/components/auth/SignOutButton";
import { BackgroundBlobs } from "@/components/ui/background-blobs";
import { CartIcon } from "@/components/cart/CartIcon";
import { cn } from "@/lib/utils";
import { useState, useEffect, useRef } from "react";

const adminNavigation = [
  { name: "Dashboard", href: "/admin", icon: LayoutDashboard },
  { name: "Courses", href: "/admin/courses", icon: BookOpen },
  { name: "Learning Paths", href: "/admin/learning-paths", icon: Route },
  { name: "Users", href: "/admin/users", icon: Users },
  { name: "Purchases", href: "/admin/purchases", icon: Receipt },
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
    <div className="min-h-screen bg-background text-foreground relative overflow-x-hidden">
      <BackgroundBlobs />
      
      {/* Desktop Layout */}
      <div className="hidden md:flex h-screen overflow-hidden">
        {/* Desktop Sidebar - Fixed */}
        <motion.aside
          initial={{ x: -100, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.3 }}
          className="w-64 flex-col border-r bg-card/80 backdrop-blur-md flex fixed left-0 top-0 bottom-0 z-20"
        >
          {/* Sidebar Header - Fixed at top */}
          <div className="flex-shrink-0 border-b p-4">
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center gap-2"
            >
              <Shield className="h-5 w-5 text-primary" />
              <Link href="/admin" className="font-display text-xl font-bold tracking-tight">
                ADMIN
              </Link>
            </motion.div>
          </div>
          
          {/* Scrollable Navigation */}
          <div className="flex-1 overflow-y-auto px-3 py-4">
            <div className="space-y-4">
              <div>
                <p className="px-3 text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground mb-2">
                  Admin Panel
                </p>
                <nav className="grid gap-2">
                  {adminNavigation.map((item) => {
                    const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
                    const Icon = item.icon;
                    return (
                      <motion.div
                        key={item.href}
                        whileHover={{ x: 4 }}
                        transition={{ type: "spring", stiffness: 400, damping: 17 }}
                      >
                        <Link
                          href={item.href}
                          className={cn(
                            "flex items-center gap-3 rounded-lg pl-1 pr-3 py-2 text-sm font-medium transition-colors",
                            isActive
                              ? "bg-primary text-primary-foreground"
                              : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                          )}
                        >
                          <Icon className="h-4 w-4" />
                          {item.name}
                        </Link>
                      </motion.div>
                    );
                  })}
                </nav>
              </div>

              <div className="border-t pt-4 mt-4">
                <div className="px-3 flex items-center gap-2 mb-2">
                  <Eye className="h-3 w-3 text-amber-500" />
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                    Customer Preview
                  </p>
                </div>
                <p className="px-3 text-xs text-muted-foreground mb-3">
                  View pages as customers see them
                </p>
                <nav className="grid gap-1">
                  {customerPreviewLinks.map((item) => {
                    const Icon = item.icon;
                    const previewHref = `${item.href}?preview=true`;
                    return (
                      <motion.div
                        key={item.href}
                        whileHover={{ x: 4 }}
                        transition={{ type: "spring", stiffness: 400, damping: 17 }}
                      >
                        <Link
                          href={previewHref}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-3 rounded-lg pl-1 pr-3 py-2 text-sm font-medium transition-colors text-muted-foreground hover:bg-amber-500/10 hover:text-amber-700 dark:hover:text-amber-300"
                        >
                          <Icon className="h-4 w-4" />
                          {item.name}
                        </Link>
                      </motion.div>
                    );
                  })}
                </nav>
              </div>
            </div>
          </div>

          {/* Sidebar Footer - Fixed at bottom */}
          <div className="flex-shrink-0 border-t p-4 space-y-4">
            {session?.user && (
              <>
                <Link href="/admin/profile">
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    className="flex items-center gap-3 p-2 rounded-lg hover:bg-accent transition-colors cursor-pointer"
                  >
                    <Avatar className="h-10 w-10 ring-2 ring-primary ring-offset-2 ring-offset-card">
                      <AvatarImage src={session.user.image || undefined} alt={session.user.name || session.user.email || "Admin"} />
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
                      <p className="truncate text-xs text-muted-foreground">
                        Admin
                      </p>
                    </div>
                  </motion.div>
                </Link>
                <div className="flex items-center gap-2">
                  <CartIcon />
                  <ThemeToggle />
                  <SignOutButton />
                </div>
              </>
            )}
          </div>
        </motion.aside>

        {/* Desktop Main Content Area */}
        <div className="flex-1 flex flex-col ml-64 overflow-hidden">
          {/* Scrollable Main Content */}
          <main className="flex-1 overflow-y-auto">
            <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 py-4 sm:py-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                {children}
              </motion.div>
            </div>
          </main>
        </div>
      </div>

      {/* Mobile Layout */}
      <div className="flex md:hidden flex-col min-h-screen">
          <header className="fixed top-0 left-0 right-0 z-50 border-b bg-background/80 backdrop-blur-md supports-[backdrop-filter]:bg-background/60">
            <div className="flex items-center justify-between px-3 sm:px-4 pt-3 sm:pt-4 pb-2 sm:pb-3">
              <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0 min-w-0">
                <Shield className="h-4 w-4 sm:h-5 sm:w-5 text-primary flex-shrink-0" />
                <Link href="/admin" className="font-display text-base sm:text-lg font-bold truncate">
                  ADMIN
                </Link>
              </div>
              <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
                <CartIcon />
                <ThemeToggle />
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                  className="h-9 w-9 sm:h-10 sm:w-10"
                >
                  {mobileMenuOpen ? (
                    <X className="h-4 w-4 sm:h-5 sm:w-5" />
                  ) : (
                    <Menu className="h-4 w-4 sm:h-5 sm:w-5" />
                  )}
                </Button>
              </div>
            </div>
            <AnimatePresence>
              {mobileMenuOpen && (
                <>
                  {/* Backdrop */}
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
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
                    className="relative z-50 border-t bg-background shadow-lg"
                  >
                    <div className="px-4 py-6 space-y-6">
                      <div>
                        <motion.p
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.1 }}
                          className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground mb-3 px-1"
                        >
                          Admin Panel
                        </motion.p>
                        <div className="space-y-1">
                          {adminNavigation.map((item, index) => {
                            const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
                            const Icon = item.icon;
                            return (
                              <motion.div
                                key={item.href}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.05 * (index + 1) + 0.15 }}
                              >
                                <Link
                                  href={item.href}
                                  onClick={() => setMobileMenuOpen(false)}
                                  className={cn(
                                    "flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-all active:scale-[0.98]",
                                    isActive
                                      ? "bg-primary text-primary-foreground shadow-sm"
                                      : "text-foreground hover:bg-accent hover:text-accent-foreground"
                                  )}
                                >
                                  <Icon className="h-5 w-5 flex-shrink-0" />
                                  <span>{item.name}</span>
                                </Link>
                              </motion.div>
                            );
                          })}
                        </div>
                      </div>
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                        className="border-t pt-4"
                      >
                        <div className="flex items-center gap-2 mb-2 px-1">
                          <Eye className="h-4 w-4 text-amber-500" />
                          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                            Customer Preview
                          </p>
                        </div>
                        <p className="text-xs text-muted-foreground mb-3 px-1">
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
                                transition={{ delay: 0.05 * index + 0.45 }}
                              >
                                <Link
                                  href={previewHref}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  onClick={() => setMobileMenuOpen(false)}
                                  className="flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-all text-foreground hover:bg-amber-500/10 hover:text-amber-700 dark:hover:text-amber-300 active:scale-[0.98]"
                                >
                                  <Icon className="h-5 w-5 flex-shrink-0" />
                                  <span>{item.name}</span>
                                </Link>
                              </motion.div>
                            );
                          })}
                        </div>
                      </motion.div>
                    </div>
                    {session?.user && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.6 }}
                        className="border-t px-4 py-4 space-y-3 mt-2"
                      >
                        <Link href="/admin/profile" onClick={() => setMobileMenuOpen(false)}>
                          <div className="flex items-center gap-3 p-3 rounded-lg hover:bg-accent transition-colors active:scale-[0.98]">
                            <Avatar className="h-10 w-10 ring-2 ring-primary ring-offset-2 ring-offset-background">
                              <AvatarImage src={session.user.image || undefined} alt={session.user.name || session.user.email || "Admin"} />
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
                              <p className="truncate text-xs text-muted-foreground">
                                Admin
                              </p>
                            </div>
                          </div>
                        </Link>
                        <div className="flex items-center gap-2">
                          <CartIcon />
                          <ThemeToggle />
                          <SignOutButton />
                        </div>
                      </motion.div>
                    )}
                  </motion.nav>
                </>
              )}
            </AnimatePresence>
          </header>
          <main className="flex-1 px-3 sm:px-4 py-4 pt-16 sm:pt-20 pb-6 overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              {children}
            </motion.div>
          </main>
        </div>
    </div>
  );
}
