import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { revalidatePath } from "next/cache";
import { Suspense } from "react";
import { format } from "date-fns";
import Link from "next/link";

import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { cancelSubscription, refreshSubscriptionStatus } from "@/lib/subscriptions";
import { SubscriptionSuccessToast } from "@/components/checkout/SubscriptionSuccessToast";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import {
  ContentRegion,
  PageContainer,
  PageHeader,
  StatusRegion,
  Toolbar,
} from "@/components/layout/shell";
import { Check, CreditCard, Sparkles, XCircle } from "lucide-react";

export const dynamic = "force-dynamic";

async function cancelAction(formData: FormData) {
  "use server";
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/sign-in");

  const subId = formData.get("subId") as string;
  await cancelSubscription(subId);

  revalidatePath("/profile/subscription");
  revalidatePath("/profile");
  revalidatePath("/pricing");
}

export default async function UserSubscriptionPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/sign-in");

  let subscription = await prisma.subscription.findFirst({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
    include: {
      plan: true,
      payments: {
        orderBy: { paidAt: "desc" },
        take: 10,
      },
    },
  });

  if (subscription?.status === "pending") {
    const updatedStatus = await refreshSubscriptionStatus(subscription.id);

    if (updatedStatus && updatedStatus.status !== "pending") {
      subscription = await prisma.subscription.findUnique({
        where: { id: subscription.id },
        include: {
          plan: true,
          payments: { orderBy: { paidAt: "desc" }, take: 10 },
        },
      });
    }
  }

  const hasSubscription = Boolean(subscription);
  const billingAmount = subscription
    ? subscription.interval === "monthly"
      ? subscription.plan.priceMonthlyCents
      : subscription.plan.priceAnnualCents
    : 0;

  return (
    <PageContainer className="space-y-6">
      <Suspense fallback={null}>
        <SubscriptionSuccessToast />
      </Suspense>

      <PageHeader
        title="Subscription"
        description="Manage your plan, billing cadence, and payment history."
        breadcrumbs={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Profile", href: "/profile" },
          { label: "Subscription" },
        ]}
        actions={
          <Link href="/pricing">
            <Button variant="outline">Compare Plans</Button>
          </Link>
        }
      />

      <Toolbar className="justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant={hasSubscription ? "default" : "secondary"}>
            {hasSubscription
              ? subscription?.status === "pending"
                ? "Processing"
                : "Active subscription"
              : "No active subscription"}
          </Badge>
          {subscription ? (
            <Badge variant="outline" className="capitalize">
              {subscription.interval} billing
            </Badge>
          ) : null}
        </div>
        {subscription ? (
          <span className="text-xs text-muted-foreground">
            {subscription.status === "pending"
              ? "Activation pending"
              : `Renews ${format(new Date(subscription.currentPeriodEnd), "PPP")}`}
          </span>
        ) : null}
      </Toolbar>

      <ContentRegion>
        {!subscription ? (
          <EmptyState
            icon={<CreditCard className="h-6 w-6" />}
            title="No active subscription"
            description="Choose a plan to unlock premium courses, certificates, and learning paths."
            action={
              <Link href="/pricing">
                <Button variant="premium">View pricing plans</Button>
              </Link>
            }
          />
        ) : (
          <Card className="ui-surface">
            <CardHeader>
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="space-y-1">
                  <CardTitle className="text-2xl">{subscription.plan.name} Plan</CardTitle>
                  <CardDescription>
                    {subscription.interval === "monthly" ? "Monthly" : "Annual"} billing through PayPal.
                  </CardDescription>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-semibold">${(billingAmount / 100).toFixed(2)}</p>
                  <p className="text-xs text-muted-foreground">/{subscription.interval === "monthly" ? "mo" : "yr"}</p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="grid gap-6 md:grid-cols-2">
              <section className="space-y-3">
                <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Plan Inclusions</h3>
                <ul className="space-y-2 text-sm">
                  <li className="inline-flex items-center gap-2">
                    <Check className="h-4 w-4 text-success" />
                    Access to {subscription.plan.tier === "starter" ? "standard" : "all"} courses
                  </li>
                  <li className="inline-flex items-center gap-2">
                    {subscription.plan.tier !== "starter" ? (
                      <Check className="h-4 w-4 text-success" />
                    ) : (
                      <XCircle className="h-4 w-4 text-muted-foreground" />
                    )}
                    <span className={subscription.plan.tier === "starter" ? "text-muted-foreground" : ""}>
                      Certificates included
                    </span>
                  </li>
                  <li className="inline-flex items-center gap-2">
                    {subscription.plan.tier === "founder" ? (
                      <Check className="h-4 w-4 text-success" />
                    ) : (
                      <XCircle className="h-4 w-4 text-muted-foreground" />
                    )}
                    <span className={subscription.plan.tier === "founder" ? "" : "text-muted-foreground"}>
                      Learning paths included
                    </span>
                  </li>
                </ul>
              </section>

              <section className="rounded-[var(--radius-md)] border bg-background p-4">
                <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Billing Details</h3>
                <div className="mt-3 grid gap-3 text-sm">
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-muted-foreground">Status</span>
                    <Badge variant={subscription.status === "active" ? "default" : "secondary"}>
                      {subscription.status === "pending" ? "Processing" : subscription.status}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-muted-foreground">
                      {subscription.status === "pending" ? "Expected renewal" : "Next billing date"}
                    </span>
                    <span className="font-medium">
                      {subscription.status === "pending"
                        ? "Pending confirmation"
                        : format(new Date(subscription.currentPeriodEnd), "PPP")}
                    </span>
                  </div>
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-muted-foreground">Payment method</span>
                    <span className="inline-flex items-center gap-1.5 font-medium">
                      <CreditCard className="h-4 w-4" />
                      PayPal
                    </span>
                  </div>
                  {(subscription.cancelAtPeriodEnd || subscription.status === "cancelled") ? (
                    <p className="rounded-[var(--radius-sm)] border border-warning/35 bg-warning/10 px-3 py-2 text-xs text-warning-foreground">
                      Your subscription will end on {format(new Date(subscription.currentPeriodEnd), "PPP")} and will not renew.
                    </p>
                  ) : null}
                </div>
              </section>
            </CardContent>

            <CardFooter className="flex flex-col gap-3 border-t sm:flex-row sm:justify-between">
              {!subscription.cancelAtPeriodEnd && subscription.status === "active" ? (
                <form action={cancelAction} className="w-full sm:w-auto">
                  <input type="hidden" name="subId" value={subscription.id} />
                  <Button variant="destructive" className="w-full sm:w-auto">
                    Cancel Subscription
                  </Button>
                </form>
              ) : (
                <Link href="/pricing" className="w-full sm:w-auto">
                  <Button className="w-full sm:w-auto">
                    {subscription.status === "active" ? "Re-activate Subscription" : "Renew Subscription"}
                  </Button>
                </Link>
              )}

              <Link href="/pricing" className="w-full sm:w-auto">
                <Button variant="outline" className="w-full sm:w-auto">
                  Change Plan
                </Button>
              </Link>
            </CardFooter>
          </Card>
        )}
      </ContentRegion>

      <StatusRegion>
        {subscription?.payments.length ? (
          <Card className="ui-surface">
            <CardHeader>
              <CardTitle>Billing History</CardTitle>
              <CardDescription>Your recent subscription payments.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {subscription.payments.map((payment) => (
                  <div key={payment.id} className="flex flex-wrap items-center justify-between gap-2 rounded-[var(--radius-sm)] border bg-background px-3 py-2 text-sm">
                    <div>
                      <p className="font-medium">{format(new Date(payment.paidAt), "PPP")}</p>
                      <p className="font-mono text-xs text-muted-foreground">{payment.paypalSaleId}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">${(payment.amountCents / 100).toFixed(2)}</p>
                      <p className="text-xs capitalize text-success">{payment.status}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ) : null}

        <Card className="ui-surface">
          <CardContent className="flex flex-wrap items-center justify-between gap-3 p-4 text-sm">
            <p className="inline-flex items-center gap-2 text-muted-foreground">
              <Sparkles className="h-4 w-4" />
              Need billing help? Contact support@aigeniuslab.com.
            </p>
            <Link href="/contact">
              <Button variant="ghost" size="sm">Contact support</Button>
            </Link>
          </CardContent>
        </Card>
      </StatusRegion>
    </PageContainer>
  );
}
