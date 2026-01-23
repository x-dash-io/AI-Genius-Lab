"use client";

import { useState, useMemo, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Cart, CartItem } from "@/lib/cart/types";
import { isCartItemValid, canIncreaseQuantity } from "@/lib/cart/validation";
import { useCart } from "./CartProvider";
import { useAdminPreview } from "@/components/admin/PreviewBanner";
import { useConfirmDialog } from "@/components/ui/confirm-dialog";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ShoppingCart, Trash2, ArrowRight, BookOpen, Loader2, Plus, Minus, AlertCircle, ShieldAlert } from "lucide-react";
import { toast } from "@/lib/toast";
import { Skeleton } from "@/components/ui/skeleton";

interface CartClientProps {
  initialCart: Cart;
  isAuthenticated: boolean;
}

export function CartClient({ initialCart, isAuthenticated }: CartClientProps) {
  const router = useRouter();
  const { cart, removeFromCart, updateQuantity, clearCart, isLoading } = useCart();
  const { isAdminPreview } = useAdminPreview();
  const { confirm } = useConfirmDialog();
  const [isRemoving, setIsRemoving] = useState<string | null>(null);
  const [isUpdating, setIsUpdating] = useState<string | null>(null);
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [isClearing, setIsClearing] = useState(false);
  
  // Track if the cart context has loaded - only use initialCart during initial load
  const hasCartLoaded = useRef(false);
  if (!isLoading && !hasCartLoaded.current) {
    hasCartLoaded.current = true;
  }
  
  // Use cart from context once loaded, only fallback to initialCart during initial loading
  const displayCart = hasCartLoaded.current ? cart : (cart.items.length > 0 ? cart : initialCart);
  
  // Validate all cart items
  const invalidItems = useMemo(() => {
    return displayCart.items.filter(item => !isCartItemValid(item));
  }, [displayCart.items]);
  
  const hasInvalidItems = invalidItems.length > 0;

  const handleRemove = async (courseId: string) => {
    setIsRemoving(courseId);
    try {
      await removeFromCart(courseId);
    } finally {
      setIsRemoving(null);
    }
  };

  const handleQuantityChange = async (courseId: string, newQuantity: number) => {
    setIsUpdating(courseId);
    try {
      await updateQuantity(courseId, newQuantity);
    } catch (error) {
      // Error toast is handled in CartProvider
    } finally {
      setIsUpdating(null);
    }
  };

  const handleIncreaseQuantity = async (item: CartItem) => {
    const newQuantity = (item.quantity || 1) + 1;
    // Check inventory limits
    if (item.availableInventory !== null && newQuantity > item.availableInventory) {
      toast({
        title: "Inventory Limit",
        description: `Only ${item.availableInventory} available`,
        variant: "destructive",
      });
      return;
    }
    await handleQuantityChange(item.courseId, newQuantity);
  };

  const handleDecreaseQuantity = async (item: CartItem) => {
    const newQuantity = Math.max(1, (item.quantity || 1) - 1);
    await handleQuantityChange(item.courseId, newQuantity);
  };

  const handleCheckout = async () => {
    // Prevent admin checkout in preview mode
    if (isAdminPreview) {
      toast({
        title: "Preview Mode",
        description: "Checkout is disabled in admin preview mode. This is a read-only preview of the customer experience.",
        variant: "destructive",
      });
      return;
    }

    if (!isAuthenticated) {
      router.push(`/sign-in?callbackUrl=${encodeURIComponent("/cart")}`);
      return;
    }

    // Prevent checkout if there are invalid items
    if (hasInvalidItems) {
      toast({
        title: "Cannot Checkout",
        description: "Some items in your cart are out of stock. Please remove them before checkout.",
        variant: "destructive",
      });
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
    const confirmed = await confirm({
      title: "Clear Shopping Cart",
      description: "Are you sure you want to remove all items from your cart? This action cannot be undone.",
      confirmText: "Clear Cart",
      cancelText: "Keep Items",
      variant: "destructive",
    });

    if (confirmed) {
      setIsClearing(true);
      try {
        await clearCart();
        // Small delay to ensure state is updated before redirect
        setTimeout(() => {
          router.push("/courses");
        }, 100);
      } catch (error) {
        // Error is handled by toast in CartProvider
      } finally {
        setIsClearing(false);
      }
    }
  };

  // Show loading state
  if (isLoading) {
    return (
      <div className="grid gap-6 md:grid-cols-3">
        <div className="md:col-span-2 space-y-4">
          <Skeleton className="h-8 w-48" />
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardContent className="pt-6">
                <div className="flex items-start gap-4">
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-6 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                    <Skeleton className="h-4 w-1/4" />
                  </div>
                  <Skeleton className="h-8 w-24" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
        <div className="md:col-span-1">
          <Card className="sticky top-24">
            <CardHeader>
              <Skeleton className="h-6 w-32" />
              <Skeleton className="h-4 w-48 mt-2" />
            </CardHeader>
            <CardContent className="space-y-4">
              <Skeleton className="h-20 w-full" />
              <Skeleton className="h-12 w-full" />
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

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
          <Button variant="ghost" size="sm" onClick={handleClearCart} disabled={isLoading || isClearing}>
            {isClearing ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Trash2 className="h-4 w-4 mr-2" />
            )}
            Clear Cart
          </Button>
        </div>

        {/* Invalid Items Warning */}
        {hasInvalidItems && (
          <Card className="border-destructive">
            <CardContent className="pt-6">
              <div className="flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-destructive mt-0.5" />
                <div className="flex-1">
                  <h3 className="font-semibold text-destructive mb-1">Some items are unavailable</h3>
                  <p className="text-sm text-muted-foreground">
                    {invalidItems.length} {invalidItems.length === 1 ? "item" : "items"} in your cart {invalidItems.length === 1 ? "is" : "are"} out of stock. Please remove {invalidItems.length === 1 ? "it" : "them"} before checkout.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <AnimatePresence mode="popLayout">
          {displayCart.items.map((item, index) => (
            <motion.div
              key={item.courseId}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, x: -100 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className={!isCartItemValid(item) ? "border-destructive opacity-75" : ""}>
                <CardContent className="pt-6">
                  <div className="flex items-start gap-4">
                    <div className="flex-1">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <Link
                              href={`/courses/${item.courseSlug}`}
                              className="text-lg font-semibold hover:underline"
                            >
                              {item.title}
                            </Link>
                            {!isCartItemValid(item) && (
                              <Badge variant="destructive" className="text-xs">
                                Out of Stock
                              </Badge>
                            )}
                          </div>
                          <div className="mt-2 flex items-center gap-3 flex-wrap">
                            <Badge variant="secondary">
                              ${(item.priceCents / 100).toFixed(2)}
                            </Badge>
                            {item.availableInventory !== null && (
                              <span className={`text-xs ${!isCartItemValid(item) ? "text-destructive font-medium" : "text-muted-foreground"}`}>
                                {item.availableInventory === 0 
                                  ? "Out of stock" 
                                  : `${item.availableInventory} available`}
                              </span>
                            )}
                            {item.availableInventory !== null && item.quantity > item.availableInventory && (
                              <Badge variant="destructive" className="text-xs">
                                Quantity exceeds inventory
                              </Badge>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {/* Quantity Controls */}
                          <div className={`flex items-center gap-1 border rounded-md ${!isCartItemValid(item) ? "opacity-50" : ""}`}>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => handleDecreaseQuantity(item)}
                              disabled={
                                isUpdating === item.courseId || 
                                (item.quantity || 1) <= 1 ||
                                !isCartItemValid(item)
                              }
                            >
                              {isUpdating === item.courseId ? (
                                <Loader2 className="h-3 w-3 animate-spin" />
                              ) : (
                                <Minus className="h-3 w-3" />
                              )}
                            </Button>
                            <span className="px-3 py-1 text-sm font-medium min-w-[2rem] text-center">
                              {item.quantity || 1}
                            </span>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => handleIncreaseQuantity(item)}
                              disabled={
                                isUpdating === item.courseId ||
                                !isCartItemValid(item) ||
                                !canIncreaseQuantity(item)
                              }
                            >
                              {isUpdating === item.courseId ? (
                                <Loader2 className="h-3 w-3 animate-spin" />
                              ) : (
                                <Plus className="h-3 w-3" />
                              )}
                            </Button>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleRemove(item.courseId)}
                            disabled={isRemoving === item.courseId || isLoading}
                          >
                            {isRemoving === item.courseId ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <Trash2 className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                      </div>
                      <div className={`mt-2 text-sm ${!isCartItemValid(item) ? "text-destructive" : "text-muted-foreground"}`}>
                        Subtotal: ${(((item.priceCents || 0) * (item.quantity || 1)) / 100).toFixed(2)}
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
                  <div className="flex-1 mr-2 min-w-0">
                    <div className="text-muted-foreground truncate">{item.title}</div>
                    {item.quantity > 1 && (
                      <div className="text-xs text-muted-foreground">
                        Qty: {item.quantity} × ${(item.priceCents / 100).toFixed(2)}
                      </div>
                    )}
                  </div>
                  <span className="font-medium whitespace-nowrap">
                    ${(((item.priceCents || 0) * (item.quantity || 1)) / 100).toFixed(2)}
                  </span>
                </div>
              ))}
            </div>

            <Separator />

            <div className="flex justify-between text-lg font-semibold">
              <span>Total</span>
              <span>${(displayCart.totalCents / 100).toFixed(2)}</span>
            </div>

            {isAdminPreview && (
              <div className="flex items-center gap-2 p-3 rounded-lg bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 mb-2">
                <ShieldAlert className="h-4 w-4 text-amber-600 dark:text-amber-400 shrink-0" />
                <p className="text-xs text-amber-700 dark:text-amber-300">
                  Checkout disabled in preview mode
                </p>
              </div>
            )}

            <Button
              size="lg"
              className="w-full"
              onClick={handleCheckout}
              disabled={isCheckingOut || isLoading || hasInvalidItems || isAdminPreview}
            >
              {isCheckingOut ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Processing...
                </>
              ) : isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Loading...
                </>
              ) : isAdminPreview ? (
                <>
                  <ShieldAlert className="h-4 w-4 mr-2" />
                  Preview Only
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
