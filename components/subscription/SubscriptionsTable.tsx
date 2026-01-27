// components/admin/SubscriptionsTable.tsx
"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";

interface SubscriptionWithUser {
  id: string;
  status: string;
  planType: string;
  startDate: Date;
  endDate: Date | null;
  provider: string;
  User: {
    name: string | null;
    email: string;
  };
}

interface SubscriptionsTableProps {
  data: SubscriptionWithUser[];
}

export function SubscriptionsTable({ data }: SubscriptionsTableProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "default"; // usually black/primary
      case "cancelled":
        return "destructive";
      case "pending":
        return "secondary";
      default:
        return "outline";
    }
  };

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>User</TableHead>
            <TableHead>Plan</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Provider</TableHead>
            <TableHead>Start Date</TableHead>
            <TableHead>End Date</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((sub) => (
            <TableRow key={sub.id}>
              <TableCell>
                <div className="flex flex-col">
                  <span className="font-medium">{sub.User.name || "N/A"}</span>
                  <span className="text-xs text-muted-foreground">{sub.User.email}</span>
                </div>
              </TableCell>
              <TableCell className="capitalize">{sub.planType}</TableCell>
              <TableCell>
                <Badge variant={getStatusColor(sub.status) as any}>
                  {sub.status}
                </Badge>
              </TableCell>
              <TableCell className="capitalize">{sub.provider}</TableCell>
              <TableCell>{format(new Date(sub.startDate), "MMM d, yyyy")}</TableCell>
              <TableCell>
                {sub.endDate ? format(new Date(sub.endDate), "MMM d, yyyy") : "N/A"}
              </TableCell>
            </TableRow>
          ))}
          {data.length === 0 && (
            <TableRow>
              <TableCell colSpan={6} className="h-24 text-center">
                No subscriptions found.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
