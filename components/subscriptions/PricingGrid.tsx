"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import type { SubscriptionPlan } from "@prisma/client";
import { ArrowRight, Check, ShieldCheck, Sparkles, X } from "lucide-react";
import { BillingIntervalSegmentedControl, type BillingInterval } from "@/components/subscriptions/BillingIntervalSegmentedControl";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface PricingGridProps {
  plans: SubscriptionPlan[];
  currentPlanId?: string | null;
}

const tierPriority = ["starter", "pro", "professional", "founder", "enterprise"];

const featureRows = [
  {
    key: "standard",
    label: "Standard course access",
    check: () => true,
  },
  {
    key: "premium",
    label: "Premium course access",
    check: (tier: string) => ["pro", "professional", "founder", "enterprise"].includes(tier),
  },
  {
    key: "certificates",
    label: "Course certificates",
    check: (tier: string) => tier !== "starter",
  },
  {
    key: "learning-paths",
    label: "Learning path access",
    check: (tier: string) => ["founder", "enterprise"].includes(tier),
  },
];

function sortPlans(plans: SubscriptionPlan[]) {
  return [...plans].sort((a, b) => {
    const aIndex = tierPriority.indexOf(a.tier.toLowerCase());
    const bIndex = tierPriority.indexOf(b.tier.toLowerCase());
    const safeA = aIndex === -1 ? Number.MAX_SAFE_INTEGER : aIndex;
    const safeB = bIndex === -1 ? Number.MAX_SAFE_INTEGER : bIndex;
    return safeA - safeB;
  });
}

export function PricingGrid({ plans, currentPlanId }: PricingGridProps) {
  const [interval, setInterval] = useState<BillingInterval>("monthly");

  const orderedPlans = useMemo(() => sortPlans(plans), [plans]);

  const recommendedPlanId = useMemo(() => {
    return (
      orderedPlans.find((plan) =>
        ["pro", "professional"].includes(plan.tier.toLowerCase())
      )?.id ?? orderedPlans[Math.min(1, Math.max(0, orderedPlans.length - 1))]?.id
    );
  }, [orderedPlans]);

  if (!orderedPlans.length) {
    return (
      <Card className="ui-surface">
        <CardContent className="py-10 text-center">
          <p className="text-sm text-muted-foreground">
            No subscription plans are available right now.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex justify-center">
        <BillingIntervalSegmentedControl value={interval} onValueChange={setInterval} />
      </div>

      <div className="grid gap-5 xl:grid-cols-3">
        {orderedPlans.map((plan) => {
          const tier = plan.tier.toLowerCase();
          const isRecommended = plan.id === recommendedPlanId;
          const isCurrentPlan = currentPlanId === plan.id;
          const priceCents = interval === "monthly" ? plan.priceMonthlyCents : plan.priceAnnualCents;
          const monthlyEquivalent = Math.round(plan.priceAnnualCents / 12);
          const annualSavings = Math.max(0, plan.priceMonthlyCents * 12 - plan.priceAnnualCents);
          const hasPaidPrice = priceCents > 0;

          return (
            <Card
              key={plan.id}
              className={cn(
                "ui-surface relative flex h-full flex-col border",
                isRecommended && "ring-2 ring-primary/45 shadow-[var(--shadow-md)]",
                isCurrentPlan && "ring-2 ring-success/50"
              )}
            >
              {isRecommended ? (
                <Badge className="absolute -top-3 left-4 bg-premium-gradient text-primary-foreground">
                  <Sparkles className="mr-1 h-3.5 w-3.5" />
                  Recommended
                </Badge>
              ) : null}

              <CardHeader className="space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <CardTitle className="text-2xl">{plan.name}</CardTitle>
                  <Badge variant="outline" className="capitalize">
                    {plan.tier.toLowerCase()}
                  </Badge>
                </div>
                <CardDescription className="min-h-[2.75rem] text-sm">
                  {plan.description || "Subscription access with structured learning and checkout support."}
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-5">
                <div className="rounded-[var(--radius-md)] border bg-background px-4 py-3">
                  <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    {interval === "monthly" ? "Monthly billing" : "Yearly billing"}
                  </p>
                  <div className="mt-1 flex items-end gap-2">
                    {hasPaidPrice ? (
                      <>
                        <span className="text-4xl font-semibold tracking-tight">
                          ${(priceCents / 100).toFixed(0)}
                        </span>
                        <span className="pb-1 text-sm text-muted-foreground">
                          /{interval === "monthly" ? "mo" : "yr"}
                        </span>
                      </>
                    ) : (
                      <span className="text-4xl font-semibold tracking-tight">Free</span>
                    )}
                  </div>
                  {interval === "annual" && hasPaidPrice ? (
                    <p className="mt-2 text-xs text-muted-foreground">
                      ${annualSavings / 100} saved per year, about ${monthlyEquivalent / 100}/mo equivalent.
                    </p>
                  ) : null}
                </div>

                <ul className="space-y-2.5 text-sm">
                  {featureRows.map((feature) => {
                    const enabled = feature.check(tier);
                    return (
                      <li key={`${plan.id}-${feature.key}`} className="flex items-center gap-2.5">
                        {enabled ? (
                          <Check className="h-4 w-4 text-success" aria-hidden="true" />
                        ) : (
                          <X className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
                        )}
                        <span className={enabled ? "text-foreground" : "text-muted-foreground"}>
                          {feature.label}
                        </span>
                      </li>
                    );
                  })}
                </ul>
              </CardContent>

              <CardFooter className="mt-auto flex-col gap-2">
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
                    <Button className="w-full" variant={isRecommended ? "premium" : "outline"}>
                      Choose {plan.name}
                    </Button>
                  </Link>
                )}
                <p className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                  <ShieldCheck className="h-3.5 w-3.5" />
                  Secure checkout via PayPal
                </p>
              </CardFooter>
            </Card>
          );
        })}
      </div>

      <section className="space-y-3">
        <div className="hidden overflow-hidden rounded-[var(--radius-md)] border ui-surface lg:block">
          <table className="w-full text-sm">
            <thead className="bg-muted/60">
              <tr>
                <th className="px-4 py-3 text-left font-semibold text-foreground">Feature comparison</th>
                {orderedPlans.map((plan) => (
                  <th key={`header-${plan.id}`} className="px-4 py-3 text-center font-semibold text-foreground">
                    {plan.name}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {featureRows.map((feature) => (
                <tr key={`feature-row-${feature.key}`} className="border-t">
                  <td className="px-4 py-3 text-muted-foreground">{feature.label}</td>
                  {orderedPlans.map((plan) => {
                    const enabled = feature.check(plan.tier.toLowerCase());
                    return (
                      <td key={`${feature.key}-${plan.id}`} className="px-4 py-3 text-center">
                        {enabled ? (
                          <Check className="mx-auto h-4 w-4 text-success" aria-label="Included" />
                        ) : (
                          <X className="mx-auto h-4 w-4 text-muted-foreground" aria-label="Not included" />
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="grid gap-3 lg:hidden">
          {orderedPlans.map((plan) => (
            <details key={`mobile-feature-${plan.id}`} className="ui-surface rounded-[var(--radius-md)] border p-4">
              <summary className="cursor-pointer list-none text-sm font-semibold text-foreground">
                {plan.name} feature details
              </summary>
              <ul className="mt-3 space-y-2 text-sm">
                {featureRows.map((feature) => {
                  const enabled = feature.check(plan.tier.toLowerCase());
                  return (
                    <li key={`${plan.id}-mobile-${feature.key}`} className="flex items-center gap-2">
                      {enabled ? (
                        <Check className="h-4 w-4 text-success" aria-hidden="true" />
                      ) : (
                        <X className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
                      )}
                      <span className={enabled ? "text-foreground" : "text-muted-foreground"}>
                        {feature.label}
                      </span>
                    </li>
                  );
                })}
              </ul>
            </details>
          ))}
        </div>
      </section>

      <div className="ui-surface flex flex-wrap items-center justify-between gap-3 rounded-[var(--radius-md)] border p-4">
        <p className="text-sm text-muted-foreground">
          Need help selecting a plan? Compare tiers and start with monthly, then switch cadence anytime.
        </p>
        <Link href="/contact" className="inline-flex">
          <Button size="sm" variant="ghost">
            Talk to sales
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </Link>
      </div>
    </div>
  );
}
