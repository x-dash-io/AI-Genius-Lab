"use client";

import { useAdminPreview } from "@/components/admin/PreviewBanner";
import { ShieldAlert } from "lucide-react";

export function ProfilePreviewBanner() {
  const { isAdminPreview } = useAdminPreview();

  if (!isAdminPreview) {
    return null;
  }

  return (
    <div className="flex items-center gap-3 p-4 rounded-lg bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 mb-6">
      <ShieldAlert className="h-5 w-5 text-amber-600 dark:text-amber-400 shrink-0" />
      <div>
        <p className="text-sm font-medium text-amber-800 dark:text-amber-200">
          Profile Preview Mode
        </p>
        <p className="text-xs text-amber-700 dark:text-amber-300">
          This shows the customer profile page layout. Sample data is displayed. Edit forms are read-only in preview.
        </p>
      </div>
    </div>
  );
}

export function useProfilePreview() {
  const { isAdminPreview } = useAdminPreview();
  return { isReadOnly: isAdminPreview };
}
