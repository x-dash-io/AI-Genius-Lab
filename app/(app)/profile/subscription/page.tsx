import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getUserSubscription, cancelSubscription, refreshSubscriptionStatus } from "@/lib/subscriptions";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { Check, XCircle, CreditCard, RefreshCw } from "lucide-react";
import Link from "next/link";
import { revalidatePath } from "next/cache";
import { Suspense } from "react";
import { SubscriptionSuccessToast } from "@/components/checkout/SubscriptionSuccessToast";

async function cancelAction(formData: FormData) {
  "use server";
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/sign-in");

  const subId = formData.get("subId") as string;
  await cancelSubscription(subId);
  revalidatePath("/profile/subscription");
}

export default async function UserSubscriptionPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/sign-in");

  let subscriptionData = await getUserSubscription(session.user.id);

  if (subscriptionData?.status === "pending") {
    subscriptionData = await refreshSubscriptionStatus(subscriptionData.id);
  }

  const subscription = subscriptionData ? await prisma.subscription.findUnique({
    where: { id: subscriptionData.id },
    include: {
      plan: true,
      payments: {
        orderBy: { paidAt: "desc" },
        take: 10
      }
    }
  }) : null;

  return (
    <div className="space-y-8 pb-8">
      <Suspense fallback={null}>
        <SubscriptionSuccessToast />
      </Suspense>
      <div>
        <h1 className="font-display text-4xl font-bold tracking-tight">Subscription</h1>
        <p className="mt-2 text-lg text-muted-foreground">
          Manage your subscription plan and billing.
        </p>
      </div>

      {!subscription ? (
        <Card className="border-dashed">
          <CardContent className="py-12 flex flex-col items-center text-center space-y-4">
            <CreditCard className="h-12 w-12 text-muted-foreground opacity-50" />
            <div className="space-y-2">
              <h3 className="text-xl font-semibold">No active subscription</h3>
              <p className="text-muted-foreground max-w-sm">
                Get unlimited access to all courses and earn certificates by subscribing to one of our plans.
              </p>
            </div>
            <Link href="/pricing">
              <Button size="lg">View Pricing Plans</Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6">
          <Card>
            <CardHeader>
              <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <CardTitle className="text-2xl">{subscription.plan.name} Plan</CardTitle>
                    <Badge
                      variant={subscription.status === "active" ? "default" : "secondary"}
                      className={subscription.status === "pending" ? "animate-pulse" : ""}
                    >
                      {subscription.status === "pending" ? "Processing" : subscription.status}
                    </Badge>
                  </div>
                  <CardDescription>
                    {subscription.interval === "monthly" ? "Monthly" : "Annual"} billing
                  </CardDescription>
                </div>
                <Badge variant="outline" className="text-lg py-1 px-3 w-fit">
                  ${((subscription.interval === "monthly" ? subscription.plan.priceMonthlyCents : subscription.plan.priceAnnualCents) / 100).toFixed(2)}
                  <span className="text-xs font-normal text-muted-foreground ml-1">
                    /{subscription.interval === "monthly" ? "mo" : "yr"}
                  </span>
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <h4 className="font-semibold text-sm uppercase tracking-wider text-muted-foreground">Inclusions</h4>
                  <div className="flex items-center gap-2 text-sm">
                    <Check className="h-4 w-4 text-green-500" />
                    <span>Access to {subscription.plan.tier === "starter" ? "Standard" : "All"} Courses</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    {subscription.plan.tier !== "starter" ? (
                      <Check className="h-4 w-4 text-green-500" />
                    ) : (
                      <XCircle className="h-4 w-4 text-muted-foreground" />
                    )}
                    <span className={subscription.plan.tier === "starter" ? "text-muted-foreground" : ""}>Certificates included</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    {subscription.plan.tier === "elite" ? (
                      <Check className="h-4 w-4 text-green-500" />
                    ) : (
                      <XCircle className="h-4 w-4 text-muted-foreground" />
                    )}
                    <span className={subscription.plan.tier !== "elite" ? "text-muted-foreground" : ""}>Learning Paths included</span>
                  </div>
                </div>

                <div className="space-y-4 p-4 rounded-lg bg-muted/50 border">
                  <h4 className="font-semibold text-sm uppercase tracking-wider text-muted-foreground">Billing Details</h4>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-muted-foreground">
                      {subscription.status === "pending" ? "Expected renewal" : "Next billing date"}
                    </span>
                    <span className="font-medium">
                      {subscription.status === "pending"
                        ? "Pending confirmation"
                        : format(new Date(subscription.currentPeriodEnd), "PPP")
                      }
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-muted-foreground">Payment method</span>
                    <span className="flex items-center gap-2">
                      <CreditCard className="h-4 w-4 text-blue-500" />
                      PayPal
                    </span>
                  </div>
                  {subscription.cancelAtPeriodEnd && (
                    <div className="bg-amber-100 dark:bg-amber-950/30 p-3 rounded text-xs text-amber-800 dark:text-amber-300 flex items-start gap-2">
                      <RefreshCw className="h-4 w-4 mt-0.5 flex-shrink-0" />
                      <span>Your subscription will end on {format(new Date(subscription.currentPeriodEnd), "PPP")} and will not renew.</span>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex flex-col sm:flex-row justify-between gap-4 border-t pt-6">
              {!subscription.cancelAtPeriodEnd ? (
                <form action={cancelAction} className="w-full sm:w-auto">
                  <input type="hidden" name="subId" value={subscription.id} />
                  <Button variant="outline" className="w-full sm:w-auto text-destructive hover:bg-destructive/10">
                    Cancel Subscription
                  </Button>
                </form>
              ) : (
                <Link href="/pricing" className="w-full sm:w-auto">
                  <Button className="w-full">Re-activate Subscription</Button>
                </Link>
              )}
              <Link href="/pricing" className="w-full sm:w-auto">
                <Button variant="outline" className="w-full">Change Plan</Button>
              </Link>
            </CardFooter>
          </Card>

          {subscription.payments.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Billing History</CardTitle>
                <CardDescription>Your recent subscription payments.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {subscription.payments.map((payment) => (
                    <div key={payment.id} className="flex items-center justify-between text-sm py-2 border-b last:border-0">
                      <div>
                        <p className="font-medium">{format(new Date(payment.paidAt), "PPP")}</p>
                        <p className="text-xs text-muted-foreground font-mono">{payment.paypalSaleId}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">${(payment.amountCents / 100).toFixed(2)}</p>
                        <p className="text-xs text-green-600 capitalize">{payment.status}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle>Billing Support</CardTitle>
              <CardDescription>Need help with your subscription or payments?</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                If you have questions about your billing, want to request a refund, or encounter any issues, please contact our support team at support@aigeniuslab.com.
              </p>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
