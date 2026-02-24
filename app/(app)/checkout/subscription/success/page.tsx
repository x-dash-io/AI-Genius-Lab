import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import Link from "next/link";
import { format } from "date-fns";

import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getPayPalSubscription } from "@/lib/paypal";
import { refreshSubscriptionStatus } from "@/lib/subscriptions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ContentRegion,
  PageContainer,
  PageHeader,
  StatusRegion,
  Toolbar,
} from "@/components/layout/shell";
import {
  ArrowRight,
  CheckCircle2,
  CreditCard,
  LayoutDashboard,
  Rocket,
  Shield,
  Sparkles,
  Zap,
} from "lucide-react";

export const dynamic = "force-dynamic";

function getPlanCourseAccessText(tier: "starter" | "professional" | "founder") {
  if (tier === "starter") return "free starter courses";
  if (tier === "professional") return "professional-tier courses";
  return "founder-tier courses";
}

type SuccessPageProps = {
  searchParams: Promise<{
    subscriptionId?: string;
    targetPlanId?: string;
    targetInterval?: string;
  }>;
};

export default async function SubscriptionSuccessPage({ searchParams }: SuccessPageProps) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    redirect("/sign-in");
  }

  const { subscriptionId, targetPlanId } = await searchParams;

  if (!subscriptionId) {
    redirect("/dashboard");
  }

  let subscription = await prisma.subscription.findUnique({
    where: { id: subscriptionId },
    include: { plan: true },
  });

  if (!subscription || subscription.userId !== session.user.id) {
    redirect("/dashboard");
  }

  if (subscription.status === "pending") {
    const refreshed = await refreshSubscriptionStatus(subscription.id);
    if (refreshed) {
      subscription = refreshed as typeof subscription;
    }
  }

  if (targetPlanId && subscription?.paypalSubscriptionId) {
    try {
      const paypalSub = await getPayPalSubscription(subscription.paypalSubscriptionId);

      const confirmedPlan = await prisma.subscriptionPlan.findFirst({
        where: {
          OR: [
            { paypalMonthlyPlanId: paypalSub.plan_id },
            { paypalAnnualPlanId: paypalSub.plan_id },
          ],
        },
      });

      if (confirmedPlan && confirmedPlan.id === targetPlanId && paypalSub.status === "ACTIVE") {
        subscription = await prisma.subscription.update({
          where: { id: subscriptionId },
          data: {
            planId: confirmedPlan.id,
            interval: confirmedPlan.paypalAnnualPlanId === paypalSub.plan_id ? "annual" : "monthly",
            status: "active",
          },
          include: { plan: true },
        });
      }
    } catch (error) {
      console.error("[SUCCESS_PAGE] Failed to verify subscription revision:", error);
    }
  }

  const isPending = subscription.status === "pending";
  const billedCents = subscription.interval === "monthly"
    ? subscription.plan.priceMonthlyCents
    : subscription.plan.priceAnnualCents;

  return (
    <PageContainer width="narrow" className="space-y-6">
      <PageHeader
        title={isPending ? "Subscription Processing" : "Subscription Activated"}
        description={
          isPending
            ? "Payment was received and activation is in progress."
            : "Your subscription is active and benefits are now available."
        }
        breadcrumbs={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Subscription Success" },
        ]}
        actions={
          <Link href="/dashboard">
            <Button>
              <LayoutDashboard className="mr-2 h-4 w-4" />
              Go to Dashboard
            </Button>
          </Link>
        }
      />

      <Toolbar className="justify-between gap-3">
        <Badge variant={isPending ? "secondary" : "default"}>
          {isPending ? "Processing" : "Active"}
        </Badge>
        <span className="text-xs text-muted-foreground">Confirmation sent to {session.user.email}</span>
      </Toolbar>

      <ContentRegion>
        <Card className="ui-surface">
          <CardHeader>
            <CardTitle className="inline-flex items-center gap-2 text-2xl">
              <CheckCircle2 className="h-6 w-6 text-success" />
              {subscription.plan.name} Plan
            </CardTitle>
            <CardDescription>
              {subscription.interval === "monthly" ? "Monthly" : "Annual"} billing through PayPal.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-6 md:grid-cols-2">
            <section className="space-y-3">
              <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Plan Snapshot</h3>
              <div className="rounded-[var(--radius-md)] border bg-background p-4">
                <div className="flex items-center justify-between gap-3 text-sm">
                  <span className="text-muted-foreground">Amount</span>
                  <span className="font-semibold">${(billedCents / 100).toFixed(2)}</span>
                </div>
                <div className="mt-2 flex items-center justify-between gap-3 text-sm">
                  <span className="text-muted-foreground">Cadence</span>
                  <span className="font-semibold capitalize">{subscription.interval}</span>
                </div>
                <div className="mt-2 flex items-center justify-between gap-3 text-sm">
                  <span className="text-muted-foreground">Date</span>
                  <span className="font-semibold">{format(new Date(subscription.updatedAt), "MMM dd, yyyy")}</span>
                </div>
                <div className="mt-2 flex items-center justify-between gap-3 text-sm">
                  <span className="text-muted-foreground">Payment</span>
                  <span className="inline-flex items-center gap-1.5 font-semibold">
                    <CreditCard className="h-4 w-4" />
                    PayPal
                  </span>
                </div>
              </div>
            </section>

            <section className="space-y-3">
              <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Your Benefits</h3>
              <ul className="grid gap-2 text-sm">
                <li className="rounded-[var(--radius-sm)] border bg-background px-3 py-2 inline-flex items-center gap-2">
                  <Zap className="h-4 w-4 text-primary" />
                  Access to {getPlanCourseAccessText(subscription.plan.tier)}
                </li>
                {subscription.plan.tier !== "starter" ? (
                  <li className="rounded-[var(--radius-sm)] border bg-background px-3 py-2 inline-flex items-center gap-2">
                    <Shield className="h-4 w-4 text-success" />
                    Verified certificates included
                  </li>
                ) : null}
                {subscription.plan.tier === "founder" ? (
                  <li className="rounded-[var(--radius-sm)] border bg-background px-3 py-2 inline-flex items-center gap-2">
                    <Rocket className="h-4 w-4 text-primary" />
                    Learning paths unlocked
                  </li>
                ) : null}
                <li className="rounded-[var(--radius-sm)] border bg-background px-3 py-2 inline-flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-primary" />
                  Priority support channel
                </li>
              </ul>
            </section>
          </CardContent>
        </Card>
      </ContentRegion>

      <StatusRegion>
        <Card className="ui-surface">
          <CardContent className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-muted-foreground">
              If activation is still pending after a few minutes, refresh your subscription page.
            </p>
            <div className="flex flex-wrap items-center gap-2">
              <Link href="/profile/subscription">
                <Button variant="outline" size="sm">
                  Manage Subscription
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Link href="/dashboard">
                <Button size="sm">Open Dashboard</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </StatusRegion>
    </PageContainer>
  );
}
