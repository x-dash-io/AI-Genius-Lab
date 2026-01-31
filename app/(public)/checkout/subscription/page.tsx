import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createPayPalSubscription, revisePayPalSubscription } from "@/lib/paypal";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Check, AlertCircle, TrendingDown, Shield, Lock, Zap, Sparkles, Crown } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { CheckoutIntervalToggle } from "@/components/subscriptions/CheckoutIntervalToggle";

export const dynamic = "force-dynamic";

type Props = {
  searchParams: Promise<{ planId?: string; interval?: string }>;
};

async function createSubscriptionAction(formData: FormData) {
  "use server";
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/sign-in");

  const planId = formData.get("planId") as string;
  const interval = formData.get("interval") as "monthly" | "annual";

  const plan = await prisma.subscriptionPlan.findUnique({ where: { id: planId } });
  if (!plan) throw new Error("Plan not found");

  const paypalPlanId = interval === "annual" ? plan.paypalAnnualPlanId : plan.paypalMonthlyPlanId;
  if (!paypalPlanId) throw new Error("Plan not synced with PayPal");

  const existingSub = await prisma.subscription.findFirst({
    where: {
      userId: session.user.id,
      status: { in: ["active", "past_due"] },
      currentPeriodEnd: { gt: new Date() }
    }
  });

  const appUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";
  let approvalUrl: string | undefined;
  let shouldCreateNew = true; 

  if (existingSub && existingSub.paypalSubscriptionId) {
    try {
      console.log(`Attempting to revise subscription: ${existingSub.paypalSubscriptionId}`);
      
      const result = await revisePayPalSubscription({
        subscriptionId: existingSub.paypalSubscriptionId,
        planId: paypalPlanId,
        returnUrl: `${appUrl}/profile/subscription?planChanged=true`,
        cancelUrl: `${appUrl}/profile/subscription`,
      });
      
      approvalUrl = result.approvalUrl;
      shouldCreateNew = false;

    } catch (error: any) {
      console.warn("Failed to revise PayPal subscription. Falling back to new subscription creation.", error?.message);
      
      await prisma.subscription.update({
        where: { id: existingSub.id },
        data: { status: 'cancelled' } 
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
  } else {
    throw new Error("Failed to generate PayPal approval URL");
  }
}

export default async function SubscriptionCheckoutPage({ searchParams }: Props) {
  const session = await getServerSession(authOptions);
  const { planId, interval = "monthly" } = await searchParams;

  if (!planId) redirect("/pricing");

  const plan = await prisma.subscriptionPlan.findUnique({ where: { id: planId } });
  if (!plan) redirect("/pricing");

  if (!session?.user) {
    redirect(`/sign-in?callbackUrl=/checkout/subscription?planId=${planId}&interval=${interval}`);
  }

  const existingSub = await prisma.subscription.findFirst({
    where: {
      userId: session.user.id,
      status: { in: ["active", "past_due"] },
      currentPeriodEnd: { gt: new Date() }
    },
    include: { plan: true }
  });

  const isSwitching = !!existingSub;

  const price = interval === "annual" ? plan.priceAnnualCents : plan.priceMonthlyCents;
  const paypalPlanId = interval === "annual" ? plan.paypalAnnualPlanId : plan.paypalMonthlyPlanId;
  const isSynced = !!paypalPlanId;

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-5xl mx-auto py-12 px-4 sm:py-16 sm:px-6 lg:px-8">
        {/* Progress indicator */}
        <div className="mb-10 flex items-center justify-center gap-3" data-testid="checkout-progress">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-primary-foreground font-bold text-sm">
              1
            </div>
            <span className="text-xs font-medium text-muted-foreground hidden sm:inline">Select Plan</span>
          </div>
          <div className="h-px w-16 bg-border" />
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-secondary border border-border text-muted-foreground font-bold text-sm">
              2
            </div>
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider hidden sm:inline">Confirmation</span>
          </div>
        </div>

        {!isSynced && (
          <Alert variant="destructive" className="mb-8" data-testid="plan-not-synced-alert">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Plan Not Ready</AlertTitle>
            <AlertDescription>
              This subscription plan has not been synced with PayPal yet.
              If you are the administrator, please go to the admin dashboard and click "Sync to PayPal".
            </AlertDescription>
          </Alert>
        )}

        {/* Header */}
        <div className="mb-12 text-center" data-testid="checkout-header">
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-foreground mb-4">
            {isSwitching ? "Switch Your Plan" : "Confirm Your Subscription"}
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            {isSwitching
              ? `Upgrading from ${existingSub.plan.name} to ${plan.name}. Changes apply immediately.`
              : "Review your selection and complete your payment securely."}
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-5">
          {/* Order Summary - Left Column */}
          <div className="lg:col-span-3 space-y-6">
            {/* Interval Toggle */}
            <Card data-testid="interval-toggle-card">
              <CardContent className="pt-6">
                <CheckoutIntervalToggle />
              </CardContent>
            </Card>

            {/* Plan Details Card */}
            <Card className="border-2 border-primary/20" data-testid="plan-details-card">
              {/* Plan Header */}
              <CardHeader className="pb-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 border border-primary/20">
                      <Crown className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <CardTitle className="text-2xl">{plan.name}</CardTitle>
                      <CardDescription className="mt-1">{plan.description}</CardDescription>
                    </div>
                  </div>
                  {isSwitching && (
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-500/10 border border-blue-500/30 px-3 py-1.5 text-xs font-semibold text-blue-400">
                      <Zap className="h-3 w-3" />
                      Upgrade
                    </span>
                  )}
                </div>
              </CardHeader>

              <CardContent className="space-y-6">
                {/* Price Section */}
                <div className="rounded-lg bg-muted/30 p-6">
                  <div className="mb-2 text-sm font-medium text-muted-foreground uppercase tracking-wider">Price</div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-5xl font-bold text-foreground">${(price / 100).toFixed(2)}</span>
                    <span className="text-muted-foreground text-lg">/{interval === "annual" ? "year" : "month"}</span>
                  </div>
                  {interval === "annual" && (
                    <p className="mt-3 text-sm text-green-500 font-medium flex items-center gap-2">
                      <TrendingDown className="h-4 w-4" />
                      Save ${((plan.priceMonthlyCents * 12 - price) / 100).toFixed(2)}/year compared to monthly
                    </p>
                  )}
                </div>

                {/* What's Included */}
                <div>
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-5">What's Included</h3>
                  <ul className="space-y-4">
                    <li className="flex items-start gap-4">
                      <div className="flex h-6 w-6 items-center justify-center rounded-full bg-green-500/10 border border-green-500/30 mt-0.5">
                        <Check className="h-3.5 w-3.5 text-green-500" />
                      </div>
                      <div>
                        <p className="font-medium text-foreground">Unlimited Courses</p>
                        <p className="text-sm text-muted-foreground">Access to {plan.tier === "starter" ? "standard" : "all"} curated courses</p>
                      </div>
                    </li>
                    {plan.tier !== "starter" && (
                      <li className="flex items-start gap-4">
                        <div className="flex h-6 w-6 items-center justify-center rounded-full bg-green-500/10 border border-green-500/30 mt-0.5">
                          <Check className="h-3.5 w-3.5 text-green-500" />
                        </div>
                        <div>
                          <p className="font-medium text-foreground">Certificates</p>
                          <p className="text-sm text-muted-foreground">Verified certificates of completion</p>
                        </div>
                      </li>
                    )}
                    {plan.tier === "elite" && (
                      <li className="flex items-start gap-4">
                        <div className="flex h-6 w-6 items-center justify-center rounded-full bg-green-500/10 border border-green-500/30 mt-0.5">
                          <Check className="h-3.5 w-3.5 text-green-500" />
                        </div>
                        <div>
                          <p className="font-medium text-foreground">Learning Paths</p>
                          <p className="text-sm text-muted-foreground">Structured learning journeys</p>
                        </div>
                      </li>
                    )}
                    {plan.tier !== "starter" && (
                      <li className="flex items-start gap-4">
                        <div className="flex h-6 w-6 items-center justify-center rounded-full bg-green-500/10 border border-green-500/30 mt-0.5">
                          <Check className="h-3.5 w-3.5 text-green-500" />
                        </div>
                        <div>
                          <p className="font-medium text-foreground">Priority Support</p>
                          <p className="text-sm text-muted-foreground">Dedicated support team</p>
                        </div>
                      </li>
                    )}
                  </ul>
                </div>

                {isSwitching && existingSub && (
                  <div className="rounded-lg border border-blue-500/20 bg-blue-500/5 p-4">
                    <p className="text-sm font-medium text-blue-400 flex items-center gap-2">
                      <Zap className="h-4 w-4" />
                      Your current plan ({existingSub.plan.name}) will be replaced. No refunds are issued.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar - Order Summary */}
          <div className="lg:col-span-2 lg:sticky lg:top-6 h-fit space-y-5">
            <Card className="border-2 border-border bg-card" data-testid="order-summary-card">
              <CardHeader>
                <CardTitle className="text-lg">Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3 border-b border-border pb-4">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">{plan.name}</span>
                    <span className="font-semibold text-foreground">${(price / 100).toFixed(2)}</span>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {interval === "annual" ? "Annual" : "Monthly"} billing
                  </div>
                </div>
                <div className="flex justify-between items-center pt-1">
                  <span className="text-lg font-semibold text-foreground">Total</span>
                  <span className="text-2xl font-bold text-foreground">${(price / 100).toFixed(2)}</span>
                </div>
                <div className="text-xs text-muted-foreground bg-muted/50 p-3 rounded-lg">
                  Your next billing date: <span className="text-foreground font-medium">{new Date(Date.now() + (interval === "annual" ? 365 : 30) * 24 * 60 * 60 * 1000).toLocaleDateString()}</span>
                </div>
              </CardContent>
            </Card>

            {/* Payment Button */}
            <form action={createSubscriptionAction} className="space-y-4" data-testid="subscription-form">
              <input type="hidden" name="planId" value={plan.id} />
              <input type="hidden" name="interval" value={interval} />
              <Button 
                type="submit" 
                className="w-full h-12 text-base font-semibold" 
                size="lg" 
                disabled={!isSynced}
                data-testid="subscribe-button"
              >
                {isSwitching ? "Confirm & Pay via PayPal" : "Subscribe via PayPal"}
              </Button>
              <p className="text-xs text-center text-muted-foreground">
                Secure payment powered by PayPal
              </p>
            </form>

            {/* Trust Badges */}
            <div className="rounded-lg bg-muted/30 border border-border p-5 space-y-3" data-testid="trust-badges">
              <div className="flex items-center gap-3 text-sm">
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-green-500/10 border border-green-500/20">
                  <Check className="h-3.5 w-3.5 text-green-500" />
                </div>
                <span className="text-foreground">Cancel anytime</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-green-500/10 border border-green-500/20">
                  <Shield className="h-3.5 w-3.5 text-green-500" />
                </div>
                <span className="text-foreground">No hidden fees</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-green-500/10 border border-green-500/20">
                  <Lock className="h-3.5 w-3.5 text-green-500" />
                </div>
                <span className="text-foreground">Instant access</span>
              </div>
            </div>

            {/* Terms */}
            <p className="text-xs text-muted-foreground text-center px-4">
              By clicking "Subscribe", you agree to our{" "}
              <a href="/terms" className="text-foreground underline hover:text-primary transition-colors">Terms of Service</a>
              {" "}and{" "}
              <a href="/privacy" className="text-foreground underline hover:text-primary transition-colors">Privacy Policy</a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}