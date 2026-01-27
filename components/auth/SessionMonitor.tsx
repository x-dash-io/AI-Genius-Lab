"use client";

import { useSession } from "next-auth/react";
import { useRouter, usePathname } from "next/navigation";
import { useEffect, useRef } from "react";

/**
 * SessionMonitor - Monitors session changes and handles account switching
 * This component detects when a user's session changes (e.g., different account or role)
 * and forces a refresh to update the UI accordingly
 */
export function SessionMonitor() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const previousUserIdRef = useRef<string | null>(null);
  const previousEmailRef = useRef<string | null>(null);
  const previousRoleRef = useRef<string | null>(null);

  useEffect(() => {
    // Skip if still loading
    if (status === "loading") {
      return;
    }

    // User logged out
    if (status === "unauthenticated") {
      previousUserIdRef.current = null;
      previousEmailRef.current = null;
      previousRoleRef.current = null;
      
      // If on a protected route, redirect to sign-in
      const protectedRoutes = ["/dashboard", "/library", "/profile", "/activity", "/admin"];
      const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route));
      
      if (isProtectedRoute) {
        router.push("/sign-in");
      }
      return;
    }

    // User is authenticated
    if (status === "authenticated" && session?.user) {
      const currentUserId = session.user.id;
      const currentEmail = session.user.email;
      const currentRole = session.user.role || "customer";

      // Check if this is the first load
      if (previousUserIdRef.current === null) {
        previousUserIdRef.current = currentUserId;
        previousEmailRef.current = currentEmail || null;
        previousRoleRef.current = currentRole;
        return;
      }

      // Detect account switch - user ID or email changed
      const accountChanged = 
        previousUserIdRef.current !== currentUserId ||
        (previousEmailRef.current && currentEmail && previousEmailRef.current !== currentEmail);

      // Detect role change - critical for multi-device sync
      const roleChanged = previousRoleRef.current !== currentRole;

      if (accountChanged || roleChanged) {
        if (accountChanged) {
          console.log("Account switch detected, refreshing application state");
        }
        if (roleChanged) {
          console.log(`Role change detected: ${previousRoleRef.current} -> ${currentRole}, refreshing application state`);
        }
        
        // Clear local storage
        if (typeof window !== "undefined") {
          localStorage.removeItem("cart");
          sessionStorage.clear();
        }

        // Update refs
        previousUserIdRef.current = currentUserId;
        previousEmailRef.current = currentEmail || null;
        previousRoleRef.current = currentRole;

        // Force a full page refresh to clear all state and ensure UI updates
        // This is especially important for role changes
        window.location.reload();
        
        // Note: window.location.reload() will handle the redirect, but we set it up anyway
        const redirectUrl = currentRole === "admin" ? "/admin" : "/dashboard";
        if (!pathname.startsWith(redirectUrl)) {
          router.push(redirectUrl);
        }
      }
    }
  }, [session, status, router, pathname]);

  // This component doesn't render anything
  return null;
}
