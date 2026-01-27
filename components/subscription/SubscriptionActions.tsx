// components/subscription/SubscriptionActions.tsx
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "@/lib/toast";

interface SubscriptionActionsProps {
  action: "subscribe" | "cancel";
  planId?: string;
}

export default function SubscriptionActions({ action, planId }: SubscriptionActionsProps) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubscribe = async () => {
    if (!planId) return;
    setLoading(true);
    try {
      const response = await fetch("/api/subscription/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ planId }),
      });

      const data = await response.json();

      if (!response.ok) throw new Error(data.error || "Failed to start checkout");

      if (data.approvalUrl) {
        window.location.href = data.approvalUrl;
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
      setLoading(false);
    }
  };

  const handleCancel = async () => {
    if (!confirm("Are you sure you want to cancel your subscription? You will lose access at the end of your billing period.")) {
      return;
    }
    
    setLoading(true);
    try {
      const response = await fetch("/api/subscription/cancel", {
        method: "POST",
      });

      const data = await response.json();

      if (!response.ok) throw new Error(data.error || "Failed to cancel subscription");

      toast({
        title: "Subscription Cancelled",
        description: "Your subscription has been cancelled successfully.",
        variant: "default",
      });
      
      router.refresh();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (action === "cancel") {
    return (
      <Button 
        variant="destructive" 
        onClick={handleCancel} 
        disabled={loading}
      >
        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        Cancel Subscription
      </Button>
    );
  }

  return (
    <Button 
      className="w-full" 
      onClick={handleSubscribe} 
      disabled={loading}
      variant={planId === "annual" ? "default" : "outline"}
    >
      {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
      Subscribe Now
    </Button>
  );
}
