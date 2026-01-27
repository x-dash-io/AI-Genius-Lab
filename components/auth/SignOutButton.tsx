"use client";

import { signOut } from "next-auth/react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";
import { cn } from "@/lib/utils";

interface SignOutButtonProps {
  className?: string;
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
  size?: "default" | "sm" | "lg" | "icon";
}

export function SignOutButton({ 
  className, 
  variant = "outline",
  size = "sm"
}: SignOutButtonProps) {
  const [isLoading, setIsLoading] = useState(false);

  async function handleSignOut() {
    setIsLoading(true);
    try {
      await signOut({ callbackUrl: "/" });
      // Note: setLoading is not needed here as signOut causes a redirect
    } catch (error) {
      console.error("Sign out error:", error);
      setIsLoading(false);
    }
  }

  return (
    <Button
      onClick={handleSignOut}
      disabled={isLoading}
      variant={variant}
      size={size}
      className={cn(
        "gap-2 transition-all hover:scale-105 active:scale-95 font-medium",
        variant === "outline" && "hover:bg-destructive hover:text-destructive-foreground hover:border-destructive shadow-sm hover:shadow-md",
        className
      )}
    >
      <LogOut className={cn("h-4 w-4", isLoading && "animate-pulse")} />
      {size !== "icon" && (
        <span>{isLoading ? "Signing out..." : "Sign out"}</span>
      )}
    </Button>
  );
}
