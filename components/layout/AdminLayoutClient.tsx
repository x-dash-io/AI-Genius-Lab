"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { Eye, Menu, ShieldCheck, X } from "lucide-react";

import { SignOutButton } from "@/components/auth/SignOutButton";
import { Footer } from "@/components/layout/Footer";
import { adminNavigation, customerPreviewLinks } from "@/components/layout/admin/AdminConfig";
import { AppShell } from "@/components/layout/shell";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { cn } from "@/lib/utils";

function isActivePath(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function AdminLayoutClient({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { data: session } = useSession();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <AppShell area="admin">
      <div className="hidden md:block">
        <aside className="fixed inset-y-0 left-0 z-30 flex w-72 flex-col border-r bg-card/85 px-4 py-4 backdrop-blur">
          <Link href="/admin" className="flex h-12 items-center gap-2 px-2" aria-label="Admin home">
            <Image src="/logo.png" alt="AI Genius Lab" width={156} height={34} className="h-8 w-auto object-contain" priority />
            <span className="inline-flex items-center gap-1 rounded-full border bg-primary/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-primary">
              <ShieldCheck className="h-3 w-3" />
              Admin
            </span>
          </Link>

          <nav className="mt-5 flex-1 space-y-1 overflow-y-auto pr-1">
            {adminNavigation.map((item) => {
              const Icon = item.icon;
              const active = isActivePath(pathname, item.href);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "group flex items-center gap-3 rounded-[var(--radius-sm)] px-3 py-2.5 text-sm font-medium",
                    active
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {item.name}
                </Link>
              );
            })}
          </nav>

          <div className="mt-3 space-y-2 border-t pt-4">
            <p className="px-1 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Customer preview</p>
            <div className="space-y-1">
              {customerPreviewLinks.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={`${item.href}?preview=true`}
                    target="_blank"
                    className="inline-flex w-full items-center gap-2 rounded-[var(--radius-sm)] px-3 py-2 text-sm text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                  >
                    <Icon className="h-4 w-4" />
                    {item.name}
                    <Eye className="ml-auto h-3.5 w-3.5" />
                  </Link>
                );
              })}
            </div>
          </div>

          <div className="mt-4 space-y-3 border-t pt-4">
            <Link href="/admin/profile" className="ui-surface glass flex items-center gap-3 rounded-[var(--radius-md)] border p-3">
              <Avatar className="h-9 w-9">
                <AvatarImage src={session?.user?.image || undefined} alt={session?.user?.name || session?.user?.email || "Admin"} />
                <AvatarFallback>{(session?.user?.name?.[0] || session?.user?.email?.[0] || "A").toUpperCase()}</AvatarFallback>
              </Avatar>
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold">{session?.user?.name || "Admin"}</p>
                <p className="truncate text-xs text-muted-foreground">Administrator</p>
              </div>
            </Link>

            <div className="flex items-center justify-between">
              <ThemeToggle />
              <SignOutButton className="h-9 w-auto px-3" />
            </div>
          </div>
        </aside>

        <div className="pl-72">
          <header className="sticky top-0 z-20 border-b border-border/80 bg-background/90 backdrop-blur">
            <div className="mx-auto flex h-14 w-full max-w-7xl items-center px-6">
              <p className="font-display text-base font-semibold tracking-tight">Admin Workspace</p>
            </div>
          </header>

          <main>
            <div className="mx-auto w-full max-w-7xl px-6 py-6">{children}</div>
          </main>

          <Footer />
        </div>
      </div>

      <div className="md:hidden">
        <header className="sticky top-0 z-40 border-b border-border/80 bg-background/95 backdrop-blur">
          <div className="mx-auto flex h-14 w-full max-w-7xl items-center justify-between px-4">
            <Link href="/admin" className="inline-flex items-center gap-2">
              <Image src="/logo.png" alt="AI Genius Lab" width={128} height={28} className="h-7 w-auto object-contain" priority />
            </Link>
            <div className="flex items-center gap-1">
              <ThemeToggle />
              <Button
                variant="ghost"
                size="icon"
                className="h-9 w-9 rounded-full"
                onClick={() => setMobileOpen((open) => !open)}
                aria-label="Toggle admin menu"
              >
                {mobileOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
              </Button>
            </div>
          </div>
        </header>

        {mobileOpen ? (
          <div className="border-b border-border/80 bg-background px-4 pb-4 pt-2">
            <nav className="grid gap-1">
              {adminNavigation.map((item) => {
                const Icon = item.icon;
                const active = isActivePath(pathname, item.href);

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileOpen(false)}
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
                <p className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Customer preview</p>
                <div className="grid gap-1">
                  {customerPreviewLinks.map((item) => (
                    <Link
                      key={item.href}
                      href={`${item.href}?preview=true`}
                      target="_blank"
                      onClick={() => setMobileOpen(false)}
                      className="inline-flex items-center gap-2 rounded-[var(--radius-sm)] px-3 py-2 text-sm text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                    >
                      <item.icon className="h-4 w-4" />
                      {item.name}
                    </Link>
                  ))}
                </div>
              </div>

              <div className="mt-2 border-t pt-3">
                <SignOutButton className="h-9 w-full justify-center" />
              </div>
            </nav>
          </div>
        ) : null}

        <main>
          <div className="mx-auto w-full max-w-7xl px-4 py-5">{children}</div>
        </main>

        <Footer />
      </div>
    </AppShell>
  );
}
