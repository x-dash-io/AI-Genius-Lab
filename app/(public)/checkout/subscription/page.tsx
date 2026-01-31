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
    <div className="min-h-screen bg-[#0a0f1a] relative overflow-hidden">
      {/* Ambient background effects */}
      <div className="absolute inset-0 bg-gradient-to-br from-emerald-950/20 via-transparent to-blue-950/20" />
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-[128px]" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-[128px]" />
      
      <div className="relative max-w-5xl mx-auto py-12 px-4 sm:py-16 sm:px-6 lg:px-8">
        {/* Progress indicator */}
        <div className="mb-10 flex items-center justify-center gap-3" data-testid="checkout-progress">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 text-white font-bold text-sm shadow-[0_0_20px_rgba(16,185,129,0.5)]">
              1
            </div>
            <span className="text-xs font-medium text-zinc-400 hidden sm:inline">Select Plan</span>
          </div>
          <div className="h-px w-16 bg-gradient-to-r from-emerald-500/50 to-zinc-700" />
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-zinc-800 border border-zinc-700 text-zinc-400 font-bold text-sm">
              2
            </div>
            <span className="text-xs font-medium text-zinc-500 uppercase tracking-wider hidden sm:inline">Confirmation</span>
          </div>
        </div>

        {!isSynced && (
          <Alert variant="destructive" className="mb-8 bg-red-950/50 border-red-800/50" data-testid="plan-not-synced-alert">
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
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold mb-6">
            <Sparkles className="h-3.5 w-3.5" />
            {isSwitching ? "Plan Upgrade" : "Premium Access"}
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-white mb-4">
            {isSwitching ? "Upgrade Your Plan" : "Confirm Your Subscription"}
          </h1>
          <p className="text-lg text-zinc-400 max-w-2xl mx-auto">
            {isSwitching
              ? `Upgrading from ${existingSub.plan.name} to ${plan.name}. Changes apply immediately.`
              : "Review your selection and complete your payment securely."}
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-5">
          {/* Order Summary - Left Column */}
          <div className="lg:col-span-3 space-y-6">
            {/* Interval Toggle */}
            <div className="rounded-2xl bg-zinc-900/50 border border-zinc-800/50 p-6 backdrop-blur-sm" data-testid="interval-toggle-card">
              <CheckoutIntervalToggle />
            </div>

            {/* Plan Details Card */}
            <div className="rounded-2xl bg-gradient-to-b from-zinc-900/80 to-zinc-900/40 border border-zinc-800/50 backdrop-blur-sm overflow-hidden" data-testid="plan-details-card">
              {/* Plan Header */}
              <div className="px-8 pt-8 pb-6 border-b border-zinc-800/50">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-4">
                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500/20 to-emerald-600/20 border border-emerald-500/30">
                      <Crown className="h-7 w-7 text-emerald-400" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-white">{plan.name}</h2>
                      <p className="text-zinc-400 mt-1">{plan.description}</p>
                    </div>
                  </div>
                  {isSwitching && (
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-500/10 border border-blue-500/30 px-3 py-1.5 text-xs font-semibold text-blue-400">
                      <Zap className="h-3 w-3" />
                      Upgrade
                    </span>
                  )}
                </div>
              </div>

              {/* Price Section */}
              <div className="px-8 py-6 bg-zinc-950/30">
                <div className="flex items-baseline gap-2">
                  <span className="text-5xl font-bold text-white">${(price / 100).toFixed(2)}</span>
                  <span className="text-zinc-500 text-lg">/{interval === "annual" ? "year" : "month"}</span>
                </div>
                {interval === "annual" && (
                  <p className="mt-3 text-sm text-emerald-400 font-medium flex items-center gap-2">
                    <TrendingDown className="h-4 w-4" />
                    Save ${((plan.priceMonthlyCents * 12 - price) / 100).toFixed(2)}/year compared to monthly
                  </p>
                )}
              </div>

              {/* What's Included */}
              <div className="px-8 py-6">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-500 mb-5">What's Included</h3>
                <ul className="space-y-4">
                  <li className="flex items-start gap-4">
                    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500/10 border border-emerald-500/30 mt-0.5">
                      <Check className="h-3.5 w-3.5 text-emerald-400" />
                    </div>
                    <div>
                      <p className="font-medium text-white">Unlimited Courses</p>
                      <p className="text-sm text-zinc-500">Access to {plan.tier === "starter" ? "standard" : "all"} curated courses</p>
                    </div>
                  </li>
                  {plan.tier !== "starter" && (
                    <li className="flex items-start gap-4">
                      <div className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500/10 border border-emerald-500/30 mt-0.5">
                        <Check className="h-3.5 w-3.5 text-emerald-400" />
                      </div>
                      <div>
                        <p className="font-medium text-white">Certificates</p>
                        <p className="text-sm text-zinc-500">Verified certificates of completion</p>
                      </div>
                    </li>
                  )}
                  {plan.tier === "elite" && (
                    <li className="flex items-start gap-4">
                      <div className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500/10 border border-emerald-500/30 mt-0.5">
                        <Check className="h-3.5 w-3.5 text-emerald-400" />
                      </div>
                      <div>
                        <p className="font-medium text-white">Learning Paths</p>
                        <p className="text-sm text-zinc-500">Structured learning journeys</p>
                      </div>
                    </li>
                  )}
                  {plan.tier !== "starter" && (
                    <li className="flex items-start gap-4">
                      <div className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500/10 border border-emerald-500/30 mt-0.5">
                        <Check className="h-3.5 w-3.5 text-emerald-400" />
                      </div>
                      <div>
                        <p className="font-medium text-white">Priority Support</p>
                        <p className="text-sm text-zinc-500">Dedicated support team</p>
                      </div>
                    </li>
                  )}
                </ul>
              </div>

              {isSwitching && existingSub && (
                <div className="mx-8 mb-6 rounded-xl border border-blue-500/20 bg-blue-500/5 p-4">
                  <p className="text-sm font-medium text-blue-400 flex items-center gap-2">
                    <Zap className="h-4 w-4" />
                    Your current plan ({existingSub.plan.name}) will be replaced. No refunds are issued.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Sidebar - Order Summary */}
          <div className="lg:col-span-2 lg:sticky lg:top-6 h-fit space-y-5">
            <div className="rounded-2xl bg-zinc-900/60 border border-zinc-800/50 backdrop-blur-sm overflow-hidden" data-testid="order-summary-card">
              <div className="px-6 py-5 border-b border-zinc-800/50">
                <h3 className="text-lg font-semibold text-white">Order Summary</h3>
              </div>
              <div className="px-6 py-5 space-y-4">
                <div className="space-y-3 border-b border-zinc-800/50 pb-4">
                  <div className="flex justify-between">
                    <span className="text-zinc-400">{plan.name}</span>
                    <span className="font-semibold text-white">${(price / 100).toFixed(2)}</span>
                  </div>
                  <div className="text-sm text-zinc-500">
                    {interval === "annual" ? "Annual" : "Monthly"} billing
                  </div>
                </div>
                <div className="flex justify-between items-center pt-1">
                  <span className="text-lg font-semibold text-white">Total</span>
                  <span className="text-2xl font-bold text-white">${(price / 100).toFixed(2)}</span>
                </div>
                <div className="text-xs text-zinc-500 bg-zinc-800/30 p-3 rounded-lg border border-zinc-700/30">
                  Next billing: <span className="text-zinc-300 font-medium">{new Date(Date.now() + (interval === "annual" ? 365 : 30) * 24 * 60 * 60 * 1000).toLocaleDateString()}</span>
                </div>
              </div>
            </div>

            {/* Payment Button */}
            <form action={createSubscriptionAction} className="space-y-4" data-testid="subscription-form">
              <input type="hidden" name="planId" value={plan.id} />
              <input type="hidden" name="interval" value={interval} />
              <Button 
                type="submit" 
                className="w-full h-14 text-base font-semibold bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-white shadow-[0_0_20px_rgba(16,185,129,0.3)] hover:shadow-[0_0_30px_rgba(16,185,129,0.4)] transition-all duration-300 border-0" 
                size="lg" 
                disabled={!isSynced}
                data-testid="subscribe-button"
              >
                {isSwitching ? "Confirm & Pay via PayPal" : "Subscribe via PayPal"}
              </Button>
              <p className="text-xs text-center text-zinc-500">
                Secure payment powered by PayPal
              </p>
            </form>

            {/* Trust Badges */}
            <div className="rounded-2xl bg-zinc-900/40 border border-zinc-800/30 p-5 space-y-3" data-testid="trust-badges">
              <div className="flex items-center gap-3 text-sm">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-500/10 border border-emerald-500/20">
                  <Check className="h-4 w-4 text-emerald-400" />
                </div>
                <span className="text-zinc-300">Cancel anytime</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-500/10 border border-emerald-500/20">
                  <Shield className="h-4 w-4 text-emerald-400" />
                </div>
                <span className="text-zinc-300">No hidden fees</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-500/10 border border-emerald-500/20">
                  <Lock className="h-4 w-4 text-emerald-400" />
                </div>
                <span className="text-zinc-300">Instant access</span>
              </div>
            </div>

            {/* Terms */}
            <p className="text-xs text-zinc-500 text-center px-4">
              By clicking "Subscribe", you agree to our{" "}
              <a href="/terms" className="text-zinc-400 underline hover:text-white transition-colors">Terms of Service</a>
              {" "}and{" "}
              <a href="/privacy" className="text-zinc-400 underline hover:text-white transition-colors">Privacy Policy</a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
