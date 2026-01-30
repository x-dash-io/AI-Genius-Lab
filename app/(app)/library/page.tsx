import Link from "next/link";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BookOpen } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function LibraryPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    redirect("/sign-in");
  }

  const purchases = await prisma.purchase.findMany({
    where: {
      userId: session.user.id,
      status: "paid",
    },
    include: {
      Course: true,
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-8 pb-8">
      <div>
        <h1 className="font-display text-4xl font-bold tracking-tight">
          My Courses
        </h1>
        <p className="mt-2 text-lg text-muted-foreground">
          Purchased courses appear here with progress and resume actions.
        </p>
      </div>
      <div className="grid gap-6">
        {purchases.map((purchase: any) => (
          <Card key={purchase.id}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                    Purchased
                  </p>
                  <CardTitle className="text-xl">{purchase.Course.title}</CardTitle>
                  <CardDescription>
                    {purchase.Course.description || "Continue your learning journey"}
                  </CardDescription>
                </div>
                <BookOpen className="h-5 w-5 text-muted-foreground" />
              </div>
            </CardHeader>
            <CardContent>
              <Link href={`/library/${purchase.Course.slug}`}>
                <Button>Resume Learning</Button>
              </Link>
            </CardContent>
          </Card>
        ))}
        {purchases.length === 0 && (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground">
                No purchases yet. Complete checkout to unlock your course library.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
