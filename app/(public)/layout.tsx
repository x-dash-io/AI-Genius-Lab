import { PublicLayoutClient } from "@/components/layout/PublicLayoutClient";
import { AppLayoutClient } from "@/components/layout/AppLayoutClient";
import { AdminLayoutClient } from "@/components/layout/AdminLayoutClient";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getSocialLinks } from "@/lib/settings";
import { getUserPlanDisplayName } from "@/lib/subscriptions";

export default async function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  // For admin users, show admin layout with customer preview section
  if (session?.user?.role === "admin") {
    return <AdminLayoutClient>{children}</AdminLayoutClient>;
  }

  // For logged-in regular users, show app layout with sidebar
  if (session?.user) {
    const planName = await getUserPlanDisplayName(session.user.id);
    return <AppLayoutClient planName={planName}>{children}</AppLayoutClient>;
  }

  const socialLinks = await getSocialLinks();

  // For guests, show public layout with top bar
  return <PublicLayoutClient socialLinks={socialLinks}>{children}</PublicLayoutClient>;
}
