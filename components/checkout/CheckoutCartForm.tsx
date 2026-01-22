"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CartItem } from "@/lib/cart/types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Loader2, ShoppingCart } from "lucide-react";
import { toast } from "@/lib/toast";
import Link from "next/link";

interface CheckoutCartFormProps {
  items: CartItem[];
}

export function CheckoutCartForm({ items }: CheckoutCartFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const totalCents = items.reduce((sum, item) => sum + item.priceCents, 0);

  const handleCheckout = async () => {
    setIsSubmitting(true);
    try {
      const response = await fetch("/api/checkout/cart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          courseIds: items.map((item) => item.courseId),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to start checkout");
      }

      if (data.approvalUrl) {
        window.location.href = data.approvalUrl;
      } else {
        throw new Error("No PayPal approval URL received");
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to start checkout";
      toast({
        title: "Checkout Error",
        description: errorMessage,
        variant: "destructive",
      });
      setIsSubmitting(false);
    }
  };

  return (
    <div className="grid gap-6 md:grid-cols-3">
      {/* Order Items */}
      <div className="md:col-span-2 space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Order Items</CardTitle>
            <CardDescription>
              {items.length} {items.length === 1 ? "course" : "courses"} in your order
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {items.map((item) => (
                <div
                  key={item.courseId}
                  className="flex items-start justify-between rounded-lg border p-4"
                >
                  <div className="flex-1">
                    <h3 className="font-semibold">{item.title}</h3>
                    <Badge variant="secondary" className="mt-2">
                      ${(item.priceCents / 100).toFixed(2)}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Order Summary */}
      <div className="md:col-span-1">
        <Card className="sticky top-24">
          <CardHeader>
            <CardTitle>Order Summary</CardTitle>
            <CardDescription>Review your order details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              {items.map((item) => (
                <div key={item.courseId} className="flex justify-between text-sm">
                  <span className="text-muted-foreground truncate flex-1 mr-2">
                    {item.title}
                  </span>
                  <span className="font-medium">${(item.priceCents / 100).toFixed(2)}</span>
                </div>
              ))}
            </div>

            <Separator />

            <div className="flex justify-between text-lg font-semibold">
              <span>Total</span>
              <span>${(totalCents / 100).toFixed(2)}</span>
            </div>

            <Button
              size="lg"
              className="w-full"
              onClick={handleCheckout}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <ShoppingCart className="h-4 w-4 mr-2" />
                  Pay with PayPal · ${(totalCents / 100).toFixed(2)}
                </>
              )}
            </Button>

            <Link href="/cart">
              <Button variant="outline" className="w-full">
                Back to Cart
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
