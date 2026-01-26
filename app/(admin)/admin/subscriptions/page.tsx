import { Suspense } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { SubscriptionStats } from "@/components/admin/SubscriptionStats";
import { RecentSubscriptions } from "@/components/admin/RecentSubscriptions";
import { SubscriptionsTable } from "@/components/admin/SubscriptionsTable";

export default async function SubscriptionsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Subscriptions</h1>
        <p className="text-muted-foreground">
          Manage and monitor premium subscriptions
        </p>
      </div>

      {/* Stats Overview */}
      <Suspense fallback={<div>Loading stats...</div>}>
        <SubscriptionStats />
      </Suspense>

      {/* Recent Subscriptions */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Subscriptions</CardTitle>
          <CardDescription>
            Latest subscription activity
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Suspense fallback={<div>Loading recent subscriptions...</div>}>
            <RecentSubscriptions />
          </Suspense>
        </CardContent>
      </Card>

      {/* All Subscriptions Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Subscriptions</CardTitle>
          <CardDescription>
            View and manage all user subscriptions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Suspense fallback={<div>Loading subscriptions...</div>}>
            <SubscriptionsTable />
          </Suspense>
        </CardContent>
      </Card>
    </div>
  );
}
