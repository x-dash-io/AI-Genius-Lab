"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import { motion } from "framer-motion";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { SignOutButton } from "@/components/auth/SignOutButton";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { CartIcon } from "@/components/cart/CartIcon";
import { cn } from "@/lib/utils";
import { useState, useEffect } from "react";

interface UserProfileProps {
  profileHref: string;
  showCart?: boolean;
  showThemeToggle?: boolean;
  variant?: "sidebar" | "mobile" | "header";
  className?: string;
}

export function UserProfile({
  profileHref,
  showCart = false,
  showThemeToggle = true,
  variant = "sidebar",
  className,
}: UserProfileProps) {
  const { data: session, status } = useSession();
  const [avatarUrl, setAvatarUrl] = useState<string | null | undefined>(session?.user?.image);
  const isLoadingSession = status === "loading";

  // Listen for avatar updates
  useEffect(() => {
    const handleAvatarUpdate = (event: CustomEvent) => {
      setAvatarUrl(event.detail.imageUrl);
    };

    window.addEventListener("avatarUpdated", handleAvatarUpdate as EventListener);
    return () => {
      window.removeEventListener("avatarUpdated", handleAvatarUpdate as EventListener);
    };
  }, []);

  // Update avatar when session changes
  useEffect(() => {
    setAvatarUrl(session?.user?.image);
  }, [session?.user?.image]);

  const getInitials = () => {
    if (!session?.user) return "U";
    const name = session.user.name;
    const email = session.user.email || "";
    if (name && name.trim()) {
      const nameParts = name.trim().split(/\s+/);
      return nameParts[0][0].toUpperCase();
    }
    return email.charAt(0).toUpperCase();
  };

  if (isLoadingSession) {
    return (
      <div className={className}>
        {variant === "sidebar" && (
          <div className="space-y-3">
            <div className="flex items-center gap-3 p-3 rounded-lg">
              <div className="h-10 w-10 rounded-full bg-muted animate-pulse" />
              <div className="flex-1 space-y-2">
                <div className="h-4 w-24 bg-muted rounded animate-pulse" />
                <div className="h-3 w-16 bg-muted rounded animate-pulse" />
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <div className="h-9 w-full bg-muted rounded animate-pulse" />
              {(showCart || showThemeToggle) && (
                <div className="flex items-center justify-center gap-2">
                  {showCart && <CartIcon />}
                  {showThemeToggle && <ThemeToggle />}
                </div>
              )}
            </div>
          </div>
        )}
        {variant === "mobile" && (
          <div className="space-y-3">
            <div className="flex items-center gap-3 p-3 rounded-lg">
              <div className="h-10 w-10 rounded-full bg-muted animate-pulse" />
              <div className="flex-1 space-y-2">
                <div className="h-4 w-32 bg-muted rounded animate-pulse" />
                <div className="h-3 w-48 bg-muted rounded animate-pulse" />
              </div>
            </div>
            <div className="h-9 w-full bg-muted rounded animate-pulse" />
          </div>
        )}
        {variant === "header" && (
          <div className="flex items-center gap-2">
            <div className="h-6 w-6 rounded-full bg-muted animate-pulse" />
            <div className="h-6 w-24 bg-muted rounded animate-pulse" />
          </div>
        )}
      </div>
    );
  }

  if (!session?.user) {
    return null;
  }

  if (variant === "sidebar") {
    return (
      <div className={className}>
        <div className="space-y-3">
          <Link href={profileHref}>
            <motion.div
              whileHover={{ scale: 1.02 }}
              className="flex items-center gap-3 p-3 rounded-lg hover:bg-accent transition-colors cursor-pointer"
            >
              <Avatar className="h-10 w-10 ring-2 ring-primary/20 flex-shrink-0">
                <AvatarImage src={avatarUrl || undefined} alt={session.user.name || session.user.email || "User"} />
                <AvatarFallback className="bg-primary text-primary-foreground text-sm font-semibold">
                  {getInitials()}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 overflow-hidden min-w-0">
                <p className="truncate text-sm font-medium" title={session.user.name || session.user.email || ""}>
                  {session.user.name || session.user.email}
                </p>
                <p className="truncate text-xs text-muted-foreground">
                  {session.user.role === "admin" ? "Admin" : "Customer"}
                </p>
              </div>
            </motion.div>
          </Link>
          <div className="flex flex-col gap-2">
            <SignOutButton className="w-full" />
            {(showCart || showThemeToggle) && (
              <div className="flex items-center justify-center gap-2">
                {showCart && <CartIcon />}
                {showThemeToggle && <ThemeToggle />}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  if (variant === "mobile") {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className={cn("border-t px-4 py-4 space-y-3 sticky bottom-0 bg-card/95 backdrop-blur-md", className)}
      >
        <Link href={profileHref}>
          <div className="flex items-center gap-3 p-3 rounded-lg hover:bg-accent transition-colors active:scale-[0.98]">
            <Avatar className="h-10 w-10 ring-2 ring-primary/20">
              <AvatarImage src={avatarUrl || undefined} alt={session.user.name || session.user.email || "User"} />
              <AvatarFallback className="bg-primary text-primary-foreground text-sm font-semibold">
                {getInitials()}
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
    );
  }

  // Header variant
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <Link href={profileHref}>
        <div className="flex items-center gap-2 px-2 py-1 rounded-lg hover:bg-accent transition-colors">
          <Avatar className="h-6 w-6">
            <AvatarImage src={avatarUrl || undefined} alt={session.user.name || session.user.email || "User"} />
            <AvatarFallback className="bg-primary text-primary-foreground text-xs">
              {getInitials()}
            </AvatarFallback>
          </Avatar>
          <span className="text-sm">{session.user.name || session.user.email}</span>
        </div>
      </Link>
      <SignOutButton />
    </div>
  );
}
