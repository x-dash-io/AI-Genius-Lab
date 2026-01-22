import Link from "next/link";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BookOpen, Activity } from "lucide-react";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    redirect("/sign-in");
  }

  const [purchaseCount, lastProgress] = await Promise.all([
    prisma.purchase.count({
      where: { userId: session.user.id, status: "paid" },
    }),
    prisma.progress.findFirst({
      where: { userId: session.user.id },
      orderBy: { updatedAt: "desc" },
      include: { lesson: true },
    }),
  ]);

  return (
    <div className="space-y-8">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
          Customer Dashboard
        </p>
        <h1 className="mt-2 font-display text-4xl font-bold tracking-tight">
          Welcome back to Synapze.
        </h1>
        <p className="mt-2 text-lg text-muted-foreground">
          Resume learning and track your progress across purchased courses.
        </p>
      </div>
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Courses Purchased
            </CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{purchaseCount}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Total courses in your library
            </p>
            <Link href="/library" className="mt-4 inline-block">
              <Button variant="outline" size="sm">
                View library
              </Button>
            </Link>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Last Activity
            </CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-lg font-semibold">
              {lastProgress?.lesson.title ?? "No activity yet"}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {lastProgress?.updatedAt
                ? `Updated ${lastProgress.updatedAt.toLocaleDateString()}`
                : "Complete a lesson to see progress here."}
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
