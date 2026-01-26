"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Crown, Calendar, CreditCard, ExternalLink, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface Subscription {
  id: string;
  planType: "monthly" | "annual";
  status: "active" | "cancelled" | "expired" | "paused";
  startDate: Date;
  endDate?: Date | null;
  nextBillingAt?: Date | null;
  cancelledAt?: Date | null;
  provider: "paypal" | "stripe";
}

interface ProfileSubscriptionProps {
  userId: string;
}

export function ProfileSubscription({ userId }: ProfileSubscriptionProps) {
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    fetchSubscription();
  }, [userId]);

  const fetchSubscription = async () => {
    try {
      const response = await fetch("/api/subscription");
      if (response.ok) {
        const data = await response.json();
        setSubscription(data.subscription);
      }
    } catch (error) {
      console.error("Failed to fetch subscription:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async () => {
    if (!subscription) return;
    
    if (!confirm("Are you sure you want to cancel your subscription? You'll continue to have access until the end of your billing period.")) {
      return;
    }

    setActionLoading(true);
    try {
      const response = await fetch("/api/subscription/cancel", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subscriptionId: subscription.id }),
      });

      if (response.ok) {
        await fetchSubscription();
        alert("Subscription cancelled successfully");
      } else {
        const error = await response.json();
        alert(error.error || "Failed to cancel subscription");
      }
    } catch (error) {
      console.error("Failed to cancel subscription:", error);
      alert("Failed to cancel subscription");
    } finally {
      setActionLoading(false);
    }
  };

  const handleReactivate = async () => {
    if (!subscription) return;

    setActionLoading(true);
    try {
      const response = await fetch("/api/subscription/reactivate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subscriptionId: subscription.id }),
      });

      if (response.ok) {
        await fetchSubscription();
        alert("Subscription reactivated successfully");
      } else {
        const error = await response.json();
        alert(error.error || "Failed to reactivate subscription");
      }
    } catch (error) {
      console.error("Failed to reactivate subscription:", error);
      alert("Failed to reactivate subscription");
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Crown className="h-5 w-5" />
            Subscription
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-muted rounded w-3/4"></div>
            <div className="h-4 bg-muted rounded w-1/2"></div>
            <div className="h-10 bg-muted rounded w-full"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!subscription) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Crown className="h-5 w-5" />
            Premium Subscription
          </CardTitle>
          <CardDescription>
            Get unlimited access to all courses and premium features
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Crown className="h-4 w-4" />
              No active subscription
            </div>
          </div>
          <Link href="/subscription">
            <Button className="w-full">
              <Crown className="h-4 w-4 mr-2" />
              Upgrade to Premium
            </Button>
          </Link>
        </CardContent>
      </Card>
    );
  }

  const isActive = subscription.status === "active";
  const isCancelled = subscription.status === "cancelled";
  const isPaused = subscription.status === "paused";
  const isExpired = subscription.status === "expired";

  const planName = subscription.planType === "monthly" ? "Monthly Premium" : "Annual Premium";
  const planPrice = subscription.planType === "monthly" ? "$29.99/month" : "$299.99/year";

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Crown className="h-5 w-5" />
          Premium Subscription
        </CardTitle>
        <CardDescription>
          Manage your premium subscription
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Status Badge */}
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">Status</span>
          <Badge
            variant={isActive ? "default" : isCancelled ? "secondary" : "destructive"}
            className={cn(
              isActive && "bg-green-100 text-green-800 hover:bg-green-100",
              isCancelled && "bg-yellow-100 text-yellow-800 hover:bg-yellow-100",
              (isPaused || isExpired) && "bg-red-100 text-red-800 hover:bg-red-100"
            )}
          >
            {isActive ? "Active" : isCancelled ? "Cancelled" : isPaused ? "Paused" : "Expired"}
          </Badge>
        </div>

        <Separator />

        {/* Plan Details */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Plan</span>
            <span className="text-sm">{planName}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Price</span>
            <span className="text-sm">{planPrice}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Payment Method</span>
            <div className="flex items-center gap-1">
              <CreditCard className="h-4 w-4" />
              <span className="text-sm capitalize">{subscription.provider}</span>
            </div>
          </div>
        </div>

        <Separator />

        {/* Dates */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Started</span>
            <span className="text-sm">
              {new Date(subscription.startDate).toLocaleDateString()}
            </span>
          </div>
          
          {isActive && subscription.nextBillingAt && (
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Next Billing</span>
              <span className="text-sm">
                {new Date(subscription.nextBillingAt).toLocaleDateString()}
              </span>
            </div>
          )}

          {isCancelled && subscription.endDate && (
            <div className="flex items-center justify-between text-yellow-600">
              <AlertCircle className="h-4 w-4" />
              <span className="text-sm">Access ends on {new Date(subscription.endDate).toLocaleDateString()}</span>
            </div>
          )}

          {isExpired && (
            <div className="flex items-center justify-between text-red-600">
              <AlertCircle className="h-4 w-4" />
              <span className="text-sm">Expired on {new Date(subscription.endDate || subscription.cancelledAt || new Date()).toLocaleDateString()}</span>
            </div>
          )}
        </div>

        <Separator />

        {/* Actions */}
        <div className="space-y-2">
          {isActive && (
            <Button
              variant="outline"
              onClick={handleCancel}
              disabled={actionLoading}
              className="w-full"
            >
              {actionLoading ? "Cancelling..." : "Cancel Subscription"}
            </Button>
          )}

          {isCancelled && subscription.endDate && new Date(subscription.endDate) > new Date() && (
            <Button
              onClick={handleReactivate}
              disabled={actionLoading}
              className="w-full"
            >
              {actionLoading ? "Reactivating..." : "Reactivate Subscription"}
            </Button>
          )}

          {(isExpired || isPaused) && (
            <Link href="/subscription">
              <Button className="w-full">
                <Crown className="h-4 w-4 mr-2" />
                Subscribe Again
              </Button>
            </Link>
          )}

          <Link href="/subscription" className="block">
            <Button variant="ghost" size="sm" className="w-full">
              <ExternalLink className="h-4 w-4 mr-2" />
              View Subscription Details
            </Button>
          </Link>
        </div>

        {/* Benefits Reminder */}
        {isActive && (
          <div className="rounded-lg bg-green-50 p-4 dark:bg-green-900/20">
            <h4 className="font-medium text-green-900 dark:text-green-100 mb-2">
              Your Premium Benefits
            </h4>
            <ul className="text-sm text-green-700 dark:text-green-300 space-y-1">
              <li>• Unlimited access to all courses</li>
              <li>• Certificate of completion</li>
              <li>• Priority customer support</li>
              <li>• Early access to new content</li>
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
