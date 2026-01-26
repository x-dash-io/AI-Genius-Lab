import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Crown, TrendingUp, Users, DollarSign } from "lucide-react";
import { getSubscriptionStats } from "@/lib/admin/subscriptions";

export async function SubscriptionStats() {
  const stats = await getSubscriptionStats();

  const statCards = [
    {
      title: "Active Subscriptions",
      value: stats.active,
      change: `+${stats.newThisMonth} this month`,
      icon: Users,
      color: "text-blue-600",
    },
    {
      title: "Monthly Recurring Revenue",
      value: `$${stats.mrr.toFixed(2)}`,
      change: `+${stats.monthlyGrowthRate}% growth`,
      icon: DollarSign,
      color: "text-green-600",
    },
    {
      title: "Annual Revenue",
      value: `$${stats.arr.toFixed(2)}`,
      change: `${stats.annual} annual plans`,
      icon: TrendingUp,
      color: "text-purple-600",
    },
    {
      title: "Churn Rate",
      value: `${stats.churnRate}%`,
      change: `${stats.cancelled} cancelled`,
      icon: Crown,
      color: "text-orange-600",
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {statCards.map((stat) => (
        <Card key={stat.title}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {stat.title}
            </CardTitle>
            <stat.icon className={`h-4 w-4 ${stat.color}`} />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stat.value}</div>
            <p className="text-xs text-muted-foreground">
              {stat.change}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
