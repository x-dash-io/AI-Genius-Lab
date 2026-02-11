"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowRight, Check, Sparkles } from "lucide-react";
import Link from "next/link";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { SubscriptionPlan } from "@prisma/client";

interface PricingGridProps {
  plans: SubscriptionPlan[];
  currentPlanId?: string | null;
}

const prioritizedTiers = ["starter", "pro", "professional", "founder", "enterprise"];

export function PricingGrid({ plans, currentPlanId }: PricingGridProps) {
  const [interval, setInterval] = useState<"monthly" | "annual">("monthly");

  const orderedPlans = useMemo(() => {
    const sorted = [...plans].sort((a, b) => {
      const aIndex = prioritizedTiers.indexOf(a.tier.toLowerCase());
      const bIndex = prioritizedTiers.indexOf(b.tier.toLowerCase());
      const safeA = aIndex === -1 ? Number.MAX_SAFE_INTEGER : aIndex;
      const safeB = bIndex === -1 ? Number.MAX_SAFE_INTEGER : bIndex;
      return safeA - safeB;
    });

    const popularIndex = sorted.findIndex((plan) => ["pro", "professional"].includes(plan.tier.toLowerCase()));
    if (popularIndex > 0) {
      const [popularPlan] = sorted.splice(popularIndex, 1);
      sorted.splice(1, 0, popularPlan);
    }

    return sorted;
  }, [plans]);

  return (
    <div className="space-y-10">
      <div className="flex justify-center">
        <Tabs
          value={interval}
          onValueChange={(v) => setInterval(v as "monthly" | "annual")}
          className="w-[320px]"
        >
          <TabsList className="grid w-full grid-cols-2 bg-muted/60 p-1 rounded-xl">
            <TabsTrigger value="monthly" className="rounded-lg data-[state=active]:shadow-sm">
              Monthly billing
            </TabsTrigger>
            <TabsTrigger value="annual" className="rounded-lg data-[state=active]:shadow-sm">
              Annual billing
              <span className="ml-2 inline-flex items-center rounded-full bg-emerald-100 dark:bg-emerald-900/30 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-emerald-800 dark:text-emerald-300">
                Save 20%
              </span>
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
        {orderedPlans.map((plan) => {
          const tier = plan.tier.toLowerCase();
          const isPopular = ["pro", "professional"].includes(tier);
          const isCurrentPlan = currentPlanId === plan.id;
          const priceCents = interval === "monthly" ? plan.priceMonthlyCents : plan.priceAnnualCents;
          const displayPrice = (priceCents / 100).toFixed(0);

          const savingsCents = plan.priceMonthlyCents * 12 - plan.priceAnnualCents;
          const savings = Math.max(0, Math.floor(savingsCents / 100));

          return (
            <Card
              key={plan.id}
              className={[
                "relative rounded-2xl border bg-card/95",
                isPopular ? "md:-mt-2 border-primary/60 shadow-2xl shadow-primary/10" : "border-border/80",
                isCurrentPlan ? "ring-2 ring-primary" : "",
              ].join(" ")}
            >
              {isPopular && (
                <div className="absolute left-1/2 top-0 -translate-x-1/2 -translate-y-1/2 inline-flex items-center gap-2 rounded-full bg-primary text-primary-foreground px-4 py-1.5 text-[10px] font-bold uppercase tracking-widest">
                  <Sparkles className="h-3 w-3" />
                  Most popular
                </div>
              )}

              <CardHeader>
                <CardTitle className="text-2xl">{plan.name}</CardTitle>
                <CardDescription className="min-h-[40px]">{plan.description}</CardDescription>
              </CardHeader>

              <CardContent className="space-y-5">
                <div>
                  {priceCents === 0 ? (
                    <div className="text-4xl font-black tracking-tight">Free</div>
                  ) : (
                    <div className="flex items-end gap-1">
                      <span className="text-4xl font-black tracking-tight">${displayPrice}</span>
                      <span className="text-sm text-muted-foreground pb-1">/{interval === "monthly" ? "mo" : "yr"}</span>
                    </div>
                  )}
                  {interval === "annual" && priceCents > 0 && (
                    <p className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 mt-1">Save ${savings}/year</p>
                  )}
                </div>

                <ul className="space-y-3 text-sm">
                  <li className="flex items-start gap-2">
                    <Check className="h-4 w-4 text-green-500 mt-0.5" />
                    <span>{tier === "starter" ? "Core AI courses" : "All AI courses"}</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="h-4 w-4 text-green-500 mt-0.5" />
                    <span>{tier === "starter" ? "Path previews" : "Guided learning paths"}</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="h-4 w-4 text-green-500 mt-0.5" />
                    <span>{tier === "starter" ? "Community support" : "Certificates + priority support"}</span>
                  </li>
                </ul>

                <Link href="/pricing#faq" className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline">
                  Learn more
                  <ArrowRight className="h-3 w-3" />
                </Link>
              </CardContent>

              <CardFooter>
                {isCurrentPlan ? (
                  <Button className="w-full" variant="secondary" disabled>
                    Current plan
                  </Button>
                ) : tier === "starter" ? (
                  <Button className="w-full" variant="outline" disabled>
                    Included by default
                  </Button>
                ) : (
                  <Link href={`/checkout/subscription?planId=${plan.id}&interval=${interval}`} className="w-full">
                    <Button className="w-full" variant={isPopular ? "premium" : "outline"}>
                      Choose {plan.name}
                    </Button>
                  </Link>
                )}
              </CardFooter>
            </Card>
          );
        })}

        {orderedPlans.length === 0 && (
          <div className="col-span-full text-center py-12">
            <p className="text-muted-foreground text-lg">No subscription plans available right now. Please check back soon.</p>
          </div>
        )}
      </div>
    </div>
  );
}
