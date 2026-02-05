import { PublicLayoutClient } from "@/components/layout/PublicLayoutClient";
import { AppLayoutClient } from "@/components/layout/AppLayoutClient";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getSocialLinks } from "@/lib/settings";

export default async function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  // For logged-in users, show app layout with sidebar
  if (session?.user) {
    return <AppLayoutClient>{children}</AppLayoutClient>;
  }

  const socialLinks = await getSocialLinks();

  // For guests, show public layout with top bar
  return <PublicLayoutClient socialLinks={socialLinks}>{children}</PublicLayoutClient>;
}
