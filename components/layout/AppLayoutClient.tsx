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
  GraduationCap,
  User,
  Route,
  ShoppingCart,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { SignOutButton } from "@/components/auth/SignOutButton";
import { BackgroundBlobs } from "@/components/ui/background-blobs";
import { useCart } from "@/components/cart/CartProvider";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { PreviewBanner } from "@/components/admin/PreviewBanner";

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "My Courses", href: "/library", icon: BookOpen },
  { name: "Browse Courses", href: "/courses", icon: GraduationCap },
  { name: "Learning Paths", href: "/learning-paths", icon: Route },
  { name: "Cart", href: "/cart", icon: ShoppingCart },
  { name: "Activity", href: "/activity", icon: Activity },
  { name: "Profile", href: "/profile", icon: User },
];

export function AppLayoutClient({ children }: { children: React.ReactNode }) {
  const { data: session } = useSession();
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { cart } = useCart();

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
            >
              <Link href="/dashboard" className="font-display text-xl font-bold tracking-tight">
                AI GENIUS LAB
              </Link>
            </motion.div>
          </div>
          
          {/* Scrollable Navigation */}
          <div className="flex-1 overflow-y-auto px-3 py-4">
            <nav className="grid gap-2">
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
                      {isCart && cartCount > 0 && (
                        <Badge 
                          variant="destructive" 
                          className="ml-auto h-5 min-w-5 flex items-center justify-center rounded-full px-1.5 text-xs font-bold"
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
          <div className="flex-shrink-0 border-t p-4 space-y-4">
            {session?.user && (
              <>
                <Link href="/profile">
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    className="flex items-center gap-3 p-2 rounded-lg hover:bg-accent transition-colors cursor-pointer"
                  >
                    <Avatar className="h-10 w-10 ring-2 ring-primary ring-offset-2 ring-offset-card">
                      <AvatarImage src={session.user.image || undefined} alt={session.user.name || session.user.email || "User"} />
                      <AvatarFallback className="bg-primary text-primary-foreground text-sm font-semibold">
                        {(() => {
                          const name = session.user.name;
                          const email = session.user.email || "";
                          if (name && name.trim()) {
                            const nameParts = name.trim().split(/\s+/);
                            // Use first letter of first name
                            return nameParts[0][0].toUpperCase();
                          }
                          // Fallback to email first letter if no name
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
                  </motion.div>
                </Link>
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
          {/* Preview Banner for Admin */}
          <PreviewBanner />
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
              <Link href="/dashboard" className="font-display text-lg font-bold">
                AI GENIUS LAB
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
                    const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
                    const Icon = item.icon;
                    const isCart = item.href === "/cart";
                    const cartCount = cart?.itemCount || 0;
                    
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => setMobileMenuOpen(false)}
                        className={cn(
                          "flex items-center gap-3 rounded-lg pl-1 pr-3 py-2 text-sm font-medium transition-colors",
                          isActive
                            ? "bg-primary text-primary-foreground"
                            : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                        )}
                      >
                        <Icon className="h-4 w-4" />
                        {item.name}
                        {isCart && cartCount > 0 && (
                          <Badge 
                            variant="destructive" 
                            className="ml-auto h-5 min-w-5 flex items-center justify-center rounded-full px-1.5 text-xs font-bold"
                          >
                            {cartCount > 9 ? "9+" : cartCount}
                          </Badge>
                        )}
                      </Link>
                    );
                  })}
                </div>
                {session?.user && (
                  <div className="mt-4 space-y-3 border-t pt-4">
                    <Link href="/profile">
                      <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-accent transition-colors">
                        <Avatar className="h-10 w-10 ring-2 ring-primary ring-offset-2 ring-offset-card">
                          <AvatarImage src={session.user.image || undefined} alt={session.user.name || session.user.email || "User"} />
                          <AvatarFallback className="bg-primary text-primary-foreground text-sm font-semibold">
                            {(() => {
                              const name = session.user.name;
                              const email = session.user.email || "";
                              if (name && name.trim()) {
                                const nameParts = name.trim().split(/\s+/);
                                // Use first letter of first name
                                return nameParts[0][0].toUpperCase();
                              }
                              // Fallback to email first letter if no name
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
                    <div className="flex items-center gap-2">
                      <ThemeToggle />
                      <SignOutButton />
                    </div>
                  </div>
                )}
              </motion.nav>
            )}
          </header>
          {/* Preview Banner for Admin (Mobile) */}
          <div className="pt-16">
            <PreviewBanner />
          </div>
          <main className="flex-1 px-4 py-4 overflow-y-auto">{children}</main>
        </div>
      </div>
    </div>
  );
}
