"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { motion } from "framer-motion";
import {
  LayoutDashboard,
  BookOpen,
  Activity,
  Menu,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { SignOutButton } from "@/components/auth/SignOutButton";
import { BackgroundBlobs } from "@/components/ui/background-blobs";
import { cn } from "@/lib/utils";
import { useState } from "react";

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "My Courses", href: "/library", icon: BookOpen },
  { name: "Activity", href: "/activity", icon: Activity },
];

export function AppLayoutClient({ children }: { children: React.ReactNode }) {
  const { data: session } = useSession();
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background text-foreground relative overflow-x-hidden">
      <BackgroundBlobs />
      <div className="mx-auto flex min-h-screen w-full max-w-7xl relative z-10 overflow-x-hidden">
        {/* Desktop Sidebar */}
        <motion.aside
          initial={{ x: -100, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.3 }}
          className="hidden w-64 flex-col gap-6 border-r bg-card/80 backdrop-blur-md px-6 pt-8 pb-8 md:flex"
        >
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Link href="/dashboard" className="font-display text-xl font-bold tracking-tight">
              SYNAPZE
            </Link>
          </motion.div>
          <nav className="grid gap-2">
            {navigation.map((item) => {
              const isActive = pathname === item.href;
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
                      "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
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
          <div className="mt-auto space-y-4 border-t pt-6">
            {session?.user && (
              <>
                <div className="flex items-center gap-3">
                  <Avatar>
                    <AvatarFallback className="bg-primary text-primary-foreground">
                      {session.user.email?.charAt(0).toUpperCase() || "U"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 overflow-hidden">
                    <p className="truncate text-sm font-medium">
                      {session.user.email}
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

        {/* Mobile Header */}
        <div className="flex flex-1 flex-col md:hidden">
          <header className="sticky top-0 z-50 border-b bg-background/80 backdrop-blur-md supports-[backdrop-filter]:bg-background/60">
            <div className="flex items-center justify-between px-4 pt-4 pb-3">
              <Link href="/dashboard" className="font-display text-lg font-bold">
                SYNAPZE
              </Link>
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
                <div className="space-y-2">
                  {navigation.map((item) => {
                    const isActive = pathname === item.href;
                    const Icon = item.icon;
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => setMobileMenuOpen(false)}
                        className={cn(
                          "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
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
                {session?.user && (
                  <div className="mt-4 space-y-3 border-t pt-4">
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarFallback className="bg-primary text-primary-foreground">
                          {session.user.email?.charAt(0).toUpperCase() || "U"}
                        </AvatarFallback>
                      </Avatar>
                      <p className="text-sm font-medium">{session.user.email}</p>
                    </div>
                    <SignOutButton />
                  </div>
                )}
              </motion.nav>
            )}
          </motion.header>
          <main className="flex-1 px-4 py-6">{children}</main>
        </div>

        {/* Desktop Main Content */}
        <main className="hidden flex-1 px-6 pt-8 pb-8 md:block">
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
