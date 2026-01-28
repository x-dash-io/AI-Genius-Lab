import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Check } from "lucide-react";
import Link from "next/link";

export default async function PricingPage() {
  const plans = await prisma.subscriptionPlan.findMany({
    where: { isActive: true },
    orderBy: { tier: "asc" }
  });

  return (
    <div className="container mx-auto py-24 px-4">
      <div className="text-center max-w-3xl mx-auto mb-16">
        <h1 className="font-display text-5xl font-bold tracking-tight mb-4">Simple, transparent pricing</h1>
        <p className="text-xl text-muted-foreground">
          Choose the plan that's right for you and start your AI learning journey today.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
        {plans.map((plan) => (
          <Card key={plan.id} className={plan.tier === "pro" ? "border-primary shadow-lg relative md:scale-105" : ""}>
            {plan.tier === "pro" && (
              <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-primary text-primary-foreground text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                Most Popular
              </div>
            )}
            <CardHeader>
              <CardTitle className="text-2xl">{plan.name}</CardTitle>
              <CardDescription className="min-h-[40px]">{plan.description}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <span className="text-4xl font-bold">${(plan.priceMonthlyCents / 100).toFixed(2)}</span>
                <span className="text-muted-foreground">/mo</span>
                <div className="text-sm text-muted-foreground mt-1">
                  or ${(plan.priceAnnualCents / 100).toFixed(2)} billed annually
                </div>
              </div>
              <ul className="space-y-3 text-sm">
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-500" />
                  <span>Access to {plan.tier === "starter" ? "Standard" : "All"} Courses</span>
                </li>
                <li className="flex items-center gap-2 text-muted-foreground">
                  <Check className={plan.tier !== "starter" ? "h-4 w-4 text-green-500" : "h-4 w-4 text-muted-foreground/30"} />
                  <span className={plan.tier !== "starter" ? "text-foreground font-medium" : ""}>Certificates of completion</span>
                </li>
                <li className="flex items-center gap-2 text-muted-foreground">
                  <Check className={plan.tier === "elite" ? "h-4 w-4 text-green-500" : "h-4 w-4 text-muted-foreground/30"} />
                  <span className={plan.tier === "elite" ? "text-foreground font-medium" : ""}>All Learning Paths included</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-500" />
                  <span>Standard Support</span>
                </li>
                {plan.tier !== "starter" && (
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-green-500" />
                    <span>Priority Support</span>
                  </li>
                )}
              </ul>
            </CardContent>
            <CardFooter>
              <Link href={`/checkout/subscription?planId=${plan.id}`} className="w-full">
                <Button className="w-full" variant={plan.tier === "pro" ? "default" : "outline"}>
                  {plan.tier === "starter" ? "Start for Free-ish" : "Choose " + plan.name}
                </Button>
              </Link>
            </CardFooter>
          </Card>
        ))}

        {plans.length === 0 && (
          <div className="col-span-full text-center py-12">
            <p className="text-muted-foreground text-lg italic">No subscription plans available at the moment. Please check back later.</p>
          </div>
        )}
      </div>

      <div className="mt-24 text-center">
        <h2 className="text-2xl font-bold mb-4">Frequently Asked Questions</h2>
        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto text-left">
          <div>
            <h3 className="font-semibold mb-2">Can I cancel anytime?</h3>
            <p className="text-muted-foreground text-sm">Yes, you can cancel your subscription at any time from your dashboard. You will continue to have access until the end of your billing period.</p>
          </div>
          <div>
            <h3 className="font-semibold mb-2">Can I buy individual courses?</h3>
            <p className="text-muted-foreground text-sm">Absolutely! You can still purchase courses individually even if you don't have a subscription.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
