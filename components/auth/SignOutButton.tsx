"use client";

import { signOut } from "next-auth/react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";

export function SignOutButton() {
  const [isLoading, setIsLoading] = useState(false);

  async function handleSignOut() {
    setIsLoading(true);
    try {
      await signOut({ callbackUrl: "/" });
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
      className="w-full"
    >
      <LogOut className="h-4 w-4" />
      {isLoading ? "Signing out..." : "Sign out"}
    </Button>
  );
}
