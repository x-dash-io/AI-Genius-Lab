"use client";

import { useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { Eye, ArrowLeft, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export function PreviewBanner() {
  const { data: session } = useSession();
  const searchParams = useSearchParams();
  const isPreview = searchParams.get("preview") === "true";

  // Only show for admin users in preview mode
  if (!isPreview || session?.user?.role !== "admin") {
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
              You're viewing this page as a customer would see it
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/admin" target="_blank">
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
