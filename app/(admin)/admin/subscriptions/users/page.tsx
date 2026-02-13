import { Suspense } from "react";
import { requireRole } from "@/lib/access";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, User, Calendar, ShieldCheck, Plus } from "lucide-react";
import { format } from "date-fns";
import { grantSubscriptionManually, cancelSubscription } from "@/lib/subscriptions";
import { revalidatePath } from "next/cache";

async function grantAction(formData: FormData) {
  "use server";
  await requireRole("admin");
  const email = formData.get("email") as string;
  const planId = formData.get("planId") as string;
  const interval = formData.get("interval") as "monthly" | "annual";

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) throw new Error("User not found");

  await grantSubscriptionManually({
    userId: user.id,
    planId,
    interval,
    durationDays: interval === "monthly" ? 30 : 365
  });
  revalidatePath("/admin/subscriptions/users");
}

async function revokeAction(formData: FormData) {
  "use server";
  await requireRole("admin");
  const subId = formData.get("subId") as string;
  await cancelSubscription(subId);
  revalidatePath("/admin/subscriptions/users");
}

async function SubscriptionsList() {
  const subscriptions = await prisma.subscription.findMany({
    include: {
      user: true,
      plan: true
    },
    orderBy: { createdAt: "desc" }
  });
  type SubscriptionItem = (typeof subscriptions)[number];

  return (
    <div className="space-y-4">
      {subscriptions.map((sub: SubscriptionItem) => (
        <Card key={sub.id}>
          <CardHeader>
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div className="flex min-w-0 gap-3 sm:gap-4">
                <div className="bg-muted p-2 rounded-full h-fit">
                  <User className="h-6 w-6" />
                </div>
                <div className="min-w-0">
                  <CardTitle className="text-lg">{sub.user.name || "Unnamed User"}</CardTitle>
                  <CardDescription className="truncate">{sub.user.email}</CardDescription>
                </div>
              </div>
              <div className="flex flex-col gap-2 sm:items-end sm:text-right">
                <Badge variant={sub.status === "active" ? "default" : "secondary"}>
                  {sub.status}
                </Badge>
                <Badge variant="outline" className="capitalize">
                  {sub.plan.name} ({sub.interval})
                </Badge>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 text-sm">
              <div className="flex flex-wrap gap-6">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span>Ends: {format(new Date(sub.currentPeriodEnd), "PPP")}</span>
                </div>
                {sub.paypalSubscriptionId && (
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="h-4 w-4 text-muted-foreground" />
                    <span className="break-all font-mono text-xs text-muted-foreground">PayPal: {sub.paypalSubscriptionId}</span>
                  </div>
                )}
              </div>
              {sub.status === "active" && (
                <form action={revokeAction}>
                  <input type="hidden" name="subId" value={sub.id} />
                  <Button type="submit" variant="destructive" size="sm">Revoke Access</Button>
                </form>
              )}
            </div>
          </CardContent>
        </Card>
      ))}

      {subscriptions.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            <p>No active subscriptions found.</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

async function GrantSubscriptionForm() {
  const plans = await prisma.subscriptionPlan.findMany({ where: { isActive: true } });
  type ActivePlan = (typeof plans)[number];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Grant Manual Subscription</CardTitle>
        <CardDescription>Manually grant a subscription tier to a user by email.</CardDescription>
      </CardHeader>
      <CardContent>
        <form
          action={grantAction}
          className="grid gap-4 sm:grid-cols-2 xl:grid-cols-[minmax(0,1fr)_11rem_11rem_auto] xl:items-end"
        >
          <div className="space-y-2 sm:col-span-2 xl:col-span-1">
            <Label htmlFor="email">User Email</Label>
            <Input id="email" name="email" type="email" placeholder="user@example.com" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="planId">Plan</Label>
            <Select name="planId" required>
              <SelectTrigger id="planId">
                <SelectValue placeholder="Select Plan" />
              </SelectTrigger>
              <SelectContent>
                {plans.map((plan: ActivePlan) => (
                  <SelectItem key={plan.id} value={plan.id}>{plan.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="interval">Interval</Label>
            <Select name="interval" defaultValue="monthly" required>
              <SelectTrigger id="interval">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="monthly">Monthly</SelectItem>
                <SelectItem value="annual">Annual</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button type="submit" className="w-full sm:w-auto">
            <Plus className="mr-2 h-4 w-4" />
            Grant
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

export default async function UsersSubscriptionsPage() {
  await requireRole("admin");

  return (
    <div className="space-y-8">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
          Subscription Management
        </p>
        <h1 className="mt-2 font-display text-3xl font-bold tracking-tight sm:text-4xl">
          User Subscriptions
        </h1>
        <p className="mt-2 text-lg text-muted-foreground">
          View and manage all user subscriptions.
        </p>
      </div>

      <GrantSubscriptionForm />

      <h2 className="text-2xl font-bold tracking-tight mt-8">Active & Recent Subscriptions</h2>
      <Suspense fallback={<div className="flex justify-center p-12"><Loader2 className="h-8 w-8 animate-spin" /></div>}>
        <SubscriptionsList />
      </Suspense>
    </div>
  );
}
