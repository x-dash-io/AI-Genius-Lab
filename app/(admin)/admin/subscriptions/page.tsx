// app/admin/subscriptions/page.tsx
import { Metadata } from "next";
import { getSubscriptionStats } from "@/lib/subscription";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, DollarSign, TrendingUp, Crown } from "lucide-react";
import { SubscriptionsTable } from "@/components/admin/SubscriptionsTable";
import { Suspense } from "react";

interface Subscription {
  id: string;
  userId: string;
  plan: string;
  status: string;
  createdAt: Date;
  User: {
    name: string | null;
    email: string;
  };
}

export const metadata: Metadata = {
  title: "Subscription Management | Admin",
};

async function StatsCards() {
  const stats = await getSubscriptionStats();

  const cards = [
    {
      title: "Active Subscriptions",
      value: stats.active,
      description: `${stats.monthly} Monthly, ${stats.annual} Annual`,
      icon: Users,
      color: "text-blue-600",
    },
    {
      title: "Monthly Recurring Revenue",
      value: `$${stats.mrr.toFixed(2)}`,
      description: "Estimated MRR",
      icon: DollarSign,
      color: "text-green-600",
    },
    {
      title: "Annual Revenue",
      value: `$${stats.arr.toFixed(2)}`,
      description: "Revenue from annual plans",
      icon: TrendingUp,
      color: "text-purple-600",
    },
    {
      title: "Churned",
      value: stats.churned,
      description: "Cancelled subscriptions",
      icon: Crown,
      color: "text-orange-600",
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {cards.map((card) => (
        <Card key={card.title}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {card.title}
            </CardTitle>
            <card.icon className={`h-4 w-4 ${card.color}`} />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{card.value}</div>
            <p className="text-xs text-muted-foreground">
              {card.description}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

export default async function AdminSubscriptionsPage() {
  // Fetch all subscriptions for the table
  const subscriptions = await prisma.subscription.findMany({
    include: {
      User: {
        select: {
          name: true,
          email: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
    take: 50, // Limit to last 50 for performance
  });

  return (
    <div className="space-y-6 p-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Subscriptions</h1>
      </div>

      <Suspense fallback={<div>Loading stats...</div>}>
        <StatsCards />
      </Suspense>

      <Card>
        <CardHeader>
          <CardTitle>Recent Subscriptions</CardTitle>
          <CardDescription>
            A list of the most recent 50 subscriptions.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <SubscriptionsTable subscriptions={subscriptions} />
        </CardContent>
      </Card>
    </div>
  );
}
