"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BookOpen,
  Grid3X3,
  GraduationCap,
  HelpCircle,
  LogIn,
  Menu,
  Newspaper,
  ShoppingCart,
  UserPlus,
  X,
} from "lucide-react";

import { useCart } from "@/components/cart/CartProvider";
import { Footer } from "@/components/layout/Footer";
import { AppShell } from "@/components/layout/shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import type { SocialLink } from "@/lib/settings";
import { cn } from "@/lib/utils";

const mainNav = [
  { name: "Courses", href: "/courses", icon: BookOpen },
  { name: "Learning Paths", href: "/learning-paths", icon: GraduationCap },
  { name: "Pricing", href: "/pricing", icon: Grid3X3 },
  { name: "Blog", href: "/blog", icon: Newspaper },
  { name: "FAQ", href: "/faq", icon: HelpCircle },
];

function isActivePath(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function PublicLayoutClient({
  children,
  socialLinks,
}: {
  children: React.ReactNode;
  socialLinks?: SocialLink[];
}) {
  const pathname = usePathname() ?? "/";
  const [mobileOpen, setMobileOpen] = useState(false);
  const { cart } = useCart();

  const cartCount = cart?.itemCount ?? 0;

  const mobileNav = useMemo(
    () => [...mainNav, { name: "Cart", href: "/cart", icon: ShoppingCart }],
    []
  );

  return (
    <AppShell area="public">
      <header className="sticky top-0 z-40 border-b border-border/80 bg-background/90 backdrop-blur">
        <div className="mx-auto flex h-14 w-full max-w-7xl items-center justify-between px-4 sm:px-6">
          <Link href="/" className="inline-flex items-center" aria-label="AI Genius Lab home">
            <Image
              src="/logo.png"
              alt="AI Genius Lab"
              width={152}
              height={32}
              className="h-8 w-auto object-contain"
              priority
            />
          </Link>

          <nav className="hidden items-center gap-1 md:flex">
            {mainNav.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "inline-flex h-10 items-center gap-2 rounded-[var(--radius-sm)] px-3 text-sm font-medium transition-colors",
                    isActivePath(pathname, item.href)
                      ? "bg-accent text-foreground"
                      : "text-muted-foreground hover:bg-accent hover:text-foreground"
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {item.name}
                </Link>
              );
            })}
          </nav>

          <div className="flex items-center gap-1">
            <ThemeToggle />
            <Link href="/cart" className="relative inline-flex">
              <Button variant="ghost" size="icon" className="h-11 w-11 rounded-full" aria-label="Shopping cart">
                <ShoppingCart className="h-4 w-4" />
              </Button>
              {cartCount > 0 ? (
                <Badge className="absolute -right-1 -top-1 h-4 min-w-4 px-1 text-[10px]">
                  {cartCount > 9 ? "9+" : cartCount}
                </Badge>
              ) : null}
            </Link>

            <div className="hidden items-center gap-2 sm:flex">
              <Link href="/sign-in">
                <Button variant="ghost" size="sm" className="h-11 rounded-full">
                  Sign In
                </Button>
              </Link>
              <Link href="/sign-up">
                <Button variant="premium" size="sm" className="h-11 rounded-full px-4">
                  Create Account
                </Button>
              </Link>
            </div>

            <Button
              variant="ghost"
              size="icon"
              className="h-11 w-11 rounded-full md:hidden"
              onClick={() => setMobileOpen((open) => !open)}
              aria-label="Toggle menu"
            >
              {mobileOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
            </Button>
          </div>
        </div>
      </header>

      {mobileOpen ? (
        <div className="border-b border-border/80 bg-background px-4 pb-4 pt-2 md:hidden">
          <nav className="grid gap-1">
            {mobileNav.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className={cn(
                    "inline-flex items-center gap-2 rounded-[var(--radius-sm)] px-3 py-2 text-sm font-medium",
                    isActivePath(pathname, item.href)
                      ? "bg-accent text-foreground"
                      : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {item.name}
                </Link>
              );
            })}
            <div className="mt-2 grid gap-2 border-t pt-3">
              <Link href="/sign-in">
                <Button
                  variant="outline"
                  className="w-full justify-center gap-2"
                  onClick={() => setMobileOpen(false)}
                >
                  <LogIn className="h-4 w-4" />
                  Sign In
                </Button>
              </Link>
              <Link href="/sign-up">
                <Button
                  variant="premium"
                  className="w-full justify-center gap-2"
                  onClick={() => setMobileOpen(false)}
                >
                  <UserPlus className="h-4 w-4" />
                  Sign Up
                </Button>
              </Link>
            </div>
          </nav>
        </div>
      ) : null}

      <main>
        <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6">{children}</div>
      </main>

      <Footer socialLinks={socialLinks} />
    </AppShell>
  );
}
