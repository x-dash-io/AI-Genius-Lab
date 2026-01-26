"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SubscriptionCard } from "@/components/subscription/SubscriptionCard";
import { SubscriptionStatus } from "@/components/subscription/SubscriptionStatus";
import { PremiumBadge } from "@/components/subscription/PremiumBadge";
import { Crown, CheckCircle, AlertCircle } from "lucide-react";
import { SUBSCRIPTION_PLANS } from "@/lib/subscription";

interface SubscriptionPageClientProps {
  subscription?: any;
  searchParams: {
    upgrade?: string;
    cancelled?: string;
    success?: string;
  };
}

export function SubscriptionPageClient({
  subscription,
  searchParams,
}: SubscriptionPageClientProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  useEffect(() => {
    if (searchParams.upgrade === "required") {
      setMessage({
        type: "error",
        text: "A premium subscription is required to access this content.",
      });
    } else if (searchParams.cancelled === "true") {
      setMessage({
        type: "success",
        text: "Subscription cancelled successfully. You will continue to have access until the end of your billing period.",
      });
    } else if (searchParams.success === "true") {
      setMessage({
        type: "success",
        text: "Welcome to Premium! You now have access to all courses.",
      });
    }
  }, [searchParams]);

  const handleSubscribe = async (planId: string) => {
    setIsLoading(true);
    setMessage(null);

    try {
      const response = await fetch("/api/subscription/subscribe", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          planType: planId,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to create subscription");
      }

      const data = await response.json();
      
      // Redirect to PayPal for approval
      if (data.approvalUrl) {
        window.location.href = data.approvalUrl;
      } else {
        throw new Error("No approval URL received");
      }
    } catch (error) {
      setMessage({
        type: "error",
        text: error instanceof Error ? error.message : "Failed to create subscription",
      });
      setIsLoading(false);
    }
  };

  const handleCancel = async () => {
    if (!subscription) return;

    setIsLoading(true);
    setMessage(null);

    try {
      const response = await fetch("/api/subscription/cancel", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          subscriptionId: subscription.id,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to cancel subscription");
      }

      window.location.href = "/subscription?cancelled=true";
    } catch (error) {
      setMessage({
        type: "error",
        text: error instanceof Error ? error.message : "Failed to cancel subscription",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleReactivate = async () => {
    if (!subscription) return;

    setIsLoading(true);
    setMessage(null);

    try {
      const response = await fetch("/api/subscription/reactivate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          subscriptionId: subscription.id,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to reactivate subscription");
      }

      window.location.reload();
    } catch (error) {
      setMessage({
        type: "error",
        text: error instanceof Error ? error.message : "Failed to reactivate subscription",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Crown className="h-8 w-8 text-primary" />
            <h1 className="text-4xl font-bold">Premium Subscription</h1>
          </div>
          <p className="text-xl text-muted-foreground mb-4">
            Unlock unlimited access to all courses and premium features
          </p>
          <div className="flex items-center justify-center gap-2">
            <PremiumBadge showTooltip={false} />
            <span className="text-sm text-muted-foreground">
              Join thousands of learners advancing their skills
            </span>
          </div>
        </div>

        {/* Alerts */}
        {message && (
          <Alert variant={message.type === "error" ? "destructive" : "default"} className="mb-8">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{message.text}</AlertDescription>
          </Alert>
        )}

        {/* Current Subscription Status */}
        {subscription && (
          <div className="mb-12">
            <h2 className="text-2xl font-semibold mb-6">Your Subscription</h2>
            <SubscriptionStatus
              subscription={subscription}
              onCancel={handleCancel}
              onReactivate={handleReactivate}
              isCancelling={isLoading}
              isReactivating={isLoading}
            />
          </div>
        )}

        {/* Pricing Plans */}
        <div className="mb-12">
          <h2 className="text-2xl font-semibold mb-6 text-center">
            {subscription ? "Change Your Plan" : "Choose Your Plan"}
          </h2>
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {Object.values(SUBSCRIPTION_PLANS).map((plan) => (
              <SubscriptionCard
                key={plan.id}
                plan={plan}
                currentPlan={subscription?.planType}
                onSubscribe={handleSubscribe}
                isLoading={isLoading}
              />
            ))}
          </div>
        </div>

        {/* Features Comparison */}
        <div className="bg-muted/50 rounded-lg p-8">
          <h2 className="text-2xl font-semibold mb-6 text-center">
            What's Included in Premium?
          </h2>
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <div>
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-500" />
                All Courses Access
              </h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• Unlimited access to 100+ courses</li>
                <li>• New courses added monthly</li>
                <li>• All skill levels covered</li>
                <li>• Downloadable resources</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-500" />
                Premium Benefits
              </h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• Certificate of completion</li>
                <li>• Priority customer support</li>
                <li>• Early access to new content</li>
                <li>• Exclusive workshops & events</li>
              </ul>
            </div>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="mt-12 text-center">
          <p className="text-muted-foreground">
            Questions?{" "}
            <a href="/faq" className="text-primary hover:underline">
              Check our FAQ
            </a>{" "}
            or{" "}
            <a href="/contact" className="text-primary hover:underline">
              contact support
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
