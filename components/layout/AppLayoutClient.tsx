"use client";

import { useMemo, useState } from "react";
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
  const { data: session } = useSession();
  const { cart } = useCart();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isAdmin = session?.user?.role === "admin";
  const isPreviewMode = searchParams.get("preview") === "true";
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
          <aside className="fixed inset-y-0 left-0 z-30 flex w-72 flex-col border-r bg-card/85 px-4 py-4 backdrop-blur">
            <Link href={getHref("/dashboard")} className="flex h-12 items-center px-2" aria-label="Dashboard">
              <Image
                src="/logo.png"
                alt="AI Genius Lab"
                width={164}
                height={36}
                className="h-8 w-auto object-contain"
                priority
              />
            </Link>

            <nav className="mt-5 flex-1 space-y-1 overflow-y-auto pr-1">
              {appNavigation.map((item) => {
                const Icon = item.icon;
                const active = isActivePath(pathname, item.href);

                return (
                  <Link
                    key={item.href}
                    href={getHref(item.href)}
                    className={cn(
                      "group flex items-center gap-3 rounded-[var(--radius-sm)] px-3 py-2.5 text-sm font-medium",
                      active
                        ? "bg-primary text-primary-foreground shadow-sm"
                        : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                    )}
                  >
                    <Icon className="h-4 w-4" />
                    {item.name}
                    {item.href === "/cart" && cartCount > 0 ? (
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
                className="ui-surface glass flex items-center gap-3 rounded-[var(--radius-md)] border p-3"
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
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold">{session?.user?.name || "User"}</p>
                  <p className="truncate text-xs text-muted-foreground">{planName}</p>
                </div>
              </Link>

              <div className="flex items-center justify-between">
                <ThemeToggle />
                <SignOutButton className="h-10 w-auto px-3" />
              </div>
            </div>
          </aside>

          <div className="pl-72">
            <header className="sticky top-0 z-20 border-b border-border/80 bg-background/90 backdrop-blur">
              <div className="mx-auto flex h-14 w-full max-w-7xl items-center justify-between px-6">
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
              <div className="mx-auto w-full max-w-7xl px-6 py-6">{children}</div>
            </main>

            <Footer />
          </div>
        </div>

        <div className="md:hidden">
          <header className="sticky top-0 z-40 border-b border-border/80 bg-background/95 backdrop-blur">
            <div className="mx-auto flex h-14 w-full max-w-7xl items-center justify-between px-4">
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

          {mobileMenuOpen ? (
            <div className="border-b border-border/80 bg-background px-4 pb-4 pt-2">
              <nav className="grid gap-1">
                {appNavigation.map((item) => {
                  const Icon = item.icon;
                  const active = isActivePath(pathname, item.href);

                  return (
                    <Link
                      key={item.href}
                      href={getHref(item.href)}
                      onClick={() => setMobileMenuOpen(false)}
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
                  <SignOutButton className="h-11 w-full justify-center" />
                </div>
              </nav>
            </div>
          ) : null}

          {isPreviewMode ? <PreviewBanner /> : null}

          <main>
            <div className="mx-auto w-full max-w-7xl px-4 py-5 pb-24">{children}</div>
          </main>

          <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-border/80 bg-background/95 px-2 pb-[calc(env(safe-area-inset-bottom)+0.35rem)] pt-1.5 backdrop-blur">
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
