import { redirect } from "next/navigation";
import { requireRole } from "@/lib/access";
import { AdminLayoutClient } from "@/components/layout/AdminLayoutClient";
import { Suspense } from "react";
import { Loader2 } from "lucide-react";

async function AdminGuard({ children }: { children: React.ReactNode }) {
  try {
    await requireRole("admin");
  } catch (error) {
    redirect("/dashboard");
  }

  return <AdminLayoutClient>{children}</AdminLayoutClient>;
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Suspense
      fallback={
        <div className="flex h-screen items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      }
    >
      <AdminGuard>{children}</AdminGuard>
    </Suspense>
  );
}
