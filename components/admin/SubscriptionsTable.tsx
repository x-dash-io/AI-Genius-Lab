"use client";

import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Eye, Ban, CheckCircle } from "lucide-react";
import { format } from "date-fns";
import { useRouter } from "next/navigation";

interface Subscription {
  id: string;
  planType: "monthly" | "annual";
  status: "active" | "cancelled" | "expired" | "paused";
  startDate: string;
  endDate?: string;
  cancelledAt?: string;
  createdAt: string;
  User: {
    id: string;
    email: string;
    name?: string;
  };
  _count: {
    Enrollment: number;
  };
}

export function SubscriptionsTable() {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    fetchSubscriptions();
  }, []);

  const fetchSubscriptions = async () => {
    try {
      const response = await fetch("/api/admin/subscriptions");
      if (response.ok) {
        const data = await response.json();
        setSubscriptions(data);
      }
    } catch (error) {
      console.error("Failed to fetch subscriptions:", error);
    } finally {
      setLoading(false);
    }
  };

  const updateSubscriptionStatus = async (
    subscriptionId: string,
    status: "active" | "cancelled" | "expired" | "paused"
  ) => {
    try {
      const response = await fetch(`/api/admin/subscriptions/${subscriptionId}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status }),
      });

      if (response.ok) {
        fetchSubscriptions(); // Refresh the list
      }
    } catch (error) {
      console.error("Failed to update subscription:", error);
    }
  };

  if (loading) {
    return <div>Loading subscriptions...</div>;
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>User</TableHead>
            <TableHead>Plan</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Courses</TableHead>
            <TableHead>Started</TableHead>
            <TableHead>Ends</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {subscriptions.map((subscription) => (
            <TableRow key={subscription.id}>
              <TableCell>
                <div>
                  <p className="font-medium">
                    {subscription.User.name || "No name"}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {subscription.User.email}
                  </p>
                </div>
              </TableCell>
              <TableCell>
                <Badge variant="outline">
                  {subscription.planType}
                </Badge>
              </TableCell>
              <TableCell>
                <Badge
                  variant={
                    subscription.status === "active"
                      ? "default"
                      : subscription.status === "cancelled"
                      ? "secondary"
                      : "destructive"
                  }
                >
                  {subscription.status}
                </Badge>
              </TableCell>
              <TableCell>{subscription._count.Enrollment}</TableCell>
              <TableCell>
                {format(new Date(subscription.startDate), "MMM dd, yyyy")}
              </TableCell>
              <TableCell>
                {subscription.endDate
                  ? format(new Date(subscription.endDate), "MMM dd, yyyy")
                  : "Never"}
              </TableCell>
              <TableCell className="text-right">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem
                      onClick={() =>
                        router.push(`/admin/subscriptions/${subscription.id}`)
                      }
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      View Details
                    </DropdownMenuItem>
                    {subscription.status === "active" && (
                      <DropdownMenuItem
                        onClick={() =>
                          updateSubscriptionStatus(subscription.id, "cancelled")
                        }
                      >
                        <Ban className="h-4 w-4 mr-2" />
                        Cancel
                      </DropdownMenuItem>
                    )}
                    {subscription.status === "cancelled" && (
                      <DropdownMenuItem
                        onClick={() =>
                          updateSubscriptionStatus(subscription.id, "active")
                        }
                      >
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Reactivate
                      </DropdownMenuItem>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
