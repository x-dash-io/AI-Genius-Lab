import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Activity } from "lucide-react";

export default async function ActivityPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    redirect("/sign-in");
  }

  const activity = await prisma.activityLog.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
    take: 10,
  });

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-4xl font-bold tracking-tight">
          Activity
        </h1>
        <p className="mt-2 text-lg text-muted-foreground">
          Recent learning activity and purchase history will appear here.
        </p>
      </div>
      <div className="grid gap-4">
        {activity.map((entry) => (
          <Card key={entry.id}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <CardTitle className="text-lg">{entry.type}</CardTitle>
                  <CardDescription>
                    {entry.createdAt.toLocaleString()}
                  </CardDescription>
                </div>
                <Badge variant="secondary">
                  <Activity className="mr-1 h-3 w-3" />
                  {entry.type}
                </Badge>
              </div>
            </CardHeader>
          </Card>
        ))}
        {activity.length === 0 && (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground">
                Activity timeline and completion events coming soon.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
