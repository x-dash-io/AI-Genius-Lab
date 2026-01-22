import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Activity, AlertCircle } from "lucide-react";

export default async function ActivityPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    redirect("/sign-in");
  }

  let activity = [];
  let dbError = null;

  try {
    activity = await prisma.activityLog.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: "desc" },
      take: 10,
    });
  } catch (error: any) {
    console.error("Database error in activity page:", error);
    dbError = error?.message || "Failed to load activity. Please check your database connection.";
  }

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

      {dbError && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {dbError.includes("Can't reach database server") 
              ? "Unable to connect to the database. Please check your database connection settings or try again later."
              : dbError}
          </AlertDescription>
        </Alert>
      )}

      <div className="grid gap-4">
        {!dbError && activity.map((entry) => (
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
        {!dbError && activity.length === 0 && (
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
