"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check } from "lucide-react";
import { SubscriptionPlanDetails } from "@/lib/subscription";

interface SubscriptionCardProps {
  plan: SubscriptionPlanDetails;
  currentPlan?: string;
  onSubscribe: (planId: string) => void;
  isLoading?: boolean;
}

export function SubscriptionCard({
  plan,
  currentPlan,
  onSubscribe,
  isLoading = false,
}: SubscriptionCardProps) {
  const isCurrentPlan = currentPlan === plan.id;
  const isActive = isCurrentPlan;

  return (
    <Card className={`relative ${plan.popular ? "border-primary shadow-lg" : ""}`}>
      {plan.popular && (
        <Badge className="absolute -top-2 left-1/2 -translate-x-1/2">
          Most Popular
        </Badge>
      )}
      
      <CardHeader className="text-center">
        <CardTitle className="text-xl">{plan.name}</CardTitle>
        <CardDescription>
          <div className="mt-4">
            <span className="text-4xl font-bold">
              ${(plan.priceCents / 100).toFixed(2)}
            </span>
            <span className="text-muted-foreground">/{plan.interval}</span>
          </div>
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <ul className="space-y-3">
          {plan.features.map((feature, index) => (
            <li key={index} className="flex items-start gap-2">
              <Check className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
              <span className="text-sm">{feature}</span>
            </li>
          ))}
        </ul>
        
        <Button
          className="w-full"
          variant={isActive ? "outline" : plan.popular ? "default" : "secondary"}
          disabled={isActive || isLoading}
          onClick={() => onSubscribe(plan.id)}
        >
          {isActive
            ? "Current Plan"
            : isLoading
            ? "Processing..."
            : plan.id === currentPlan
            ? "Reactivate"
            : "Subscribe"}
        </Button>
      </CardContent>
    </Card>
  );
}
