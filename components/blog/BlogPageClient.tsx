"use client";

import { AdminModeWarning } from "@/components/auth/AdminModeWarning";

interface BlogPageClientProps {
  children: React.ReactNode;
}

export function BlogPageClient({ children }: BlogPageClientProps) {
  return (
    <>
      <AdminModeWarning />
      {children}
    </>
  );
}
