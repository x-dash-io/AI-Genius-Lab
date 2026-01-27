import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { requireRole } from "@/lib/access";
import { UnifiedLayout } from "@/components/layout/UnifiedLayout";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  try {
    await requireRole("admin");
  } catch (error) {
    redirect("/dashboard");
  }

  return <UnifiedLayout layoutType="admin">{children}</UnifiedLayout>;
}
