import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getPayPalSubscription } from "@/lib/paypal";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  CheckCircle2,
  ArrowRight,
  Rocket,
  Shield,
  Zap,
  CreditCard,
  Calendar,
  Sparkles,
  LayoutDashboard
} from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";
import { refreshSubscriptionStatus } from "@/lib/subscriptions";

export const dynamic = "force-dynamic";

type SuccessPageProps = {
  searchParams: Promise<{
    subscriptionId?: string;
    targetPlanId?: string;
    targetInterval?: string;
  }>;
};

export default async function SubscriptionSuccessPage({
  searchParams,
}: SuccessPageProps) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    redirect("/sign-in");
  }

  const { subscriptionId, targetPlanId, targetInterval } = await searchParams;

  if (!subscriptionId) {
    redirect("/dashboard");
  }

  let subscription = await prisma.subscription.findUnique({
    where: { id: subscriptionId },
    include: { plan: true }
  });

  if (!subscription || subscription.userId !== session.user.id) {
    redirect("/dashboard");
  }

  // Auto-refresh if pending to provide immediate activation on success page
  if (subscription.status === "pending") {
    const refreshed = await refreshSubscriptionStatus(subscription.id);
    if (refreshed) {
      subscription = refreshed as any;
    }
  }

  // Handle plan revision immediately if target plan info is provided
  // We verify with PayPal to prevent unauthorized upgrades via URL manipulation
  if (targetPlanId && subscription.paypalSubscriptionId) {
    try {
      const paypalSub = await getPayPalSubscription(subscription.paypalSubscriptionId);

      // Check if the plan ID on PayPal matches one of our expected plans
      const confirmedPlan = await prisma.subscriptionPlan.findFirst({
        where: {
          OR: [
            { paypalMonthlyPlanId: paypalSub.plan_id },
            { paypalAnnualPlanId: paypalSub.plan_id }
          ]
        }
      });

      if (confirmedPlan && confirmedPlan.id === targetPlanId && paypalSub.status === "ACTIVE") {
        subscription = await prisma.subscription.update({
          where: { id: subscriptionId },
          data: {
            planId: confirmedPlan.id,
            interval: confirmedPlan.paypalAnnualPlanId === paypalSub.plan_id ? "annual" : "monthly",
            status: "active",
          },
          include: { plan: true }
        });
      }
    } catch (error) {
      console.error("[SUCCESS_PAGE] Failed to verify subscription revision:", error);
      // Fallback to existing subscription data if verification fails
    }
  }

  const isPending = subscription.status === "pending";

  return (
    <div className="max-w-3xl mx-auto py-16 px-4">
      <div className="text-center mb-10">
        <div className="relative inline-flex mb-6">
          <div className="absolute inset-0 animate-ping rounded-full bg-green-400/30" />
          <div className="relative rounded-full bg-gradient-to-br from-green-400 to-emerald-600 p-4 shadow-lg shadow-green-500/25">
            <CheckCircle2 className="h-10 w-10 text-white" />
          </div>
        </div>
        <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-green-600 to-emerald-600 dark:from-green-400 dark:to-emerald-400 bg-clip-text text-transparent">
          Welcome to the {subscription.plan.tier.toUpperCase()} Tier!
        </h1>
        <p className="mt-4 text-lg text-muted-foreground max-w-md mx-auto">
          {isPending
            ? "Your payment was successful! We are currently processing your subscription. It will be active within a few minutes."
            : "Your subscription is now active. You have full access to your new benefits."
          }
        </p>
      </div>

      <Card className="border-2 border-primary/20 shadow-xl overflow-hidden">
        <CardHeader className="bg-muted/30 border-b">
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className="text-xl">Subscription Details</CardTitle>
              <CardDescription>Order confirmation for your records</CardDescription>
            </div>
            <Badge variant={isPending ? "outline" : "default"} className={isPending ? "animate-pulse" : ""}>
              {isPending ? "Processing" : "Active"}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Plan</p>
              <p className="text-lg font-bold">{subscription.plan.name}</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Billing Interval</p>
              <p className="text-lg font-bold capitalize">{subscription.interval}</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Amount Paid</p>
              <p className="text-lg font-bold">
                ${((subscription.interval === "monthly" ? subscription.plan.priceMonthlyCents : subscription.plan.priceAnnualCents) / 100).toFixed(2)}
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Date</p>
              <p className="text-lg font-bold">{format(new Date(), "MMM dd, yyyy")}</p>
            </div>
          </div>

          <div className="pt-6 border-t">
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              Your New Benefits
            </h3>
            <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <li className="flex items-center gap-2 text-sm p-2 rounded-lg bg-primary/5">
                <Zap className="h-4 w-4 text-primary" />
                <span>Unlimited access to {subscription.plan.tier === "starter" ? "Standard" : "All"} courses</span>
              </li>
              {subscription.plan.tier !== "starter" && (
                <li className="flex items-center gap-2 text-sm p-2 rounded-lg bg-primary/5">
                  <Shield className="h-4 w-4 text-primary" />
                  <span>Verified certificates of completion</span>
                </li>
              )}
              {subscription.plan.tier === "founder" && (
                <li className="flex items-center gap-2 text-sm p-2 rounded-lg bg-primary/5">
                  <Rocket className="h-4 w-4 text-primary" />
                  <span>All Learning Paths unlocked</span>
                </li>
              )}
              <li className="flex items-center gap-2 text-sm p-2 rounded-lg bg-primary/5">
                <CreditCard className="h-4 w-4 text-primary" />
                <span>Priority support access</span>
              </li>
            </ul>
          </div>
        </CardContent>
        <CardFooter className="bg-muted/30 border-t p-6 flex flex-col sm:flex-row gap-4">
          <Link href="/dashboard" className="flex-1">
            <Button className="w-full" size="lg">
              <LayoutDashboard className="h-4 w-4 mr-2" />
              Go to Dashboard
            </Button>
          </Link>
          <Link href="/profile/subscription" className="flex-1">
            <Button variant="outline" className="w-full" size="lg">
              Manage Subscription
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </Link>
        </CardFooter>
      </Card>

      <p className="mt-8 text-center text-sm text-muted-foreground">
        A confirmation email has been sent to <strong>{session.user.email}</strong>.<br />
        If you have any questions, please contact our support team.
      </p>
    </div>
  );
}
