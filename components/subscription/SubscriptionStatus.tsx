"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, CreditCard, Crown } from "lucide-react";
import { format } from "date-fns";

interface SubscriptionStatusProps {
  subscription: {
    id: string;
    planType: "monthly" | "annual";
    status: string;
    startDate: string;
    endDate?: string;
    nextBillingAt?: string;
    cancelledAt?: string;
  };
  onCancel?: () => void;
  onReactivate?: () => void;
  isCancelling?: boolean;
  isReactivating?: boolean;
}

export function SubscriptionStatus({
  subscription,
  onCancel,
  onReactivate,
  isCancelling = false,
  isReactivating = false,
}: SubscriptionStatusProps) {
  const isCancelled = subscription.status === "cancelled";
  const isActive = subscription.status === "active";
  const planName = subscription.planType === "monthly" ? "Monthly Premium" : "Annual Premium";

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Crown className="h-5 w-5 text-primary" />
            <CardTitle className="text-lg">Premium Subscription</CardTitle>
          </div>
          <Badge variant={isActive ? "default" : isCancelled ? "secondary" : "destructive"}>
            {subscription.status}
          </Badge>
        </div>
        <CardDescription>{planName}</CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="font-medium">Started</p>
              <p className="text-muted-foreground">
                {format(new Date(subscription.startDate), "MMM dd, yyyy")}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <CreditCard className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="font-medium">
                {isCancelled ? "Expires" : "Next Billing"}
              </p>
              <p className="text-muted-foreground">
                {subscription.endDate
                  ? format(new Date(subscription.endDate), "MMM dd, yyyy")
                  : "N/A"}
              </p>
            </div>
          </div>
        </div>

        {isCancelled && (
          <div className="bg-yellow-50 dark:bg-yellow-900/20 p-3 rounded-lg">
            <p className="text-sm text-yellow-800 dark:text-yellow-200">
              Your subscription has been cancelled. You will continue to have access 
              until {subscription.endDate ? format(new Date(subscription.endDate), "MMM dd, yyyy") : "the end of your billing period"}.
            </p>
          </div>
        )}

        <div className="flex gap-2">
          {isActive && onCancel && (
            <Button
              variant="outline"
              size="sm"
              onClick={onCancel}
              disabled={isCancelling}
            >
              {isCancelling ? "Cancelling..." : "Cancel Subscription"}
            </Button>
          )}
          
          {isCancelled && onReactivate && (
            <Button
              size="sm"
              onClick={onReactivate}
              disabled={isReactivating}
            >
              {isReactivating ? "Reactivating..." : "Reactivate"}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
