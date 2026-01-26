"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { SignOutButton } from "@/components/auth/SignOutButton";
import { BackgroundBlobs } from "@/components/ui/background-blobs";
import { Footer } from "@/components/layout/Footer";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useCart } from "@/components/cart/CartProvider";
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
} from "lucide-react";
import { useState, useEffect, useRef } from "react";

const publicNavigation = [
  { name: "Home", href: "/", icon: Home },
  { name: "Courses", href: "/courses", icon: BookOpen },
  { name: "Learning Paths", href: "/learning-paths", icon: Route },
  { name: "Cart", href: "/cart", icon: ShoppingCart },
  { name: "FAQ", href: "/faq", icon: HelpCircle },
  { name: "Contact Us", href: "/contact", icon: Mail },
];

export function PublicLayoutClient({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session } = useSession();
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const menuRef = useRef<HTMLElement>(null);
  const { cart } = useCart();

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
  
  // Hide dashboard button on sign-in/sign-up pages to avoid conflicts during redirect
  const isAuthPage = pathname === "/sign-in" || pathname === "/sign-up";

  return (
    <div className="min-h-screen bg-background text-foreground relative overflow-x-hidden">
      <BackgroundBlobs />
      
      {/* Desktop Layout - Top Navigation Bar */}
      <div className="hidden md:flex flex-col min-h-screen" suppressHydrationWarning>
        {/* Desktop Top Navigation Bar - Fixed */}
        <motion.header
          initial={{ y: -100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.3 }}
          className="fixed top-0 left-0 right-0 z-50 border-b bg-card/80 backdrop-blur-md h-16"
        >
          <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 h-full">
            <div className="flex items-center justify-between h-full">
              {/* Logo */}
              <Link href="/" className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center">
                  <GraduationCap className="h-5 w-5 text-primary-foreground" />
                </div>
                <span className="font-display text-lg font-bold tracking-tight">
                  AI GENIUS LAB
                </span>
              </Link>

              {/* Desktop Navigation */}
              <nav className="flex items-center gap-1">
                {publicNavigation.map((item) => {
                  const isActive = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href + "/"));
                  const Icon = item.icon;
                  const isCart = item.href === "/cart";
                  const cartCount = cart?.itemCount || 0;
                  
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={cn(
                        "flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-all",
                        isActive
                          ? "bg-primary text-primary-foreground"
                          : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                      )}
                    >
                      <Icon className="h-4 w-4" />
                      <span>{item.name}</span>
                      {isCart && cartCount > 0 && (
                        <Badge 
                          variant="destructive" 
                          className="h-5 min-w-[20px] flex items-center justify-center rounded-full px-1.5 text-[10px] font-bold"
                        >
                          {cartCount > 9 ? "9+" : cartCount}
                        </Badge>
                      )}
                    </Link>
                  );
                })}
              </nav>

              {/* User Section */}
              <div className="flex items-center gap-3">
                <ThemeToggle />
                {session?.user ? (
                  <div className="flex items-center gap-2">
                    <Link href="/dashboard">
                      <Button variant="ghost" size="sm" className="gap-2">
                        <Avatar className="h-6 w-6">
                          <AvatarImage src={session.user.image || undefined} alt={session.user.name || session.user.email || "User"} />
                          <AvatarFallback className="bg-primary text-primary-foreground text-xs">
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
                        <span className="text-sm">{session.user.name || session.user.email}</span>
                      </Button>
                    </Link>
                    <SignOutButton />
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <Link href="/sign-in">
                      <Button variant="ghost" size="sm">
                        Sign In
                      </Button>
                    </Link>
                    <Link href="/sign-up">
                      <Button size="sm">
                        Sign Up
                      </Button>
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>
        </motion.header>

        {/* Desktop Main Content Area */}
        <div className="flex-1 flex flex-col pt-16">
          {/* Scrollable Main Content */}
          <main className="flex-1">
            <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 py-6 pb-12">
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
      <div className="flex md:hidden flex-col min-h-screen" suppressHydrationWarning>
        <header className="fixed top-0 left-0 right-0 z-50 border-b bg-background/80 backdrop-blur-md supports-[backdrop-filter]:bg-background/60 h-16">
          <div className="flex items-center justify-between px-4 h-full">
            <Link href="/" className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center">
                <GraduationCap className="h-5 w-5 text-primary-foreground" />
              </div>
              <span className="font-display text-lg font-bold tracking-tight">
                AI GENIUS LAB
              </span>
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
                className="fixed left-0 top-0 bottom-0 z-50 w-72 max-w-[85vw] bg-card/95 backdrop-blur-md border-r shadow-2xl overflow-y-auto md:hidden"
              >
                {/* Menu Header */}
                <div className="border-b p-4 flex items-center justify-between sticky top-0 bg-card/95 backdrop-blur-md z-10 h-16">
                  <Link href="/" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-2">
                    <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center">
                      <GraduationCap className="h-5 w-5 text-primary-foreground" />
                    </div>
                    <span className="font-display text-lg font-bold">
                      AI GENIUS LAB
                    </span>
                  </Link>
                </div>

                {/* Navigation Items */}
                <div className="px-3 py-4 pb-32 space-y-1">
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

                {/* User Section */}
                {session?.user ? (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="border-t px-4 py-4 space-y-3 sticky bottom-0 bg-background/95 backdrop-blur-md"
                  >
                    <Link href="/dashboard" onClick={() => setMobileMenuOpen(false)}>
                      <div className="flex items-center gap-3 p-3 rounded-lg hover:bg-accent transition-colors active:scale-[0.98]">
                        <Avatar className="h-10 w-10 ring-2 ring-primary/20">
                          <AvatarImage src={session.user.image || undefined} alt={session.user.name || session.user.email || "User"} />
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
                ) : (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="border-t px-4 py-4 space-y-4 sticky bottom-0 bg-background/95 backdrop-blur-md"
                  >
                    <Link href="/sign-in" onClick={() => setMobileMenuOpen(false)}>
                      <Button variant="outline" className="w-full justify-start gap-2">
                        <LogIn className="h-4 w-4" />
                        Sign In
                      </Button>
                    </Link>
                    <Link href="/sign-up" onClick={() => setMobileMenuOpen(false)}>
                      <Button className="w-full justify-start gap-2">
                        <UserPlus className="h-4 w-4" />
                        Sign Up
                      </Button>
                    </Link>
                  </motion.div>
                )}
              </motion.nav>
            </>
          )}
        </AnimatePresence>
        
        {/* Main Content */}
        <main className="flex-1 px-3 sm:px-4 py-4 pt-20 pb-12 overflow-y-auto">
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
  );
}
