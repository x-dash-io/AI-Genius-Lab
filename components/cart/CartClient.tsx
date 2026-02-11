"use client";

import { useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import {
  AlertCircle,
  ArrowRight,
  BookOpen,
  Loader2,
  ShieldAlert,
  ShoppingCart,
  Tag,
  Trash2,
  X,
} from "lucide-react";
import { Cart } from "@/lib/cart/types";
import { isCartItemValid } from "@/lib/cart/validation";
import { useCart } from "./CartProvider";
import { useAdminPreview } from "@/components/admin/PreviewBanner";
import { useConfirmDialog } from "@/components/ui/confirm-dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "@/lib/toast";

interface CartClientProps {
  initialCart: Cart;
  isAuthenticated: boolean;
}

export function CartClient({ initialCart, isAuthenticated }: CartClientProps) {
  const router = useRouter();
  const { cart, removeFromCart, clearCart, applyCoupon, removeCoupon, isLoading } = useCart();
  const { isAdminPreview } = useAdminPreview();
  const { confirm } = useConfirmDialog();
  const [isRemoving, setIsRemoving] = useState<string | null>(null);
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [isClearing, setIsClearing] = useState(false);
  const [couponCode, setCouponCode] = useState("");
  const [isApplyingCoupon, setIsApplyingCoupon] = useState(false);

  const hasCartLoaded = useRef(false);
  if (!isLoading && !hasCartLoaded.current) {
    hasCartLoaded.current = true;
  }

  const displayCart = hasCartLoaded.current ? cart : (cart.items.length > 0 ? cart : initialCart);

  const invalidItems = useMemo(
    () => displayCart.items.filter((item) => !isCartItemValid(item)),
    [displayCart.items]
  );
  const hasInvalidItems = invalidItems.length > 0;

  const handleRemove = async (courseId: string) => {
    setIsRemoving(courseId);
    try {
      await removeFromCart(courseId);
    } finally {
      setIsRemoving(null);
    }
  };

  const handleCheckout = async () => {
    if (isAdminPreview) {
      toast({
        title: "Preview mode",
        description: "Checkout is disabled while using admin preview mode.",
        variant: "warning",
      });
      return;
    }

    if (!isAuthenticated) {
      router.push(`/sign-in?callbackUrl=${encodeURIComponent("/cart")}`);
      return;
    }

    if (hasInvalidItems) {
      toast({
        title: "Cannot checkout",
        description: "Remove unavailable items before continuing.",
        variant: "destructive",
      });
      return;
    }

    setIsCheckingOut(true);
    try {
      const courseIds = displayCart.items.map((item) => item.courseId).join(",");
      router.push(`/checkout?items=${encodeURIComponent(courseIds)}`);
    } catch {
      toast({
        title: "Checkout failed",
        description: "Unable to proceed to checkout. Please try again.",
        variant: "destructive",
      });
      setIsCheckingOut(false);
    }
  };

  const handleClearCart = async () => {
    const confirmed = await confirm({
      title: "Clear cart",
      description: "Remove all items from your cart?",
      confirmText: "Clear Cart",
      cancelText: "Cancel",
      variant: "destructive",
    });

    if (!confirmed) {
      return;
    }

    setIsClearing(true);
    try {
      await clearCart();
      setCouponCode("");
      setTimeout(() => {
        router.push("/courses");
      }, 100);
    } finally {
      setIsClearing(false);
    }
  };

  const handleApplyCoupon = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!couponCode.trim()) {
      return;
    }

    setIsApplyingCoupon(true);
    try {
      const result = await applyCoupon(couponCode);
      if (result.error) {
        toast({
          title: "Invalid coupon",
          description: result.error,
          variant: "destructive",
        });
      } else {
        setCouponCode("");
      }
    } finally {
      setIsApplyingCoupon(false);
    }
  };

  const handleRemoveCoupon = async () => {
    await removeCoupon();
  };

  if (isLoading) {
    return (
      <div className="grid gap-6 xl:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
        <Card className="ui-surface">
          <CardHeader>
            <Skeleton className="h-6 w-40" />
            <Skeleton className="h-4 w-64" />
          </CardHeader>
          <CardContent className="space-y-3">
            {Array.from({ length: 3 }).map((_, index) => (
              <Skeleton key={`loading-item-${index}`} className="h-20 w-full" />
            ))}
          </CardContent>
        </Card>
        <Card className="ui-surface">
          <CardHeader>
            <Skeleton className="h-6 w-36" />
            <Skeleton className="h-4 w-48" />
          </CardHeader>
          <CardContent className="space-y-3">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!displayCart.items.length) {
    return (
      <EmptyState
        icon={<ShoppingCart className="h-6 w-6" />}
        title="Your cart is empty"
        description="Browse courses and add items to continue checkout."
        action={
          <Link href="/courses">
            <Button variant="premium">
              Browse Courses
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        }
      />
    );
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
      <div className="grid gap-4">
        <Card className="ui-surface">
          <CardHeader className="flex flex-row flex-wrap items-center justify-between gap-3">
            <div>
              <CardTitle>Cart Items</CardTitle>
              <CardDescription>
                {displayCart.items.length} {displayCart.items.length === 1 ? "course" : "courses"} selected
              </CardDescription>
            </div>
            <Button variant="destructive" size="sm" onClick={handleClearCart} disabled={isClearing}>
              {isClearing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Trash2 className="mr-2 h-4 w-4" />}
              Clear Cart
            </Button>
          </CardHeader>
          <CardContent className="space-y-3">
            {hasInvalidItems ? (
              <Alert variant="warning">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  {invalidItems.length} unavailable {invalidItems.length === 1 ? "item is" : "items are"} in your cart.
                  Remove {invalidItems.length === 1 ? "it" : "them"} to proceed.
                </AlertDescription>
              </Alert>
            ) : null}

            <AnimatePresence mode="popLayout">
              {displayCart.items.map((item) => (
                <motion.div
                  key={item.courseId}
                  layout
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -12 }}
                  transition={{ duration: 0.16 }}
                >
                  <div className="rounded-[var(--radius-sm)] border bg-background p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0 flex-1 space-y-2">
                        <div className="flex flex-wrap items-center gap-2">
                          <Link href={`/courses/${item.courseSlug}`} className="truncate text-sm font-semibold hover:underline">
                            {item.title}
                          </Link>
                          {!isCartItemValid(item) ? <Badge variant="destructive">Unavailable</Badge> : null}
                        </div>
                        <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                          <Badge variant="secondary">{`$${(item.priceCents / 100).toFixed(2)}`}</Badge>
                          {item.availableInventory !== null ? (
                            <span>
                              {item.availableInventory === 0
                                ? "Out of stock"
                                : `${item.availableInventory} available`}
                            </span>
                          ) : null}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Subtotal: ${(((item.priceCents || 0) * (item.quantity || 1)) / 100).toFixed(2)}
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleRemove(item.courseId)}
                        disabled={isRemoving === item.courseId}
                        aria-label={`Remove ${item.title}`}
                      >
                        {isRemoving === item.courseId ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Trash2 className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4">
        <Card className="ui-surface xl:sticky xl:top-24">
          <CardHeader>
            <CardTitle>Order Summary</CardTitle>
            <CardDescription>Review totals before checkout.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Subtotal</span>
              <span className="font-semibold">${(displayCart.totalCents / 100).toFixed(2)}</span>
            </div>

            {displayCart.couponCode ? (
              <div className="rounded-[var(--radius-sm)] border bg-background p-2 text-sm">
                <div className="flex items-center justify-between gap-2">
                  <span className="inline-flex items-center gap-2">
                    <Tag className="h-4 w-4" />
                    <span className="font-medium">{displayCart.couponCode}</span>
                  </span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7"
                    onClick={handleRemoveCoupon}
                    aria-label="Remove coupon"
                  >
                    <X className="h-3.5 w-3.5" />
                  </Button>
                </div>
                <p className="mt-2 text-xs text-success">
                  Discount: -${((displayCart.discountTotal || 0) / 100).toFixed(2)}
                </p>
              </div>
            ) : (
              <form onSubmit={handleApplyCoupon} className="flex gap-2">
                <Input
                  placeholder="Coupon code"
                  value={couponCode}
                  onChange={(event) => setCouponCode(event.target.value)}
                />
                <Button type="submit" variant="outline" disabled={isApplyingCoupon || !couponCode.trim()}>
                  {isApplyingCoupon ? <Loader2 className="h-4 w-4 animate-spin" /> : "Apply"}
                </Button>
              </form>
            )}

            <Separator />

            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Total</span>
              <span className="text-xl font-semibold">
                ${((displayCart.finalTotal ?? displayCart.totalCents) / 100).toFixed(2)}
              </span>
            </div>

            {isAdminPreview ? (
              <Alert variant="warning">
                <ShieldAlert className="h-4 w-4" />
                <AlertDescription>Checkout is disabled in preview mode.</AlertDescription>
              </Alert>
            ) : null}

            <Button
              variant="premium"
              size="lg"
              className="w-full"
              onClick={handleCheckout}
              disabled={isCheckingOut || hasInvalidItems || isAdminPreview}
            >
              {isCheckingOut ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  Proceed to Checkout
                  <ArrowRight className="ml-2 h-4 w-4" />
                </>
              )}
            </Button>

            {!isAuthenticated ? (
              <p className="text-center text-xs text-muted-foreground">
                You will be prompted to sign in before payment.
              </p>
            ) : null}

            <Link href="/courses" className="block">
              <Button variant="outline" className="w-full">
                <BookOpen className="mr-2 h-4 w-4" />
                Continue Shopping
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
