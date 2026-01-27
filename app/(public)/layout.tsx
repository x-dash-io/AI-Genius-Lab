import { UnifiedLayout } from "@/components/layout/UnifiedLayout";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export default async function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);
  
  // UnifiedLayout will automatically determine the correct layout type based on session
  // For logged-in users, it will show customer/admin layout
  // For guests, it will show public layout
  return <UnifiedLayout layoutType="public">{children}</UnifiedLayout>;
}
