"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import {
  BookOpen,
  GraduationCap,
  Grid3X3,
  HelpCircle,
  LogIn,
  Menu,
  Newspaper,
  ShoppingCart,
  UserPlus,
  X,
} from "lucide-react";

import { SignOutButton } from "@/components/auth/SignOutButton";
import { useCart } from "@/components/cart/CartProvider";
import { Footer } from "@/components/layout/Footer";
import { AppShell } from "@/components/layout/shell";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { cn } from "@/lib/utils";
import type { SocialLink } from "@/lib/settings";

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
  const pathname = usePathname();
  const { data: session } = useSession();
  const { cart } = useCart();
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const cartCount = cart?.itemCount ?? 0;

  const mobileNav = useMemo(
    () => [
      ...mainNav,
      { name: "Cart", href: "/cart", icon: ShoppingCart },
      ...(session?.user ? [{ name: "Dashboard", href: "/dashboard", icon: GraduationCap }] : []),
    ],
    [session?.user]
  );

  return (
    <AppShell area="public" className="flex flex-col">
      <header className="sticky top-0 z-40 border-b border-border/80 bg-background/95 backdrop-blur">
        <div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between gap-3 px-4 sm:px-6">
          <Link href="/" className="inline-flex items-center" aria-label="AI Genius Lab home">
            <Image src="/logo.png" alt="AI Genius Lab" width={156} height={34} className="h-8 w-auto object-contain" priority />
          </Link>

          <nav className="hidden items-center gap-1 md:flex">
            {mainNav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "rounded-full px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-accent hover:text-accent-foreground",
                  isActivePath(pathname, item.href) && "bg-accent text-foreground"
                )}
              >
                {item.name}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-1.5">
            <ThemeToggle />

            <Link href="/cart" className="relative inline-flex">
              <Button variant="ghost" size="icon" aria-label="Shopping cart" className="h-11 w-11 rounded-full">
                <ShoppingCart className="h-4 w-4" />
              </Button>
              {cartCount > 0 ? (
                <Badge className="absolute -right-1 -top-1 h-4 min-w-4 px-1 text-[10px]">{cartCount > 9 ? "9+" : cartCount}</Badge>
              ) : null}
            </Link>

            {session?.user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="h-11 rounded-full px-1.5">
                    <Avatar className="h-7 w-7">
                      <AvatarImage src={session.user.image || undefined} alt={session.user.name || session.user.email || "User"} />
                      <AvatarFallback className="text-xs font-semibold">
                        {(session.user.name?.[0] || session.user.email?.[0] || "U").toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuItem asChild>
                    <Link href="/dashboard">Dashboard</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/profile">Profile</Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <div className="px-1 pb-1">
                    <SignOutButton className="h-11 w-full justify-start" />
                  </div>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
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
            )}

            <Button
              variant="ghost"
              size="icon"
              className="h-11 w-11 rounded-full md:hidden"
              onClick={() => setIsMobileOpen((open) => !open)}
              aria-label="Toggle menu"
            >
              {isMobileOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
            </Button>
          </div>
        </div>
      </header>

      {isMobileOpen ? (
        <div className="border-b border-border/80 bg-background px-4 pb-4 pt-2 md:hidden">
          <nav className="grid gap-1">
            {mobileNav.map((item) => {
              const Icon = item.icon;
              return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsMobileOpen(false)}
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
            {!session?.user ? (
              <div className="mt-3 grid gap-2 sm:grid-cols-2">
                <Link href="/sign-in">
                  <Button variant="outline" className="w-full justify-center gap-2" onClick={() => setIsMobileOpen(false)}>
                    <LogIn className="h-4 w-4" />
                    Sign In
                  </Button>
                </Link>
                <Link href="/sign-up">
                  <Button variant="premium" className="w-full justify-center gap-2" onClick={() => setIsMobileOpen(false)}>
                    <UserPlus className="h-4 w-4" />
                    Sign Up
                  </Button>
                </Link>
              </div>
            ) : null}
          </nav>
        </div>
      ) : null}

      <main className="flex-1">
        <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:py-8">{children}</div>
      </main>

      <Footer socialLinks={socialLinks} />
    </AppShell>
  );
}
