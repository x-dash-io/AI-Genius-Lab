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
  FileText,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { SignOutButton } from "@/components/auth/SignOutButton";
import { BackgroundBlobs } from "@/components/ui/background-blobs";
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
  { name: "Blog", href: "/admin/blog", icon: FileText },
  { name: "Users", href: "/admin/users", icon: Users },
  { name: "Purchases", href: "/admin/purchases", icon: Receipt },
  { name: "Profile", href: "/admin/profile", icon: User },
];

const customerPreviewLinks = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Course Catalog", href: "/courses", icon: BookOpen },
  { name: "Learning Paths", href: "/learning-paths", icon: Route },
  { name: "Blog", href: "/blog", icon: FileText },
];

export function AdminLayoutClient({ children }: { children: React.ReactNode }) {
  const { data: session } = useSession();
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const menuRef = useRef<HTMLElement>(null);
  const [avatarUrl, setAvatarUrl] = useState<string | null | undefined>(session?.user?.image);

  // Listen for avatar updates
  useEffect(() => {
    const handleAvatarUpdate = (event: CustomEvent) => {
      setAvatarUrl(event.detail.imageUrl);
    };

    window.addEventListener('avatarUpdated', handleAvatarUpdate as EventListener);
    return () => {
      window.removeEventListener('avatarUpdated', handleAvatarUpdate as EventListener);
    };
  }, []);

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

  return (
    <ConfirmDialogProvider>
      <div className="min-h-screen bg-background text-foreground relative overflow-x-hidden">
        <BackgroundBlobs />
      
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
          <div className="flex-1 overflow-y-auto overflow-x-hidden px-4 py-6">
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
                        whileHover={{ x: 4 }}
                        transition={{ type: "spring", stiffness: 400, damping: 17 }}
                      >
                        <Link
                          href={item.href}
                          className={cn(
                            "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all",
                            isActive
                              ? "bg-primary text-primary-foreground shadow-sm"
                              : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                          )}
                        >
                          <Icon className="h-5 w-5 flex-shrink-0" />
                          {item.name}
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
                        whileHover={{ x: 4 }}
                        transition={{ type: "spring", stiffness: 400, damping: 17 }}
                      >
                        <Link
                          href={previewHref}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all text-muted-foreground hover:bg-amber-500/10 hover:text-amber-700 dark:hover:text-amber-300"
                        >
                          <Icon className="h-5 w-5 flex-shrink-0" />
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
          <div className="flex-shrink-0 border-t p-4 mt-auto">
            {session?.user && (
              <div className="space-y-3">
                <Link href="/admin/profile">
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    className="flex items-center gap-3 p-3 rounded-lg hover:bg-accent transition-colors cursor-pointer"
                  >
                    <Avatar className="h-10 w-10 ring-2 ring-primary/20">
                      <AvatarImage src={avatarUrl || undefined} alt={session.user.name || session.user.email || "Admin"} />
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
                      <p className="truncate text-sm font-medium">
                        {session.user.name || session.user.email}
                      </p>
                      <p className="truncate text-xs text-muted-foreground">
                        Admin
                      </p>
                    </div>
                  </motion.div>
                </Link>
                <div className="flex flex-col gap-2">
                  <SignOutButton className="w-full" />
                  <div className="flex items-center justify-center gap-2">
                    <CartIcon />
                    <ThemeToggle />
                  </div>
                </div>
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
              <SignOutButton size="icon" variant="ghost" />
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
                                <span>{item.name}</span>
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
                            >
                              <Link
                                href={previewHref}
                                target="_blank"
                                rel="noopener noreferrer"
                                onClick={() => setMobileMenuOpen(false)}
                                className="flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-medium transition-all text-foreground hover:bg-amber-500/10 hover:text-amber-700 dark:hover:text-amber-300 active:scale-[0.98]"
                              >
                                <Icon className="h-5 w-5 flex-shrink-0" />
                                <span>{item.name}</span>
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
                      <div className="flex items-center gap-3 p-3 rounded-lg hover:bg-accent transition-colors active:scale-[0.98]">
                        <Avatar className="h-10 w-10 ring-2 ring-primary/20">
                          <AvatarImage src={avatarUrl || undefined} alt={session.user.name || session.user.email || "Admin"} />
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
                    <div className="flex items-center gap-2 px-1">
                      <SignOutButton className="flex-1" />
                    </div>
                  </motion.div>
                )}
              </motion.nav>
            </>
          )}
        </AnimatePresence>
        
        {/* Main Content */}
        <main className="flex-1 px-3 sm:px-4 py-4 pt-20 pb-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            {children}
          </motion.div>
        </main>
        <Footer />
      </div>
      </div>
    </ConfirmDialogProvider>
  );
}
