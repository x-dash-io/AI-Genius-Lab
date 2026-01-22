"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Cart } from "@/lib/cart/types";
import { useCart } from "./CartProvider";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ShoppingCart, Trash2, ArrowRight, BookOpen, Loader2 } from "lucide-react";
import { toast } from "@/lib/toast";

interface CartClientProps {
  initialCart: Cart;
  isAuthenticated: boolean;
}

export function CartClient({ initialCart, isAuthenticated }: CartClientProps) {
  const router = useRouter();
  const { cart, removeFromCart, clearCart, isLoading } = useCart();
  const [isRemoving, setIsRemoving] = useState<string | null>(null);
  const [isCheckingOut, setIsCheckingOut] = useState(false);

  const displayCart = cart.items.length > 0 ? cart : initialCart;

  const handleRemove = async (courseId: string) => {
    setIsRemoving(courseId);
    try {
      await removeFromCart(courseId);
    } finally {
      setIsRemoving(null);
    }
  };

  const handleCheckout = async () => {
    if (!isAuthenticated) {
      router.push(`/sign-in?callbackUrl=${encodeURIComponent("/cart")}`);
      return;
    }

    setIsCheckingOut(true);
    try {
      // Redirect to checkout with cart items
      const courseIds = displayCart.items.map((item) => item.courseId).join(",");
      router.push(`/checkout?items=${encodeURIComponent(courseIds)}`);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to proceed to checkout",
        variant: "destructive",
      });
      setIsCheckingOut(false);
    }
  };

  const handleClearCart = async () => {
    if (confirm("Are you sure you want to clear your cart?")) {
      await clearCart();
      router.push("/courses");
    }
  };

  if (displayCart.items.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <ShoppingCart className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">Your cart is empty</h3>
          <p className="text-muted-foreground mb-4">
            Add courses to your cart to get started
          </p>
          <Link href="/courses">
            <Button>Browse Courses</Button>
          </Link>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid gap-6 md:grid-cols-3">
      {/* Cart Items */}
      <div className="md:col-span-2 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">
            {displayCart.items.length} {displayCart.items.length === 1 ? "Course" : "Courses"}
          </h2>
          <Button variant="ghost" size="sm" onClick={handleClearCart}>
            <Trash2 className="h-4 w-4 mr-2" />
            Clear Cart
          </Button>
        </div>

        <AnimatePresence mode="popLayout">
          {displayCart.items.map((item, index) => (
            <motion.div
              key={item.courseId}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, x: -100 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-start gap-4">
                    <div className="flex-1">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <Link
                            href={`/courses/${item.courseSlug}`}
                            className="text-lg font-semibold hover:underline"
                          >
                            {item.title}
                          </Link>
                          <div className="mt-2 flex items-center gap-2">
                            <Badge variant="secondary">
                              ${(item.priceCents / 100).toFixed(2)}
                            </Badge>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleRemove(item.courseId)}
                          disabled={isRemoving === item.courseId}
                        >
                          {isRemoving === item.courseId ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Trash2 className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </AnimatePresence>
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
              {displayCart.items.map((item) => (
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
              <span>${(displayCart.totalCents / 100).toFixed(2)}</span>
            </div>

            <Button
              size="lg"
              className="w-full"
              onClick={handleCheckout}
              disabled={isCheckingOut || isLoading}
            >
              {isCheckingOut ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  Proceed to Checkout
                  <ArrowRight className="h-4 w-4 ml-2" />
                </>
              )}
            </Button>

            {!isAuthenticated && (
              <p className="text-xs text-center text-muted-foreground">
                You'll be asked to sign in before checkout
              </p>
            )}

            <Link href="/courses">
              <Button variant="outline" className="w-full">
                <BookOpen className="h-4 w-4 mr-2" />
                Continue Shopping
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
