"use client";

import { useSearchParams, usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { Eye, ArrowLeft, ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

// Helper to check if pathname is a customer page
function isCustomerPagePath(pathname: string): boolean {
  return pathname.startsWith("/dashboard") || 
    pathname.startsWith("/library") || 
    pathname.startsWith("/cart") || 
    pathname.startsWith("/activity") || 
    pathname.startsWith("/profile");
}

export function PreviewBanner() {
  const { data: session } = useSession();
  const searchParams = useSearchParams();
  const pathname = usePathname() ?? "/";
  const isPreviewParam = searchParams?.get("preview") === "true";

  const isAdmin = session?.user?.role === "admin";
  const isCustomerPage = isCustomerPagePath(pathname);

  // Only show for admin users on customer pages WITH preview=true param
  if (!isAdmin || !isCustomerPage || !isPreviewParam) {
    return null;
  }

  return (
    <div className="sticky top-0 z-50 border-b-2 border-amber-500 bg-amber-50 dark:bg-amber-950/50 px-4 py-3">
      <div className="mx-auto max-w-7xl flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-amber-500/20">
            <Eye className="h-4 w-4 text-amber-700 dark:text-amber-300" />
          </div>
          <div>
            <p className="text-sm font-semibold text-amber-800 dark:text-amber-200">
              Customer Preview Mode
            </p>
            <p className="text-xs text-amber-700 dark:text-amber-300">
              You&apos;re viewing this page as a customer would see it. Some actions are restricted.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-500/20 text-xs font-medium text-amber-700 dark:text-amber-300">
            <ShieldAlert className="h-3 w-3" />
            Admin Preview
          </div>
          <Link href="/admin">
            <Button 
              size="sm" 
              variant="outline"
              className="gap-2 border-amber-500 text-amber-700 hover:bg-amber-100 dark:border-amber-400 dark:text-amber-300 dark:hover:bg-amber-900/50"
            >
              <ArrowLeft className="h-3 w-3" />
              Back to Admin
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}

/**
 * Hook to check if the current user is an admin in preview mode
 * Preview mode requires both: admin user AND ?preview=true in URL
 */
export function useAdminPreview() {
  const { data: session } = useSession();
  const pathname = usePathname() ?? "/";
  const searchParams = useSearchParams();
  
  const isAdmin = session?.user?.role === "admin";
  const isCustomerPage = isCustomerPagePath(pathname);
  const isPreviewParam = searchParams?.get("preview") === "true";

  return {
    isAdminPreview: isAdmin && isCustomerPage && isPreviewParam,
    isAdmin,
    isPreviewMode: isPreviewParam,
  };
}
