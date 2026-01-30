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
}

export function PricingGrid({ plans }: PricingGridProps) {
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
          const priceCents = interval === "monthly" ? plan.priceMonthlyCents : plan.priceAnnualCents;
          const displayPrice = (priceCents / 100).toFixed(2);
          const perMonthPrice = interval === "annual" ? (priceCents / 12 / 100).toFixed(2) : displayPrice;

          return (
            <Card key={plan.id} className={plan.tier === "pro" ? "border-2 border-primary shadow-2xl relative md:scale-105 ring-2 ring-primary/30 z-10" : ""}>
              {plan.tier === "pro" && (
                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-gradient-to-r from-primary to-primary/90 text-primary-foreground text-xs font-bold px-4 py-2 rounded-full uppercase tracking-wider shadow-lg border-2 border-primary flex items-center gap-2 z-20">
                  <Zap className="h-3 w-3" />
                  Most Popular
                </div>
              )}
              <CardHeader>
                <CardTitle className="text-2xl">{plan.name}</CardTitle>
                <CardDescription className="min-h-[40px]">{plan.description}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-bold">${interval === "annual" ? perMonthPrice : displayPrice}</span>
                    <span className="text-muted-foreground">/mo</span>
                  </div>
                  {interval === "annual" && (
                    <div className="text-sm text-green-600 dark:text-green-400 font-medium mt-1 flex items-center gap-1">
                      <Check className="h-3 w-3" />
                      Billed annually (${displayPrice}/year)
                    </div>
                  )}
                  {interval === "monthly" && (
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
                <Link href={`/checkout/subscription?planId=${plan.id}&interval=${interval}`} className="w-full">
                  <Button className="w-full hover:scale-105 transition-transform" variant={plan.tier === "pro" ? "default" : "outline"}>
                    {plan.tier === "starter" ? "Start for Free-ish" : "Choose " + plan.name}
                  </Button>
                </Link>
              </CardFooter>
            </Card>
          );
        })}

        {plans.length === 0 && (
          <div className="col-span-full text-center py-12">
            <p className="text-muted-foreground text-lg italic">No subscription plans available at the moment. Please check back later.</p>
          </div>
        )}
      </div>
    </div>
  );
}
