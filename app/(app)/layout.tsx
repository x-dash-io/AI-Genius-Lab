import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { AppLayoutClient } from "@/components/layout/AppLayoutClient";
import { AdminLayoutClient } from "@/components/layout/AdminLayoutClient";
import { Suspense } from "react";
import { Loader2 } from "lucide-react";
import { getUserPlanDisplayName } from "@/lib/subscriptions";
import { DEFAULT_REDIRECTS } from "@/lib/route-policy";

async function AppGuard({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions);

  // Require authentication for all app routes
  if (!session?.user) {
    redirect(DEFAULT_REDIRECTS.signIn);
  }

  // Fetch current plan name for display in sidebar
  const planName = await getUserPlanDisplayName(session.user.id);

  // For admin users, show admin layout with customer preview section
  if (session.user.role === "admin") {
    return <AdminLayoutClient>{children}</AdminLayoutClient>;
  }

  return <AppLayoutClient planName={planName}>{children}</AppLayoutClient>;
}

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <Suspense
      fallback={
        <div className="flex h-screen items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      }
    >
      <AppGuard>{children}</AppGuard>
    </Suspense>
  );
}
