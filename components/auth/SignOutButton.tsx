"use client";

import { signOut } from "next-auth/react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";
import { cn } from "@/lib/utils";

interface SignOutButtonProps {
  className?: string;
}

export function SignOutButton({ className }: SignOutButtonProps) {
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
      variant="outline"
      size="sm"
      className={cn("gap-2", className)}
    >
      <LogOut className="h-4 w-4" />
      <span>{isLoading ? "Signing out..." : "Sign Out"}</span>
    </Button>
  );
}
