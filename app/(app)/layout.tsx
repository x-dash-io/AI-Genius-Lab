import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { AppLayoutClient } from "@/components/layout/AppLayoutClient";
import { Suspense } from "react";
import { Loader2 } from "lucide-react";

async function AppGuard({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions);
  
  // Require authentication for all app routes
  if (!session?.user) {
    redirect("/sign-in");
  }
  
  return <AppLayoutClient>{children}</AppLayoutClient>;
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
