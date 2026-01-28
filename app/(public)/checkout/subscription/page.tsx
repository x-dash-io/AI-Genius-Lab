import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createPayPalSubscription, revisePayPalSubscription } from "@/lib/paypal";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Check, AlertCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

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

  // Check for existing active subscription to revise
  const existingSub = await prisma.subscription.findFirst({
    where: {
      userId: session.user.id,
      status: { in: ["active", "past_due", "cancelled"] },
      currentPeriodEnd: { gt: new Date() }
    }
  });

  const appUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";

  if (existingSub?.paypalSubscriptionId) {
    try {
      const result = await revisePayPalSubscription({
        subscriptionId: existingSub.paypalSubscriptionId,
        planId: paypalPlanId,
        returnUrl: `${appUrl}/checkout/subscription/success?subscriptionId=${existingSub.id}&targetPlanId=${planId}&targetInterval=${interval}`,
        cancelUrl: `${appUrl}/pricing?subscription=cancelled`,
      });

      if (result.approvalUrl) {
        redirect(result.approvalUrl);
      } else {
        // Some revisions don't need approval (e.g. same price or immediate change)
        // But usually they do. If not, we redirect to success.
        redirect(`${appUrl}/checkout/subscription/success?subscriptionId=${existingSub.id}&targetPlanId=${planId}&targetInterval=${interval}`);
      }
    } catch (error) {
      console.error("Failed to revise PayPal subscription:", error);
      throw error;
    }
  }

  // Create a new pending subscription record
  const subscription = await prisma.subscription.create({
    data: {
      userId: session.user.id,
      planId: plan.id,
      interval: interval === "monthly" ? "monthly" : "annual",
      status: "pending",
      currentPeriodEnd: new Date(), // Initial value
    }
  });

  let approvalUrl: string;
  try {
    const result = await createPayPalSubscription({
      planId: paypalPlanId,
      customId: subscription.id,
      returnUrl: `${appUrl}/checkout/subscription/success?subscriptionId=${subscription.id}`,
      cancelUrl: `${appUrl}/pricing?subscription=cancelled`,
    });
    approvalUrl = result.approvalUrl;

    // Save PayPal subscription ID immediately
    await prisma.subscription.update({
      where: { id: subscription.id },
      data: { paypalSubscriptionId: result.subscriptionId }
    });
  } catch (error) {
    console.error("Failed to create PayPal subscription:", error);
    // Cleanup pending subscription
    await prisma.subscription.delete({ where: { id: subscription.id } });
    throw error;
  }

  redirect(approvalUrl);
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
    <div className="max-w-2xl mx-auto py-24 px-4">
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

      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">
          {isSwitching ? "Switch Subscription Plan" : "Confirm Subscription"}
        </h1>
        <p className="text-muted-foreground mt-2">
          {isSwitching
            ? `You are switching from ${existingSub.plan.name} to ${plan.name}. Your new plan will start immediately.`
            : "Review your selection before proceeding to payment."}
        </p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-2xl">{plan.name}</CardTitle>
              <CardDescription>{plan.description}</CardDescription>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold">${(price / 100).toFixed(2)}</p>
              <p className="text-sm text-muted-foreground capitalize">{interval} billing</p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-3">
            <p className="font-semibold text-sm uppercase tracking-wider text-muted-foreground">What you get</p>
            <ul className="space-y-2">
              <li className="flex items-center gap-2 text-sm">
                <Check className="h-4 w-4 text-green-500" />
                <span>Unlimited access to {plan.tier === "starter" ? "standard" : "all"} courses</span>
              </li>
              {plan.tier !== "starter" && (
                <li className="flex items-center gap-2 text-sm">
                  <Check className="h-4 w-4 text-green-500" />
                  <span>Verified certificates of completion</span>
                </li>
              )}
              {plan.tier === "elite" && (
                <li className="flex items-center gap-2 text-sm">
                  <Check className="h-4 w-4 text-green-500" />
                  <span>Access to all Learning Paths</span>
                </li>
              )}
            </ul>
          </div>
        </CardContent>
        <CardFooter className="flex-col gap-4 border-t pt-6">
          <form action={createSubscriptionAction} className="w-full">
            <input type="hidden" name="planId" value={plan.id} />
            <input type="hidden" name="interval" value={interval} />
            <Button type="submit" className="w-full" size="lg" disabled={!isSynced}>
              {isSwitching ? "Confirm & Pay via PayPal" : "Subscribe via PayPal"}
            </Button>
          </form>
          <p className="text-xs text-center text-muted-foreground max-w-sm mx-auto">
            By subscribing, you agree to automatic recurring billing. You can cancel at any time from your dashboard.
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
