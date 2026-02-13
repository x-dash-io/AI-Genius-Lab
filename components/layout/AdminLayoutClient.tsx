"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronLeft, ChevronRight, Eye, Menu, ShieldCheck, X } from "lucide-react";

import { SignOutButton } from "@/components/auth/SignOutButton";
import { Footer } from "@/components/layout/Footer";
import { adminNavigation, customerPreviewLinks } from "@/components/layout/admin/AdminConfig";
import { SidebarProvider, useSidebar } from "@/components/layout/useSidebar";
import { AppShell } from "@/components/layout/shell";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { cn } from "@/lib/utils";

function isActivePath(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`);
}

function AdminLayoutContent({ children }: { children: React.ReactNode }) {
  const pathname = usePathname() ?? "/";
  const { data: session } = useSession();
  const [mobileOpen, setMobileOpen] = useState(false);
  const { isCollapsed, toggleCollapsed } = useSidebar();

  return (
    <AppShell area="admin">
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
              href="/admin"
              className={cn("flex min-w-0 items-center", isCollapsed ? "justify-center" : "gap-2")}
              aria-label="Admin home"
            >
              <Image
                src="/logo.png"
                alt="AI Genius Lab"
                width={156}
                height={34}
                className={cn("h-8 object-contain transition-all duration-300", isCollapsed ? "w-8" : "w-auto")}
                priority
              />
              {!isCollapsed ? (
                <span className="inline-flex items-center gap-1 rounded-full border bg-primary/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-primary">
                  <ShieldCheck className="h-3 w-3" />
                  Admin
                </span>
              ) : null}
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
            {adminNavigation.map((item) => {
              const Icon = item.icon;
              const active = isActivePath(pathname, item.href);

              return (
                <Link
                  key={item.href}
                  href={item.href}
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
                  <span className={isCollapsed ? "sr-only" : ""}>{item.name}</span>
                </Link>
              );
            })}
          </nav>

          <div className="mt-3 space-y-2 border-t pt-4">
            {!isCollapsed ? (
              <p className="px-1 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Customer preview</p>
            ) : null}
            <div className="space-y-1">
              {customerPreviewLinks.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={`${item.href}?preview=true`}
                    target="_blank"
                    title={isCollapsed ? item.name : undefined}
                    className={cn(
                      "inline-flex w-full items-center rounded-[var(--radius-sm)] py-2 text-sm text-muted-foreground hover:bg-accent hover:text-accent-foreground",
                      isCollapsed ? "justify-center px-2" : "gap-2 px-3"
                    )}
                  >
                    <Icon className="h-4 w-4" />
                    <span className={isCollapsed ? "sr-only" : ""}>{item.name}</span>
                    {!isCollapsed ? <Eye className="ml-auto h-3.5 w-3.5" /> : null}
                  </Link>
                );
              })}
            </div>
          </div>

          <div className="mt-4 space-y-3 border-t pt-4">
            <Link
              href="/admin/profile"
              className={cn(
                "ui-surface glass flex rounded-[var(--radius-md)] border",
                isCollapsed ? "justify-center p-2" : "items-center gap-3 p-3"
              )}
            >
              <Avatar className="h-9 w-9">
                <AvatarImage src={session?.user?.image || undefined} alt={session?.user?.name || session?.user?.email || "Admin"} />
                <AvatarFallback>{(session?.user?.name?.[0] || session?.user?.email?.[0] || "A").toUpperCase()}</AvatarFallback>
              </Avatar>
              <div className={cn("min-w-0", isCollapsed && "sr-only")}>
                <p className="truncate text-sm font-semibold">{session?.user?.name || "Admin"}</p>
                <p className="truncate text-xs text-muted-foreground">Administrator</p>
              </div>
            </Link>

            <div className={cn("flex items-center", isCollapsed ? "justify-center" : "justify-between")}>
              <ThemeToggle />
              {!isCollapsed ? <SignOutButton className="h-9 w-auto px-3" /> : null}
            </div>
          </div>
        </aside>

        <div className={cn("min-w-0 transition-all duration-300", isCollapsed ? "pl-16" : "pl-72")}>
          <header className="sticky top-0 z-20 border-b border-border/80 bg-background/90 backdrop-blur">
            <div className="mx-auto flex h-14 w-full max-w-[96rem] items-center px-5 lg:px-8">
              <p className="font-display text-base font-semibold tracking-tight">Admin Workspace</p>
            </div>
          </header>

          <main>
            <div className="mx-auto w-full max-w-[96rem] px-5 py-6 lg:px-8">{children}</div>
          </main>

          <Footer />
        </div>
      </div>

      <div className="md:hidden">
        <header className="sticky top-0 z-40 border-b border-border/80 bg-background/95 backdrop-blur">
          <div className="mx-auto flex h-14 w-full max-w-[96rem] items-center justify-between px-3 sm:px-5">
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

        <AnimatePresence>
          {mobileOpen ? (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                onClick={() => setMobileOpen(false)}
                className="fixed inset-0 z-40 bg-black/50 md:hidden"
              />
              <motion.aside
                initial={{ x: "-100%" }}
                animate={{ x: 0 }}
                exit={{ x: "-100%" }}
                transition={{ type: "tween", duration: 0.28 }}
                className="fixed inset-y-0 left-0 z-50 w-[min(88vw,20rem)] overflow-y-auto border-r bg-card/95 shadow-lg backdrop-blur-lg md:hidden"
              >
                <div className="flex items-center justify-between border-b p-4">
                  <Link href="/admin" className="inline-flex items-center" onClick={() => setMobileOpen(false)}>
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
                    onClick={() => setMobileOpen(false)}
                    aria-label="Close menu"
                    className="rounded-md p-2 text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>

                <nav className="mt-2 space-y-1 px-4 pb-6">
                  {adminNavigation.map((item) => {
                    const Icon = item.icon;
                    const active = isActivePath(pathname, item.href);

                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => setMobileOpen(false)}
                        className={cn(
                          "inline-flex w-full items-center gap-2 rounded-[var(--radius-sm)] px-3 py-2 text-sm font-medium",
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

                  <div className="mt-3 border-t pt-3">
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

                  <div className="mt-3 border-t pt-3">
                    <SignOutButton className="h-9 w-full justify-center" />
                  </div>
                </nav>
              </motion.aside>
            </>
          ) : null}
        </AnimatePresence>

        <main>
          <div className="mx-auto w-full max-w-[96rem] px-3 py-5 sm:px-5">{children}</div>
        </main>

        <Footer />
      </div>
    </AppShell>
  );
}

export function AdminLayoutClient({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <AdminLayoutContent>{children}</AdminLayoutContent>
    </SidebarProvider>
  );
}
