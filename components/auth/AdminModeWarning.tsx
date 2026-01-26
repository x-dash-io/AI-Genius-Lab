"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { AlertCircle, X, Shield } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export function AdminModeWarning() {
  const { data: session } = useSession();
  const [dismissed, setDismissed] = useState(false);

  // Check if user is admin and warning hasn't been dismissed
  const isAdmin = session?.user?.role === "admin";
  const shouldShow = isAdmin && !dismissed;

  // Reset dismissed state when session changes
  useEffect(() => {
    setDismissed(false);
  }, [session]);

  if (!shouldShow) {
    return null;
  }

  return (
    <Alert className="mb-6 border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-950/50">
      <Shield className="h-4 w-4 text-amber-600 dark:text-amber-400" />
      <AlertDescription className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-amber-800 dark:text-amber-200">
            You are currently in Admin Mode
          </p>
          <p className="text-xs text-amber-700 dark:text-amber-300 mt-1">
            {session?.user?.email} • Admins cannot purchase courses.{" "}
            <Link href="/admin" className="underline hover:text-amber-900 dark:hover:text-amber-100">
              Go to Admin Dashboard
            </Link>
          </p>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setDismissed(true)}
          className="text-amber-600 hover:text-amber-800 dark:text-amber-400 dark:hover:text-amber-200 ml-4"
        >
          <X className="h-4 w-4" />
        </Button>
      </AlertDescription>
    </Alert>
  );
}
