"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { motion } from "framer-motion";
import {
  LayoutDashboard,
  BookOpen,
  Users,
  ShoppingCart,
  Settings,
  Menu,
  X,
  Shield,
  Route,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { SignOutButton } from "@/components/auth/SignOutButton";
import { BackgroundBlobs } from "@/components/ui/background-blobs";
import { cn } from "@/lib/utils";
import { useState } from "react";

const adminNavigation = [
  { name: "Dashboard", href: "/admin", icon: LayoutDashboard },
  { name: "Courses", href: "/admin/courses", icon: BookOpen },
  { name: "Learning Paths", href: "/admin/learning-paths", icon: Route },
  { name: "Users", href: "/admin/users", icon: Users },
  { name: "Purchases", href: "/admin/purchases", icon: ShoppingCart },
];

const regularNavigation = [
  { name: "Customer Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "My Courses", href: "/library", icon: BookOpen },
  { name: "Browse Courses", href: "/courses", icon: BookOpen },
];

export function AdminLayoutClient({ children }: { children: React.ReactNode }) {
  const { data: session } = useSession();
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background text-foreground relative overflow-x-hidden">
      <BackgroundBlobs />
      <div className="flex h-screen overflow-hidden">
        {/* Desktop Sidebar - Fixed */}
        <motion.aside
          initial={{ x: -100, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.3 }}
          className="hidden w-64 flex-col border-r bg-card/80 backdrop-blur-md md:flex fixed left-0 top-0 bottom-0 z-20"
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

              <div>
                <p className="px-3 text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground mb-2">
                  Customer View
                </p>
                <nav className="grid gap-2">
                  {regularNavigation.map((item) => {
                    const Icon = item.icon;
                    return (
                      <motion.div
                        key={item.href}
                        whileHover={{ x: 4 }}
                        transition={{ type: "spring", stiffness: 400, damping: 17 }}
                      >
                        <Link
                          href={item.href}
                          className="flex items-center gap-3 rounded-lg pl-1 pr-3 py-2 text-sm font-medium transition-colors text-muted-foreground hover:bg-accent hover:text-accent-foreground"
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
                <div className="flex items-center gap-3">
                  <Avatar className="ring-2 ring-primary ring-offset-2 ring-offset-card">
                    <AvatarFallback className="bg-primary text-primary-foreground">
                      {session.user.email?.charAt(0).toUpperCase() || "A"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 overflow-hidden">
                    <p className="truncate text-sm font-medium">
                      {session.user.email}
                    </p>
                    <p className="truncate text-xs text-muted-foreground">
                      Admin
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <ThemeToggle />
                  <SignOutButton />
                </div>
              </>
            )}
          </div>
        </motion.aside>

        {/* Desktop Main Content Area */}
        <div className="flex-1 flex flex-col md:ml-64 overflow-hidden">
          {/* Scrollable Main Content */}
          <main className="flex-1 overflow-y-auto">
            <div className="mx-auto w-full max-w-7xl px-6 py-6">
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

        {/* Mobile Layout */}
        <div className="flex flex-1 flex-col md:hidden">
          <header className="fixed top-0 left-0 right-0 z-50 border-b bg-background/80 backdrop-blur-md supports-[backdrop-filter]:bg-background/60">
            <div className="flex items-center justify-between px-4 pt-4 pb-3">
              <div className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-primary" />
                <Link href="/admin" className="font-display text-lg font-bold">
                  ADMIN
                </Link>
              </div>
              <div className="flex items-center gap-2">
                <ThemeToggle />
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                >
                  {mobileMenuOpen ? (
                    <X className="h-5 w-5" />
                  ) : (
                    <Menu className="h-5 w-5" />
                  )}
                </Button>
              </div>
            </div>
            {mobileMenuOpen && (
              <motion.nav
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="border-t bg-card/80 backdrop-blur-md px-4 py-4"
              >
                <div className="space-y-4">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground mb-2">
                      Admin Panel
                    </p>
                    <div className="space-y-2">
                      {adminNavigation.map((item) => {
                        const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
                        const Icon = item.icon;
                        return (
                          <Link
                            key={item.href}
                            href={item.href}
                            onClick={() => setMobileMenuOpen(false)}
                            className={cn(
                              "flex items-center gap-3 rounded-lg pl-1 pr-3 py-2 text-sm font-medium transition-colors",
                              isActive
                                ? "bg-primary text-primary-foreground"
                                : "text-muted-foreground hover:bg-accent"
                            )}
                          >
                            <Icon className="h-4 w-4" />
                            {item.name}
                          </Link>
                        );
                      })}
                    </div>
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground mb-2">
                      Customer View
                    </p>
                    <div className="space-y-2">
                      {regularNavigation.map((item) => {
                        const Icon = item.icon;
                        return (
                          <Link
                            key={item.href}
                            href={item.href}
                            onClick={() => setMobileMenuOpen(false)}
                            className="flex items-center gap-3 rounded-lg pl-1 pr-3 py-2 text-sm font-medium transition-colors text-muted-foreground hover:bg-accent"
                          >
                            <Icon className="h-4 w-4" />
                            {item.name}
                          </Link>
                        );
                      })}
                    </div>
                  </div>
                </div>
                {session?.user && (
                  <div className="mt-4 space-y-3 border-t pt-4">
                    <div className="flex items-center gap-3">
                      <Avatar className="ring-2 ring-primary ring-offset-2 ring-offset-card">
                        <AvatarFallback className="bg-primary text-primary-foreground">
                          {session.user.email?.charAt(0).toUpperCase() || "A"}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-sm font-medium">{session.user.email}</p>
                        <p className="text-xs text-muted-foreground">Admin</p>
                      </div>
                    </div>
                    <SignOutButton />
                  </div>
                )}
              </motion.nav>
            )}
          </header>
          <main className="flex-1 px-4 py-4 pt-20 overflow-y-auto">{children}</main>
        </div>
      </div>
    </div>
  );
}
