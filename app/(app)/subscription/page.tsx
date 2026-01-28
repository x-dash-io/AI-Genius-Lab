// app/subscription/page.tsx
import { Metadata } from "next";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getUserSubscription, SUBSCRIPTION_PLANS } from "@/lib/subscription";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check, AlertCircle, Loader2 } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import SubscriptionActions from "@/components/subscription/SubscriptionActions"; // We'll create this client component inline for simplicity or separate file

export const metadata: Metadata = {
  title: "My Subscription | AI Genius Lab",
  description: "Manage your premium subscription",
};

export default async function SubscriptionPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect("/sign-in?callbackUrl=/subscription");
  }

  const subscription = await getUserSubscription(session.user.id);
  const success = searchParams.success === "true";
  const error = searchParams.error;

  return (
    <div className="container max-w-6xl py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Subscription</h1>
        <p className="text-muted-foreground">
          Manage your billing and premium access.
        </p>
      </div>

      {success && (
        <Alert className="mb-6 border-green-500 text-green-600 bg-green-50">
          <Check className="h-4 w-4" />
          <AlertTitle>Success!</AlertTitle>
          <AlertDescription>
            Your subscription has been activated successfully. You now have access to all premium courses.
          </AlertDescription>
        </Alert>
      )}

      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            {error === "cancelled" 
              ? "The payment process was cancelled." 
              : "There was an issue processing your subscription. Please try again."}
          </AlertDescription>
        </Alert>
      )}

      {subscription ? (
        <Card className="max-w-2xl">
          <CardHeader>
            <CardTitle>Current Plan</CardTitle>
            <CardDescription>
              You are currently subscribed to the <strong>{SUBSCRIPTION_PLANS[subscription.planType as keyof typeof SUBSCRIPTION_PLANS]?.name}</strong>.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground">Status</p>
                <p className="font-medium capitalize">{subscription.status}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Start Date</p>
                <p className="font-medium">{subscription.startDate.toLocaleDateString()}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Next Billing / Expiry</p>
                <p className="font-medium">
                  {subscription.endDate ? subscription.endDate.toLocaleDateString() : "N/A"}
                </p>
              </div>
              <div>
                <p className="text-muted-foreground">Amount</p>
                <p className="font-medium">
                  ${(SUBSCRIPTION_PLANS[subscription.planType as keyof typeof SUBSCRIPTION_PLANS]?.priceCents / 100).toFixed(2)} / {SUBSCRIPTION_PLANS[subscription.planType as keyof typeof SUBSCRIPTION_PLANS]?.interval}
                </p>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-between border-t pt-6">
            <p className="text-sm text-muted-foreground">
              {subscription.status === "active" 
                ? "Your subscription will automatically renew." 
                : "Your subscription is cancelled and will expire on the date shown."}
            </p>
            {subscription.status === "active" && (
              <SubscriptionActions action="cancel" />
            )}
          </CardFooter>
        </Card>
      ) : (
        <div className="grid gap-8 md:grid-cols-2 lg:gap-12 max-w-4xl mx-auto">
          {Object.values(SUBSCRIPTION_PLANS).map((plan) => (
            <Card key={plan.id} className={`flex flex-col ${plan.popular ? 'border-primary shadow-lg relative' : ''}`}>
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-primary text-primary-foreground text-xs font-bold rounded-full">
                  Most Popular
                </div>
              )}
              <CardHeader>
                <CardTitle>{plan.name}</CardTitle>
                <div className="mt-4">
                  <span className="text-4xl font-bold">${(plan.priceCents / 100).toFixed(2)}</span>
                  <span className="text-muted-foreground">/{plan.interval}</span>
                </div>
                <CardDescription className="mt-2">
                  Unlock full access to AI Genius Lab
                </CardDescription>
              </CardHeader>
              <CardContent className="flex-1">
                <ul className="space-y-3 text-sm">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-center">
                      <Check className="mr-2 h-4 w-4 text-primary" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </CardContent>
              <CardFooter>
                <SubscriptionActions action="subscribe" planId={plan.id} />
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
