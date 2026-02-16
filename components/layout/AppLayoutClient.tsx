"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { AnimatePresence, motion } from "framer-motion";
import {
  Activity,
  BookOpen,
  ChevronLeft,
  ChevronRight,
  CreditCard,
  GraduationCap,
  LayoutDashboard,
  Menu,
  Newspaper,
  ShoppingCart,
  User,
  X,
} from "lucide-react";

import { PreviewBanner } from "@/components/admin/PreviewBanner";
import { SignOutButton } from "@/components/auth/SignOutButton";
import { useCart } from "@/components/cart/CartProvider";
import { Footer } from "@/components/layout/Footer";
import { AppShell } from "@/components/layout/shell";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { CourseProgressProvider } from "@/contexts/CourseProgressContext";
import { SidebarProvider, useSidebar } from "@/components/layout/useSidebar";
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

function AppLayoutContent({ children, planName = "Member" }: AppLayoutClientProps) {
  const pathname = usePathname() ?? "/";
  const searchParams = useSearchParams();
  const { data: session } = useSession();
  const { cart } = useCart();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { isCollapsed, toggleCollapsed } = useSidebar();

  const isAdmin = session?.user?.role === "admin";
  const isPreviewMode = searchParams?.get("preview") === "true";
  const preservePreview = isAdmin && isPreviewMode;

  const cartCount = cart?.itemCount ?? 0;

  const getHref = (baseHref: string) => {
    if (!preservePreview) {
      return baseHref;
    }

    return `${baseHref}?preview=true`;
  };

  const currentSection = useMemo(() => {
    const match = appNavigation.find((item) => isActivePath(pathname, item.href));
    return match?.name ?? "Workspace";
  }, [pathname]);

  return (
    <CourseProgressProvider>
      <AppShell area="app">
        <div className="hidden md:block">
          <aside
            className={cn(
              "fixed inset-y-0 left-0 z-30 flex flex-col overflow-hidden border-r bg-card/85 py-4 backdrop-blur transition-all duration-300",
              isCollapsed ? "w-16 px-2" : "w-72 px-3"
            )}
          >
            <div
              className={cn(
                "px-2",
                isCollapsed ? "flex flex-col items-center gap-2 py-1" : "flex h-12 items-center justify-between"
              )}
            >
              <Link
                href={getHref("/dashboard")}
                aria-label="Dashboard"
                className={cn("flex min-w-0 items-center", isCollapsed ? "justify-center" : "gap-2")}
              >
                <Image
                  src="/logo.png"
                  alt="AI Genius Lab"
                  width={164}
                  height={36}
                  className={cn(
                    "h-8 object-contain transition-all duration-300",
                    isCollapsed ? "w-8" : "w-auto"
                  )}
                  priority
                />
              </Link>

              <button
                onClick={toggleCollapsed}
                className="rounded-md p-1 text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
                aria-label="Toggle sidebar"
              >
                {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
              </button>
            </div>

            <nav className="mt-5 flex-1 space-y-1 overflow-y-auto pr-1">
              {appNavigation.map((item) => {
                const Icon = item.icon;
                const active = isActivePath(pathname, item.href);

                return (
                  <Link
                    key={item.href}
                    href={getHref(item.href)}
                    title={isCollapsed ? item.name : undefined}
                    className={cn(
                      "group flex items-center rounded-[var(--radius-sm)] py-2.5 text-sm font-medium transition-colors",
                      isCollapsed ? "justify-center px-2" : "gap-3 px-3",
                      active
                        ? "bg-primary text-primary-foreground shadow-sm"
                        : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                    )}
                  >
                    <Icon className="h-4 w-4" />
                    <span className={cn("ml-2 truncate", isCollapsed && "sr-only")}>{item.name}</span>
                    {!isCollapsed && item.href === "/cart" && cartCount > 0 ? (
                      <Badge className="ml-auto h-5 min-w-5 justify-center px-1 text-[10px]">
                        {cartCount > 9 ? "9+" : cartCount}
                      </Badge>
                    ) : null}
                  </Link>
                );
              })}
            </nav>

            <div className="mt-4 space-y-3 border-t pt-4">
              <Link
                href={getHref("/profile")}
                title={isCollapsed ? "Profile" : undefined}
                className={cn(
                  "ui-surface flex rounded-[var(--radius-md)] border",
                  isCollapsed ? "justify-center p-2" : "items-center gap-3 p-3"
                )}
              >
                <Avatar className="h-9 w-9">
                  <AvatarImage
                    src={session?.user?.image || undefined}
                    alt={session?.user?.name || session?.user?.email || "User"}
                  />
                  <AvatarFallback>
                    {(session?.user?.name?.[0] || session?.user?.email?.[0] || "U").toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className={cn("min-w-0", isCollapsed && "sr-only")}>
                  <p className="truncate text-sm font-semibold">{session?.user?.name || "User"}</p>
                  <p className="truncate text-xs text-muted-foreground">{planName}</p>
                </div>
              </Link>

              <div className={cn("flex items-center", isCollapsed ? "justify-center" : "justify-between")}>
                <ThemeToggle />
                {!isCollapsed ? <SignOutButton className="h-10 w-auto px-3" /> : null}
              </div>
            </div>
          </aside>

          <div className={cn("min-w-0 transition-all duration-300", isCollapsed ? "pl-16" : "pl-72")}>
            <header className="sticky top-0 z-20 border-b border-border/80 bg-background/90 backdrop-blur">
              <div className="mx-auto flex h-14 w-full max-w-[96rem] items-center justify-between px-5 lg:px-8">
                <p className="font-display text-base font-semibold tracking-tight">{currentSection}</p>
                <div className="flex items-center gap-2">
                  <Link href={getHref("/cart")} className="relative inline-flex">
                    <Button variant="ghost" size="icon" className="h-11 w-11 rounded-full" aria-label="Cart">
                      <ShoppingCart className="h-4 w-4" />
                    </Button>
                    {cartCount > 0 ? (
                      <Badge className="absolute -right-1 -top-1 h-4 min-w-4 px-1 text-[10px]">
                        {cartCount > 9 ? "9+" : cartCount}
                      </Badge>
                    ) : null}
                  </Link>
                  <ThemeToggle />
                </div>
              </div>
            </header>

            {isPreviewMode ? <PreviewBanner /> : null}

            <main>
              <div className="mx-auto w-full max-w-[96rem] px-5 py-6 lg:px-8">{children}</div>
            </main>

            <Footer />
          </div>
        </div>

        <div className="md:hidden">
          <header className="sticky top-0 z-40 border-b border-border/80 bg-background/95 backdrop-blur">
            <div className="mx-auto flex h-14 w-full max-w-[96rem] items-center justify-between px-3 sm:px-5">
              <Link href={getHref("/dashboard")} className="inline-flex items-center">
                <Image
                  src="/logo.png"
                  alt="AI Genius Lab"
                  width={132}
                  height={28}
                  className="h-7 w-auto object-contain"
                  priority
                />
              </Link>
              <div className="flex items-center gap-1">
                <ThemeToggle />
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-11 w-11 rounded-full"
                  onClick={() => setMobileMenuOpen((open) => !open)}
                  aria-label="Toggle app menu"
                >
                  {mobileMenuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
                </Button>
              </div>
            </div>
          </header>

          <AnimatePresence>
            {mobileMenuOpen ? (
              <>
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  onClick={() => setMobileMenuOpen(false)}
                  className="fixed inset-0 z-40 bg-black/50 md:hidden"
                />
                <motion.aside
                  initial={{ x: "-100%" }}
                  animate={{ x: 0 }}
                  exit={{ x: "-100%" }}
                  transition={{ type: "tween", duration: 0.3 }}
                  className="fixed inset-y-0 left-0 z-50 w-[min(88vw,20rem)] bg-card/95 backdrop-blur-lg shadow-lg overflow-y-auto md:hidden"
                >
                  <div className="flex items-center justify-between p-4 border-b">
                    <Link
                      href={getHref("/dashboard")}
                      onClick={() => setMobileMenuOpen(false)}
                      className="inline-flex items-center"
                    >
                      <Image
                        src="/logo.png"
                        alt="AI Genius Lab"
                        width={132}
                        height={28}
                        className="h-7 w-auto object-contain"
                        priority
                      />
                    </Link>
                    <button
                      onClick={() => setMobileMenuOpen(false)}
                      aria-label="Close menu"
                      className="rounded-md p-2 text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                  <nav className="mt-2 space-y-1 px-4 pb-6">
                    {appNavigation.map((item) => {
                      const Icon = item.icon;
                      const active = isActivePath(pathname, item.href);
                      return (
                        <Link
                          key={item.href}
                          href={getHref(item.href)}
                          onClick={() => setMobileMenuOpen(false)}
                          className={cn(
                            "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium",
                            active
                              ? "bg-primary text-primary-foreground"
                              : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                          )}
                        >
                          <Icon className="h-4 w-4" />
                          <span>{item.name}</span>
                        </Link>
                      );
                    })}
                    <div className="mt-4 border-t pt-4">
                      <SignOutButton className="w-full justify-center h-11" />
                    </div>
                  </nav>
                </motion.aside>
              </>
            ) : null}
          </AnimatePresence>

          {isPreviewMode ? <PreviewBanner /> : null}

          <main>
            <div className="mx-auto w-full max-w-[96rem] px-3 py-5 pb-24 sm:px-5">{children}</div>
          </main>

          <nav className="fixed inset-x-0 bottom-0 z-30 border-t border-border/80 bg-background/95 px-2 pb-[calc(env(safe-area-inset-bottom)+0.35rem)] pt-1.5 backdrop-blur">
            <div className="mx-auto grid w-full max-w-md grid-cols-5 gap-1">
              {mobileBottomNavigation.map((item) => {
                const Icon = item.icon;
                const active = isActivePath(pathname, item.href);

                return (
                  <Link
                    key={item.href}
                    href={getHref(item.href)}
                    className={cn(
                      "relative inline-flex min-h-11 flex-col items-center justify-center rounded-[var(--radius-sm)] px-1 text-[11px] font-medium",
                      active
                        ? "bg-accent text-foreground"
                        : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                    )}
                  >
                    <Icon className="h-4 w-4" />
                    <span className="mt-0.5">{item.name}</span>
                    {item.href === "/cart" && cartCount > 0 ? (
                      <Badge className="absolute right-2 top-1 h-4 min-w-4 px-1 text-[10px]">
                        {cartCount > 9 ? "9+" : cartCount}
                      </Badge>
                    ) : null}
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

export function AppLayoutClient(props: AppLayoutClientProps) {
  return (
    <SidebarProvider>
      <AppLayoutContent {...props} />
    </SidebarProvider>
  );
}
