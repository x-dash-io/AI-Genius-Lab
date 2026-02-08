"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Check, Zap, ArrowRight } from "lucide-react";
import Link from "next/link";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { SubscriptionPlan } from "@prisma/client";

interface PricingGridProps {
  plans: SubscriptionPlan[];
  currentPlanId?: string | null;
}

export function PricingGrid({ plans, currentPlanId }: PricingGridProps) {
  const [interval, setInterval] = useState<"monthly" | "annual">("monthly");

  return (
    <div className="space-y-12">
      <div className="flex justify-center">
        <Tabs
          value={interval}
          onValueChange={(v) => setInterval(v as "monthly" | "annual")}
          className="w-[300px]"
        >
          <TabsList className="grid w-full grid-cols-2 bg-muted/50 p-1 rounded-lg">
            <TabsTrigger
              value="monthly"
              className="data-[state=active]:bg-background data-[state=active]:shadow-sm data-[state=active]:border data-[state=active]:border-border rounded-md transition-all"
            >
              Monthly
            </TabsTrigger>
            <TabsTrigger
              value="annual"
              className="data-[state=active]:bg-background data-[state=active]:shadow-sm data-[state=active]:border data-[state=active]:border-border rounded-md transition-all"
            >
              Annual
              <span className="ml-1.5 inline-flex items-center rounded-full bg-green-100 dark:bg-green-900/30 px-2 py-0.5 text-xs font-medium text-green-800 dark:text-green-300">
                -20%
              </span>
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
        {plans.map((plan) => {
          const isCurrentPlan = currentPlanId === plan.id;
          const priceCents = interval === "monthly" ? plan.priceMonthlyCents : plan.priceAnnualCents;
          const displayPrice = (priceCents / 100).toFixed(0); // Removing decimal for cleaner look

          // Calculate savings for annual plans
          const savingsCents = plan.priceMonthlyCents * 12 - plan.priceAnnualCents;
          const savings = (savingsCents / 100).toFixed(0);

          return (
            <Card key={plan.id} className={`${plan.tier === "professional" ? "border-2 border-blue-500 shadow-2xl relative md:scale-105 ring-2 ring-blue-400/50 z-10" : ""} ${isCurrentPlan ? "ring-2 ring-primary bg-primary/5" : ""}`}>
              {plan.tier === "professional" && (
                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-gradient-to-r from-blue-600 via-blue-500 to-blue-400 text-white text-sm font-bold px-6 py-2.5 rounded-full uppercase tracking-widest shadow-xl border-2 border-blue-300 flex items-center gap-2 z-20 whitespace-nowrap">
                  <Zap className="h-4 w-4 flex-shrink-0" />
                  Most Popular
                </div>
              )}
              {isCurrentPlan && (
                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-primary text-primary-foreground text-sm font-bold px-6 py-2 rounded-full uppercase tracking-widest shadow-lg z-20 whitespace-nowrap">
                  Current Plan
                </div>
              )}
              <CardHeader>
                <CardTitle className={plan.tier === "professional" ? "text-3xl text-blue-600 dark:text-blue-400" : "text-2xl"}>{plan.name}</CardTitle>
                <CardDescription className={`min-h-[40px] ${plan.tier === "professional" ? "text-foreground/80 font-medium" : ""}`}>{plan.description}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <div className="flex items-baseline gap-1">
                    {priceCents === 0 ? (
                      <span className="text-4xl font-bold">Free</span>
                    ) : (
                      <>
                        <span className="text-4xl font-bold">${displayPrice}</span>
                        <span className="text-muted-foreground">/{interval === "monthly" ? "mo" : "yr"}</span>
                      </>
                    )}
                  </div>
                  {interval === "annual" && priceCents > 0 && (
                    <div className="text-sm text-green-600 dark:text-green-400 font-medium mt-1 flex items-center gap-1">
                      <Check className="h-3 w-3" />
                      Save ${savings} per year
                    </div>
                  )}
                  {interval === "annual" && priceCents === 0 && (
                    <div className="text-sm text-muted-foreground mt-1">
                      Always free
                    </div>
                  )}
                  {interval === "monthly" && priceCents > 0 && (
                    <div className="text-sm text-muted-foreground mt-1">
                      Billed monthly
                    </div>
                  )}
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
                    <Check className={plan.tier === "founder" ? "h-4 w-4 text-green-500" : "h-4 w-4 text-muted-foreground/30"} />
                    <span className={plan.tier === "founder" ? "text-foreground font-medium" : ""}>All Learning Paths included</span>
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
                {isCurrentPlan ? (
                  <Button
                    className="w-full cursor-not-allowed opacity-80"
                    variant="secondary"
                    disabled
                  >
                    Your Current Plan
                  </Button>
                ) : plan.tier === "starter" ? (
                  <Button
                    className="w-full cursor-not-allowed opacity-50"
                    variant="outline"
                    disabled
                  >
                    Start for Free-ish
                  </Button>
                ) : (
                  <Link href={`/checkout/subscription?planId=${plan.id}&interval=${interval}`} className="w-full">
                    {plan.tier === "professional" ? (
                      <Button
                        className="w-full hover:scale-105 transition-transform bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white font-bold border-0"
                        variant="default"
                      >
                        Choose {plan.name}
                      </Button>
                    ) : (
                      <Button
                        className="w-full hover:scale-105 transition-transform"
                        variant="outline"
                      >
                        {"Choose " + plan.name}
                      </Button>
                    )}
                  </Link>
                )}
              </CardFooter>
            </Card>
          );
        })}

        {plans.length === 0 && (
          <div className="col-span-full text-center py-12">
            <p className="text-muted-foreground text-lg">No subscription plans available at the moment. Please check back later.</p>
          </div>
        )}
      </div>
    </div>
  );
}
