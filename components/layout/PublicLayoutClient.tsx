"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { SignOutButton } from "@/components/auth/SignOutButton";
import { HeroBackgroundBlobs } from "@/components/ui/hero-background-blobs";
import { Footer } from "@/components/layout/Footer";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useCart } from "@/components/cart/CartProvider";
import { SocialLinks } from "@/lib/settings";
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
  Newspaper,
  ChevronDown,
  Info,
  MessageSquare,
  Users,
} from "lucide-react";
import { useState, useEffect, useRef } from "react";
import Image from "next/image";

// Primary navigation - core conversion paths
const primaryNavigation = [
  { name: "Home", href: "/", icon: Home },
  { name: "Courses", href: "/courses", icon: BookOpen },
  { name: "Learning Paths", href: "/learning-paths", icon: Route },
  { name: "Blog", href: "/blog", icon: Newspaper },
  { name: "Cart", href: "/cart", icon: ShoppingCart },
];

// Secondary navigation - resources dropdown
const resourcesNavigation = [
  { name: "About Us", href: "/about", icon: Info },
  { name: "Testimonials", href: "/testimonials", icon: Users },
  { name: "FAQ", href: "/faq", icon: HelpCircle },
  { name: "Contact Us", href: "/contact", icon: Mail },
];

// All navigation for mobile
const publicNavigation = [...primaryNavigation, ...resourcesNavigation];

export function PublicLayoutClient({
  children,
  socialLinks,
}: {
  children: React.ReactNode;
  socialLinks?: SocialLinks;
}) {
  const { data: session } = useSession();
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [resourcesOpen, setResourcesOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const menuRef = useRef<HTMLElement>(null);
  const { cart } = useCart();

  // Prevent hydration mismatch by mounting on client only
  useEffect(() => {
    setMounted(true);
  }, []);

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

  // Don't render until mounted to prevent hydration mismatch
  if (!mounted) {
    return (
      <div className="min-h-screen bg-background text-foreground relative overflow-x-hidden">
        <HeroBackgroundBlobs />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground relative overflow-x-hidden">
      {/* Hero Background Blobs - more vibrant for all pages */}
      <HeroBackgroundBlobs />
      <div className="hidden lg:flex flex-col min-h-screen" suppressHydrationWarning>
        {/* Desktop Top Navigation Bar - Floating Glass */}
        <motion.header
          initial={{ y: -100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="fixed top-4 left-0 right-0 z-50 px-4 pointer-events-none"
        >
          <div className="mx-auto w-full max-w-7xl pointer-events-auto">
            <div className="glass rounded-2xl h-16 px-6 flex items-center justify-between shadow-2xl shadow-primary/5">
              {/* Logo */}
              <Link href="/" className="flex items-center group transition-transform hover:scale-105">
                <div className="relative h-9 w-auto flex-shrink-0">
                  <Image
                    src="/logo.png"
                    alt="AI Genius Lab"
                    width={160}
                    height={36}
                    className="object-contain h-9 w-auto"
                    priority
                  />
                </div>
              </Link>

              {/* Desktop Navigation */}
              <nav className="flex items-center gap-1.5 h-full">
                {primaryNavigation.map((item) => {
                  const isActive = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href + "/"));
                  const Icon = item.icon;
                  const isCart = item.href === "/cart";
                  const cartCount = cart?.itemCount || 0;

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={cn(
                        "flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold transition-all whitespace-nowrap h-10 relative overflow-hidden group border-2 border-transparent",
                        isActive
                          ? "border-primary/50 text-primary shadow-sm bg-primary/5"
                          : "text-muted-foreground hover:bg-accent/50 hover:text-foreground"
                      )}
                    >
                      <Icon className={cn("h-4 w-4 transition-transform group-hover:scale-110", isActive ? "text-primary" : "text-primary")} />
                      <span className="leading-none">{item.name}</span>
                      {isCart && cartCount > 0 && (
                        <Badge
                          variant="destructive"
                          className="h-5 min-w-[20px] flex items-center justify-center rounded-full px-1.5 text-[10px] font-bold ring-2 ring-background shadow-lg"
                        >
                          {cartCount > 9 ? "9+" : cartCount}
                        </Badge>
                      )}
                    </Link>
                  );
                })}

                {/* Resources Dropdown */}
                <DropdownMenu open={resourcesOpen} onOpenChange={setResourcesOpen}>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      className={cn(
                        "flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold transition-all whitespace-nowrap h-10 group border-2 border-transparent",
                        resourcesNavigation.some(item => pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href + "/")))
                          ? "border-primary/50 text-primary shadow-sm bg-primary/5"
                          : "text-muted-foreground hover:bg-accent/50 hover:text-foreground"
                      )}
                    >
                      <Info className={cn("h-4 w-4 transition-transform group-hover:scale-110", resourcesNavigation.some(item => pathname === item.href) ? "text-primary" : "text-primary")} />
                      <span className="leading-none">Resources</span>
                      <ChevronDown className={cn(
                        "h-4 w-4 transition-transform duration-300 opacity-60",
                        resourcesOpen && "rotate-180 opacity-100"
                      )} />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56 p-2 rounded-2xl glass border-white/20">
                    {resourcesNavigation.map((item) => {
                      const Icon = item.icon;
                      const isActive = pathname === item.href;
                      return (
                        <DropdownMenuItem key={item.href} asChild>
                          <Link
                            href={item.href}
                            className={cn(
                              "flex items-center gap-3 cursor-pointer px-3 py-2.5 rounded-xl transition-colors",
                              isActive ? "bg-primary text-primary-foreground" : "hover:bg-accent"
                            )}
                          >
                            <Icon className={cn("h-4 w-4", isActive ? "text-white" : "text-primary")} />
                            <span className="font-medium">{item.name}</span>
                          </Link>
                        </DropdownMenuItem>
                      );
                    })}
                  </DropdownMenuContent>
                </DropdownMenu>
              </nav>

              {/* User Section */}
              <div className="flex items-center gap-4 h-full">
                <ThemeToggle />
                {session?.user ? (
                  <div className="flex items-center gap-3">
                    <Link href="/dashboard">
                      <Button variant="ghost" size="sm" className="gap-2.5 rounded-xl hover:bg-accent hover:shadow-[0_2px_8px_hsl(var(--accent)_/_0.15)] px-3 transition-all">
                        <Avatar className="h-7 w-7 ring-2 ring-primary/20 transition-transform group-hover:scale-105">
                          <AvatarImage src={session.user.image || undefined} alt={session.user.name || session.user.email || "User"} />
                          <AvatarFallback className="bg-premium-gradient text-white text-[10px] font-bold">
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
                        <span className="text-sm font-semibold leading-none">{session.user.name || "My Account"}</span>
                      </Button>
                    </Link>
                    <SignOutButton />
                  </div>
                ) : (
                  <div className="flex items-center gap-2.5">
                    <Link href="/sign-in">
                      <Button variant="outline" size="sm" className="h-10 px-6 border-2 font-bold transition-all bg-background hover:bg-primary hover:text-primary-foreground hover:border-primary hover:shadow-[0_4px_12px_hsl(var(--primary)_/_0.3)] active:scale-95">
                        Sign In
                      </Button>
                    </Link>
                    <Link href="/sign-up">
                      <Button
                        size="default"
                        variant="premium"
                        className="h-10 px-6 shadow-2xl shadow-primary/20 hover:brightness-110 hover:shadow-[0_8px_24px_hsl(var(--primary)_/_0.4)] transition-all duration-300"
                      >
                        Join Now
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
          <Footer socialLinks={socialLinks} />
        </div>
      </div>

      {/* Mobile Layout */}
      <div className="flex lg:hidden flex-col min-h-screen" suppressHydrationWarning>
        <header className="fixed top-0 left-0 right-0 z-50 border-b bg-background/80 backdrop-blur-md supports-[backdrop-filter]:bg-background/60 h-16">
          <div className="flex items-center justify-between px-4 h-full">
            <Link href="/" className="flex items-center">
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
                onClick={(e) => {
                  e.stopPropagation();
                  setMobileMenuOpen(!mobileMenuOpen);
                }}
                className="h-10 w-10"
                aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
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
                className="fixed left-0 top-0 bottom-0 z-50 w-72 max-w-[85vw] bg-card/95 backdrop-blur-md border-r shadow-2xl flex flex-col lg:hidden"
              >
                {/* Menu Header */}
                <div className="border-b p-4 flex items-center justify-between bg-card/95 backdrop-blur-md z-10 h-16 flex-shrink-0">
                  <Link href="/" onClick={() => setMobileMenuOpen(false)} className="flex items-center">
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
                <div className="px-3 py-4 space-y-1 flex-1 overflow-y-auto">
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
                    className="border-t px-4 py-4 space-y-3 flex-shrink-0 bg-background/95 backdrop-blur-md"
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
                    className="border-t px-4 py-5 flex-shrink-0 bg-background/95 backdrop-blur-md"
                  >
                    <div className="flex flex-col gap-3">
                      <div className="flex items-center justify-between px-3 py-2">
                        <span className="text-sm font-medium">Theme</span>
                        <ThemeToggle />
                      </div>
                      <Link href="/sign-in" onClick={() => setMobileMenuOpen(false)}>
                        <Button variant="outline" className="w-full justify-center gap-2 h-12 border-2 font-bold transition-all bg-background hover:bg-primary hover:text-primary-foreground hover:border-primary hover:shadow-[0_4px_12px_hsl(var(--primary)_/_0.3)] active:scale-95">
                          <LogIn className="h-4 w-4" />
                          Sign In
                        </Button>
                      </Link>
                      <Link href="/sign-up" onClick={() => setMobileMenuOpen(false)}>
                        <Button variant="premium" className="w-full justify-center gap-2 h-12 shadow-2xl shadow-primary/20 hover:brightness-110 hover:shadow-[0_8px_24px_hsl(var(--primary)_/_0.4)] transition-all duration-300">
                          <UserPlus className="h-4 w-4" />
                          Sign Up
                        </Button>
                      </Link>
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
        <Footer socialLinks={socialLinks} />
      </div>
    </div>
  );
}
