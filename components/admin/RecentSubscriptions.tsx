import { getRecentSubscriptions } from "@/lib/admin/subscriptions";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";

export async function RecentSubscriptions() {
  const subscriptions = await getRecentSubscriptions(5);

  if (subscriptions.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No subscriptions yet
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {subscriptions.map((subscription) => (
        <div
          key={subscription.id}
          className="flex items-center justify-between p-4 border rounded-lg"
        >
          <div className="space-y-1">
            <p className="font-medium">{subscription.User.name || subscription.User.email}</p>
            <p className="text-sm text-muted-foreground">{subscription.User.email}</p>
          </div>
          <div className="text-right space-y-1">
            <Badge
              variant={subscription.status === "active" ? "default" : "secondary"}
            >
              {subscription.planType}
            </Badge>
            <p className="text-xs text-muted-foreground">
              {format(new Date(subscription.createdAt), "MMM dd, yyyy")}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
