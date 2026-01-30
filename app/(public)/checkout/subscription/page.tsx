import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createPayPalSubscription, revisePayPalSubscription } from "@/lib/paypal";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Check, AlertCircle, TrendingDown, Shield, Lock, Zap } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { CheckoutIntervalToggle } from "@/components/subscriptions/CheckoutIntervalToggle";

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

  // Check for existing active subscription locally
  const existingSub = await prisma.subscription.findFirst({
    where: {
      userId: session.user.id,
      status: { in: ["active", "past_due"] },
      currentPeriodEnd: { gt: new Date() }
    }
  });

  const appUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";
  let approvalUrl: string | undefined;
  
  // Flag: Default to creating a new subscription unless revision succeeds
  let shouldCreateNew = true; 

  // --- ATTEMPT 1: REVISE EXISTING SUBSCRIPTION ---
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
      shouldCreateNew = false; // Success! No need to create a new one.

    } catch (error: any) {
      // If revision fails (e.g. status invalid/cancelled), log it and fall through to Create New
      console.warn("Failed to revise PayPal subscription. Falling back to new subscription creation.", error?.message);
      
      // Optional: Update local DB to mark old sub as cancelled so we don't try this again
      await prisma.subscription.update({
        where: { id: existingSub.id },
        data: { status: 'cancelled' } 
      });
      
      // We leave shouldCreateNew = true to proceed to step 2
    }
  }

  // --- ATTEMPT 2: CREATE NEW SUBSCRIPTION (Fallback) ---
  if (shouldCreateNew) {
    // 1. Create pending record in DB
    const subscription = await prisma.subscription.create({
      data: {
        userId: session.user.id,
        planId: plan.id,
        interval: interval === "monthly" ? "monthly" : "annual",
        status: "pending",
        currentPeriodEnd: new Date(), // Initial value
      },
    });

    try {
      // 2. Call PayPal to create new sub
      const result = await createPayPalSubscription({
        planId: paypalPlanId,
        customId: subscription.id,
        returnUrl: `${appUrl}/checkout/subscription/success?subscriptionId=${subscription.id}`,
        cancelUrl: `${appUrl}/pricing?subscription=cancelled`,
      });
      approvalUrl = result.approvalUrl;

      // 3. Update DB with PayPal ID
      await prisma.subscription.update({
        where: { id: subscription.id },
        data: { paypalSubscriptionId: result.subscriptionId },
      });
    } catch (error) {
      console.error("Failed to create PayPal subscription:", error);
      // Clean up the pending subscription if PayPal fails
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

  // Check if user already has an active subscription
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
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <div className="max-w-4xl mx-auto py-12 px-4 sm:py-16 sm:px-6 lg:px-8">
        {/* Progress indicator */}
        <div className="mb-8 flex items-center justify-center gap-2 text-sm">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground font-semibold">1</div>
          <div className="h-1 w-12 bg-primary" />
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/20 text-muted-foreground font-semibold">2</div>
          <span className="ml-4 text-xs font-medium text-muted-foreground uppercase tracking-wider">Confirmation</span>
        </div>

        {!isSynced && (
          <Alert variant="destructive" className="mb-8">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Plan Not Ready</AlertTitle>
            <AlertDescription>
              This subscription plan has not been synced with PayPal yet.
              If you are the administrator, please go to the admin dashboard and click "Sync to PayPal".
            </AlertDescription>
          </Alert>
        )}

        {/* Header */}
        <div className="mb-12 text-center">
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
            {isSwitching ? "Switch Your Plan" : "Confirm Your Subscription"}
          </h1>
          <p className="mt-4 text-lg text-muted-foreground">
            {isSwitching
              ? `Upgrading from ${existingSub.plan.name} to ${plan.name}. Changes apply immediately.`
              : "Review your selection and complete your payment securely."}
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-3">
          {/* Order Summary */}
          <div className="lg:col-span-2 space-y-6">
            {/* Interval Toggle */}
            <Card>
              <CardContent className="pt-6">
                <CheckoutIntervalToggle />
              </CardContent>
            </Card>

            {/* Plan Details Card */}
            <Card className="border-2 border-primary/20">
              <CardHeader className="pb-4">
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-3xl">{plan.name}</CardTitle>
                    <CardDescription className="mt-2 text-base">{plan.description}</CardDescription>
                  </div>
                  {isSwitching && (
                    <span className="inline-flex items-center rounded-full bg-blue-100 dark:bg-blue-900/30 px-3 py-1 text-xs font-semibold text-blue-800 dark:text-blue-300">
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
                    <span className="text-5xl font-bold">${(price / 100).toFixed(2)}</span>
                    <span className="text-muted-foreground">/{interval === "annual" ? "year" : "month"}</span>
                  </div>
                  {interval === "annual" && (
                    <p className="mt-3 text-sm text-green-600 dark:text-green-400 font-medium flex items-center gap-2">
                      <TrendingDown className="h-4 w-4" />
                      Save ${(price / 100 * 0.2).toFixed(2)}/year vs. monthly
                    </p>
                  )}
                </div>

                {/* What's Included */}
                <div>
                  <h3 className="mb-4 font-semibold text-sm uppercase tracking-wider text-foreground">What's Included</h3>
                  <ul className="space-y-3">
                    <li className="flex items-start gap-3">
                      <Check className="h-5 w-5 text-green-500 mt-0.5 shrink-0" />
                      <div>
                        <p className="font-medium text-sm">Unlimited Courses</p>
                        <p className="text-xs text-muted-foreground">Access to {plan.tier === "starter" ? "standard" : "all"} curated courses</p>
                      </div>
                    </li>
                    {plan.tier !== "starter" && (
                      <li className="flex items-start gap-3">
                        <Check className="h-5 w-5 text-green-500 mt-0.5 shrink-0" />
                        <div>
                          <p className="font-medium text-sm">Certificates</p>
                          <p className="text-xs text-muted-foreground">Verified certificates of completion</p>
                        </div>
                      </li>
                    )}
                    {plan.tier === "elite" && (
                      <li className="flex items-start gap-3">
                        <Check className="h-5 w-5 text-green-500 mt-0.5 shrink-0" />
                        <div>
                          <p className="font-medium text-sm">Learning Paths</p>
                          <p className="text-xs text-muted-foreground">Structured learning journeys</p>
                        </div>
                      </li>
                    )}
                    {plan.tier !== "starter" && (
                      <li className="flex items-start gap-3">
                        <Check className="h-5 w-5 text-green-500 mt-0.5 shrink-0" />
                        <div>
                          <p className="font-medium text-sm">Priority Support</p>
                          <p className="text-xs text-muted-foreground">Dedicated support team</p>
                        </div>
                      </li>
                    )}
                  </ul>
                </div>

                {isSwitching && existingSub && (
                  <div className="rounded-lg border border-blue-200 bg-blue-50 dark:border-blue-900/30 dark:bg-blue-900/10 p-4">
                    <p className="text-sm font-medium text-blue-600 dark:text-blue-400 flex items-center gap-2">
                      <Zap className="h-4 w-4" />
                      Your current plan ({existingSub.plan.name}) will be replaced. No refunds are issued.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar - Order Summary */}
          <div className="sticky top-4 h-fit space-y-4">
            <Card className="border-2 border-border bg-muted/30">
              <CardHeader>
                <CardTitle className="text-lg">Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2 border-b pb-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">{plan.name}</span>
                    <span className="font-medium">${(price / 100).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>{interval === "annual" ? "Annual" : "Monthly"} billing</span>
                  </div>
                </div>
                <div className="flex justify-between font-semibold text-base">
                  <span>Total</span>
                  <span>${(price / 100).toFixed(2)}</span>
                </div>
                <p className="text-xs text-muted-foreground bg-muted/50 p-2 rounded">
                  Your next billing date: <span className="font-medium">{new Date(Date.now() + (interval === "annual" ? 365 : 30) * 24 * 60 * 60 * 1000).toLocaleDateString()}</span>
                </p>
              </CardContent>
            </Card>

            {/* Payment Button */}
            <form action={createSubscriptionAction} className="space-y-3">
              <input type="hidden" name="planId" value={plan.id} />
              <input type="hidden" name="interval" value={interval} />
              <Button type="submit" className="w-full h-12 text-base" size="lg" disabled={!isSynced}>
                {isSwitching ? "Confirm & Pay via PayPal" : "Subscribe via PayPal"}
              </Button>
              <p className="text-xs text-center text-muted-foreground">
                Secure payment powered by PayPal
              </p>
            </form>

            {/* Terms */}
            <div className="space-y-2 text-xs text-muted-foreground">
              <p className="flex items-center gap-2"><Check className="h-3 w-3 text-green-500" /> Cancel anytime</p>
              <p className="flex items-center gap-2"><Shield className="h-3 w-3 text-green-500" /> No hidden fees</p>
              <p className="flex items-center gap-2"><Lock className="h-3 w-3 text-green-500" /> Instant access</p>
              <p className="!mt-4 text-xs text-muted-foreground/70">
                By clicking "Subscribe", you agree to our <a href="/terms" className="underline hover:text-foreground">Terms of Service</a> and <a href="/privacy" className="underline hover:text-foreground">Privacy Policy</a>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}