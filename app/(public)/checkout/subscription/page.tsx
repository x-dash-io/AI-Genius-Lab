import Link from "next/link";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createPayPalSubscription, revisePayPalSubscription } from "@/lib/paypal";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Check, AlertCircle, Clock3, Crown, Lock, ShieldCheck, Zap } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { CheckoutIntervalToggle } from "@/components/subscriptions/CheckoutIntervalToggle";
import {
  ContentRegion,
  PageContainer,
  PageHeader,
  StatusRegion,
  Toolbar,
} from "@/components/layout/shell";

export const dynamic = "force-dynamic";

type Props = {
  searchParams: Promise<{ planId?: string; interval?: string }>;
};

async function createSubscriptionAction(formData: FormData) {
  "use server";

  const session = await getServerSession(authOptions);
  if (!session?.user) {
    redirect("/sign-in");
  }

  const planId = formData.get("planId") as string;
  const interval = formData.get("interval") as "monthly" | "annual";

  const plan = await prisma.subscriptionPlan.findUnique({ where: { id: planId } });
  if (!plan) {
    throw new Error("Plan not found");
  }

  const paypalPlanId = interval === "annual" ? plan.paypalAnnualPlanId : plan.paypalMonthlyPlanId;
  if (!paypalPlanId) {
    throw new Error("Plan not synced with PayPal");
  }

  const existingSub = await prisma.subscription.findFirst({
    where: {
      userId: session.user.id,
      status: { in: ["active", "past_due"] },
      currentPeriodEnd: { gt: new Date() },
    },
  });

  const appUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";
  let approvalUrl: string | undefined;
  let shouldCreateNew = true;

  if (existingSub && existingSub.paypalSubscriptionId) {
    try {
      const result = await revisePayPalSubscription({
        subscriptionId: existingSub.paypalSubscriptionId,
        planId: paypalPlanId,
        returnUrl: `${appUrl}/profile/subscription?planChanged=true`,
        cancelUrl: `${appUrl}/profile/subscription`,
      });

      approvalUrl = result.approvalUrl;
      shouldCreateNew = false;
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      console.warn(
        "Failed to revise PayPal subscription. Falling back to new subscription creation.",
        errorMessage
      );

      await prisma.subscription.update({
        where: { id: existingSub.id },
        data: { status: "cancelled" },
      });
    }
  }

  if (shouldCreateNew) {
    const subscription = await prisma.subscription.create({
      data: {
        userId: session.user.id,
        planId: plan.id,
        interval: interval === "monthly" ? "monthly" : "annual",
        status: "pending",
        currentPeriodEnd: new Date(),
      },
    });

    try {
      const result = await createPayPalSubscription({
        planId: paypalPlanId,
        customId: subscription.id,
        returnUrl: `${appUrl}/checkout/subscription/success?subscriptionId=${subscription.id}`,
        cancelUrl: `${appUrl}/pricing?subscription=cancelled`,
      });
      approvalUrl = result.approvalUrl;

      await prisma.subscription.update({
        where: { id: subscription.id },
        data: { paypalSubscriptionId: result.subscriptionId },
      });
    } catch (error) {
      console.error("Failed to create PayPal subscription:", error);
      await prisma.subscription.delete({ where: { id: subscription.id } });
      throw error;
    }
  }

  if (approvalUrl) {
    redirect(approvalUrl);
  }

  throw new Error("Failed to generate PayPal approval URL");
}

function formatCurrency(cents: number) {
  return `$${(cents / 100).toFixed(2)}`;
}

export default async function SubscriptionCheckoutPage({ searchParams }: Props) {
  const session = await getServerSession(authOptions);
  const { planId, interval = "monthly" } = await searchParams;

  if (!planId) {
    redirect("/pricing");
  }

  const plan = await prisma.subscriptionPlan.findUnique({ where: { id: planId } });
  if (!plan) {
    redirect("/pricing");
  }

  const billingInterval = interval === "annual" ? "annual" : "monthly";

  if (!session?.user) {
    redirect(`/sign-in?callbackUrl=/checkout/subscription?planId=${planId}&interval=${billingInterval}`);
  }

  const existingSub = await prisma.subscription.findFirst({
    where: {
      userId: session.user.id,
      status: { in: ["active", "past_due"] },
      currentPeriodEnd: { gt: new Date() },
    },
    include: { plan: true },
  });

  const isSwitching = Boolean(existingSub);
  const priceCents =
    billingInterval === "annual" ? plan.priceAnnualCents : plan.priceMonthlyCents;
  const annualSavingsCents = Math.max(0, plan.priceMonthlyCents * 12 - plan.priceAnnualCents);
  const paypalPlanId =
    billingInterval === "annual" ? plan.paypalAnnualPlanId : plan.paypalMonthlyPlanId;
  const isSynced = Boolean(paypalPlanId);

  const nextBillingDate =
    existingSub?.currentPeriodEnd.toLocaleDateString() ||
    (billingInterval === "annual" ? "In 1 year" : "In 1 month");

  const featureRows = [
    {
      title: "Unlimited course access",
      detail: `Includes ${plan.tier === "starter" ? "standard" : "standard + premium"} courses`,
      enabled: true,
    },
    {
      title: "Course certificates",
      detail: "Verified completion certificates",
      enabled: plan.tier !== "starter",
    },
    {
      title: "Learning path support",
      detail: "Structured progression across multi-course paths",
      enabled: plan.tier === "founder",
    },
    {
      title: "Priority support",
      detail: "Faster response for billing and access requests",
      enabled: plan.tier !== "starter",
    },
  ];

  return (
    <PageContainer width="wide" className="space-y-6 lg:space-y-8">
      <PageHeader
        title={isSwitching ? "Switch Subscription Plan" : "Confirm Subscription"}
        description={
          isSwitching
            ? `Move from ${existingSub?.plan.name || "your current plan"} to ${plan.name}.`
            : "Review cadence and plan details, then continue securely with PayPal."
        }
        breadcrumbs={[
          { label: "Home", href: "/" },
          { label: "Pricing", href: "/pricing" },
          { label: "Subscription checkout" },
        ]}
        actions={
          <Link href="/pricing">
            <Button variant="outline" className="h-11">
              Back to pricing
            </Button>
          </Link>
        }
      />

      <Toolbar className="justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="secondary">Step 1: Plan</Badge>
          <Badge variant="outline">Step 2: PayPal approval</Badge>
        </div>
        <p className="text-sm text-muted-foreground">
          {billingInterval === "annual" ? "Yearly cadence" : "Monthly cadence"} selected
        </p>
      </Toolbar>

      <StatusRegion>
        {!isSynced ? (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Plan not synced with PayPal</AlertTitle>
            <AlertDescription>
              This plan is not currently available for checkout. Please contact support or choose another plan.
            </AlertDescription>
          </Alert>
        ) : null}

        {isSwitching ? (
          <Alert>
            <Zap className="h-4 w-4" />
            <AlertTitle>Active subscription detected</AlertTitle>
            <AlertDescription>
              Your current active subscription will be replaced with this selection after PayPal approval.
            </AlertDescription>
          </Alert>
        ) : null}
      </StatusRegion>

      <ContentRegion className="gap-6 lg:grid-cols-[minmax(0,1.35fr)_minmax(0,0.8fr)]">
        <div className="grid gap-6">
          <Card className="ui-surface">
            <CardHeader>
              <CardTitle>Billing cadence</CardTitle>
              <CardDescription>
                Choose monthly or yearly billing before continuing.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <CheckoutIntervalToggle />
            </CardContent>
          </Card>

          <Card className="ui-surface">
            <CardHeader>
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <span className="inline-flex h-11 w-11 items-center justify-center rounded-[var(--radius-sm)] border bg-background">
                    <Crown className="h-5 w-5 text-primary" />
                  </span>
                  <div>
                    <CardTitle className="text-2xl">{plan.name}</CardTitle>
                    <CardDescription className="mt-1">
                      {plan.description || "Subscription access with structured learning progression."}
                    </CardDescription>
                  </div>
                </div>

                <Badge variant="outline" className="capitalize">
                  {plan.tier}
                </Badge>
              </div>
            </CardHeader>

            <CardContent className="grid gap-5">
              <div className="rounded-[var(--radius-md)] border bg-background p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  {billingInterval === "annual" ? "Yearly billing" : "Monthly billing"}
                </p>
                <div className="mt-1 flex items-end gap-2">
                  <span className="text-4xl font-semibold tracking-tight">{formatCurrency(priceCents)}</span>
                  <span className="pb-1 text-sm text-muted-foreground">
                    /{billingInterval === "annual" ? "year" : "month"}
                  </span>
                </div>
                {billingInterval === "annual" && annualSavingsCents > 0 ? (
                  <p className="mt-2 text-sm text-success">
                    Save {formatCurrency(annualSavingsCents)} per year compared to monthly billing.
                  </p>
                ) : null}
              </div>

              <div className="grid gap-2">
                {featureRows.map((feature) => (
                  <div
                    key={`${plan.id}-${feature.title}`}
                    className="flex items-start gap-3 rounded-[var(--radius-sm)] border bg-background p-3"
                  >
                    <span className="mt-0.5 inline-flex h-5 w-5 items-center justify-center rounded-full border">
                      <Check className={`h-3.5 w-3.5 ${feature.enabled ? "text-success" : "text-muted-foreground"}`} />
                    </span>
                    <span>
                      <p className="text-sm font-semibold">{feature.title}</p>
                      <p className="text-xs text-muted-foreground">{feature.detail}</p>
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 lg:sticky lg:top-6 lg:self-start">
          <Card className="ui-surface">
            <CardHeader>
              <CardTitle>Order summary</CardTitle>
              <CardDescription>Review before proceeding to PayPal.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Plan</span>
                <span className="font-semibold">{plan.name}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Cadence</span>
                <span className="font-semibold capitalize">{billingInterval}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Total</span>
                <span className="text-xl font-semibold">{formatCurrency(priceCents)}</span>
              </div>
              <div className="rounded-[var(--radius-sm)] border bg-background px-3 py-2 text-xs text-muted-foreground">
                Next billing date: <span className="font-medium text-foreground">{nextBillingDate}</span>
              </div>
            </CardContent>
          </Card>

          <Card className="ui-surface">
            <CardContent className="grid gap-4 pt-6">
              <form action={createSubscriptionAction} className="grid gap-3" data-testid="subscription-form">
                <input type="hidden" name="planId" value={plan.id} />
                <input type="hidden" name="interval" value={billingInterval} />

                <Button
                  type="submit"
                  className="h-11 w-full"
                  variant="premium"
                  disabled={!isSynced}
                  data-testid="subscribe-button"
                >
                  {isSwitching ? "Confirm switch with PayPal" : "Subscribe with PayPal"}
                </Button>
              </form>

              <p className="text-center text-xs text-muted-foreground">
                Secure payment powered by PayPal.
              </p>

              <div className="grid gap-2 rounded-[var(--radius-sm)] border bg-background p-3 text-xs">
                <p className="inline-flex items-center gap-2 text-muted-foreground">
                  <ShieldCheck className="h-3.5 w-3.5 text-primary" />
                  No hidden fees
                </p>
                <p className="inline-flex items-center gap-2 text-muted-foreground">
                  <Lock className="h-3.5 w-3.5 text-primary" />
                  Cancel any time from profile
                </p>
                <p className="inline-flex items-center gap-2 text-muted-foreground">
                  <Clock3 className="h-3.5 w-3.5 text-primary" />
                  Instant entitlement update
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </ContentRegion>

      <StatusRegion>
        <Alert>
          <AlertTitle>Billing terms</AlertTitle>
          <AlertDescription>
            By subscribing, you agree to our <Link href="/terms" className="underline">Terms of Service</Link> and{" "}
            <Link href="/privacy" className="underline">Privacy Policy</Link>. Renewal follows your selected cadence until cancelled.
          </AlertDescription>
        </Alert>
      </StatusRegion>
    </PageContainer>
  );
}
