"use client";

import { signOut, useSession } from "next-auth/react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";

interface SignOutButtonProps {
  className?: string;
  variant?: "default" | "outline" | "ghost" | "destructive" | "secondary" | "link";
  size?: "default" | "sm" | "lg" | "icon";
}

export function SignOutButton({ className, variant = "outline", size = "sm" }: SignOutButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { data: session } = useSession();

  async function handleSignOut() {
    setIsLoading(true);
    try {
      // Clear any local storage or session storage
      if (typeof window !== "undefined") {
        // Clear cart and other local data
        localStorage.removeItem("cart");
        sessionStorage.clear();
      }

      // Sign out with redirect to home page
      await signOut({ 
        callbackUrl: "/",
        redirect: true 
      });
      
      // Force a hard refresh to clear all state
      if (typeof window !== "undefined") {
        window.location.href = "/";
      }
    } catch (error) {
      console.error("Sign out error:", error);
      setIsLoading(false);
      // Fallback: force navigation to home
      router.push("/");
      router.refresh();
    }
  }

  return (
    <Button
      onClick={handleSignOut}
      disabled={isLoading}
      variant={variant}
      size={size}
      className={cn("gap-2", className)}
    >
      <LogOut className="h-4 w-4" />
      <span>{isLoading ? "Signing out..." : "Sign Out"}</span>
    </Button>
  );
}
