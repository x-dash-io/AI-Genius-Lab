"use client";

import { useSession } from "next-auth/react";
import { useEffect, useRef } from "react";

/**
 * SessionHealthCheck - Monitors session health and handles edge cases
 * - Checks if session is still valid periodically
 * - Handles session expiration gracefully
 * - Provides fallback mechanisms for session recovery
 */
export function SessionHealthCheck() {
  const { data: session, status, update } = useSession();
  const healthCheckIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const lastSessionCheckRef = useRef<number>(Date.now());

  useEffect(() => {
    // Only run health check when authenticated
    if (status !== "authenticated" || !session?.user) {
      if (healthCheckIntervalRef.current) {
        clearInterval(healthCheckIntervalRef.current);
        healthCheckIntervalRef.current = null;
      }
      return;
    }

    // Perform health check every 2 minutes
    healthCheckIntervalRef.current = setInterval(async () => {
      const now = Date.now();
      const timeSinceLastCheck = now - lastSessionCheckRef.current;

      // If it's been more than 3 minutes since last check, force a session update
      if (timeSinceLastCheck > 3 * 60 * 1000) {
        try {
          console.log("[SessionHealthCheck] Performing session health check...");
          await update();
          lastSessionCheckRef.current = Date.now();
        } catch (error) {
          console.error("[SessionHealthCheck] Session health check failed:", error);
          // If update fails, session might be expired - let SessionMonitor handle it
        }
      }
    }, 2 * 60 * 1000); // Check every 2 minutes

    // Initial check
    lastSessionCheckRef.current = Date.now();

    return () => {
      if (healthCheckIntervalRef.current) {
        clearInterval(healthCheckIntervalRef.current);
        healthCheckIntervalRef.current = null;
      }
    };
  }, [status, session, update]);

  // This component doesn't render anything
  return null;
}
