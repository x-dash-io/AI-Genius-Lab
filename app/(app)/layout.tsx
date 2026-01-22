import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { AppLayoutClient } from "@/components/layout/AppLayoutClient";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions);
  
  // Require authentication for all app routes
  if (!session?.user) {
    redirect("/sign-in");
  }
  
  return <AppLayoutClient>{children}</AppLayoutClient>;
}
