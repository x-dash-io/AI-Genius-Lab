"use client";

import { useState, useMemo, useEffect } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ShoppingCart, Loader2, Check, X, BookOpen } from "lucide-react";
import { useCart } from "./CartProvider";
import { cn } from "@/lib/utils";

interface AddToCartButtonProps {
  courseId: string;
  courseSlug?: string; // Optional: for linking to library
  priceCents: number;
  inventory?: number | null; // null = unlimited
  variant?: "default" | "outline" | "ghost" | "destructive" | "secondary" | "link" | "premium";
  size?: "default" | "sm" | "lg" | "icon";
  className?: string;
  checkOwnership?: boolean; // If true, checks if user already owns the course
  tier?: "STARTER" | "PROFESSIONAL" | "FOUNDER";
}

type CourseOwnershipResponse = {
  owned?: boolean;
  hasAccess?: boolean;
  accessSource?: "admin" | "purchase" | "subscription" | "free" | "none";
};

export function AddToCartButton({
  courseId,
  courseSlug,
  priceCents,
  inventory,
  variant = "premium",
  size = "default",
  className,
  checkOwnership = false,
}: AddToCartButtonProps) {
  const { data: session } = useSession();
  const { cart, addToCart, isLoading } = useCart();
  const [isAdding, setIsAdding] = useState(false);
  const [isAdded, setIsAdded] = useState(false);
  const [isOwned, setIsOwned] = useState(false);
  const [hasAccess, setHasAccess] = useState(false);
  const [accessSource, setAccessSource] = useState<CourseOwnershipResponse["accessSource"]>("none");
  const [isCheckingOwnership, setIsCheckingOwnership] = useState(checkOwnership);

  // Check ownership if enabled
  useEffect(() => {
    if (!checkOwnership || !session?.user) {
      setIsCheckingOwnership(false);
      return;
    }

    async function checkCourseOwnership() {
      try {
        const ownershipRes = await fetch(`/api/courses/${courseId}/ownership`);

        if (ownershipRes.ok) {
          const data = (await ownershipRes.json()) as CourseOwnershipResponse;
          setIsOwned(data.owned === true);
          setHasAccess(data.hasAccess === true || data.owned === true);
          setAccessSource(data.accessSource ?? "none");
        }
      } catch (error) {
        console.error("Failed to check ownership:", error);
      } finally {
        setIsCheckingOwnership(false);
      }
    }

    checkCourseOwnership();
  }, [courseId, session, checkOwnership]);

  const cartItem = cart.items.find((item) => item.courseId === courseId);
  const isInCart = !!cartItem;
  const currentQuantity = cartItem?.quantity || 0;

  // Check if we can add more (inventory check)
  const canAddMore = useMemo(() => {
    if (inventory === null) return true; // Unlimited inventory
    if (inventory === undefined) return true; // Inventory not provided, assume available
    return currentQuantity < inventory;
  }, [inventory, currentQuantity]);

  const isOutOfStock = inventory !== null && inventory !== undefined && inventory === 0;
  const addToCartLabel = `Add to Cart · $${(priceCents / 100).toFixed(2)}`;

  const handleAddToCart = async () => {
    if (isInCart && !canAddMore) return;
    if (isOutOfStock) return;

    setIsAdding(true);
    try {
      await addToCart(courseId);
      setIsAdded(true);
      setTimeout(() => setIsAdded(false), 2000);
    } catch {
      // Error is handled by toast in addToCart
    } finally {
      setIsAdding(false);
    }
  };

  if (isCheckingOwnership) {
    return (
      <Button variant="outline" size={size} className={cn(className, "rounded-xl")} disabled>
        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
        Syncing...
      </Button>
    );
  }

  // User already owns or can access this course (subscription/admin)
  if (isOwned || hasAccess) {
    return (
      <Link href={courseSlug ? `/library/${courseSlug}` : "/library"} className={className}>
        <Button variant="secondary" size={size} className="w-full rounded-xl font-bold">
          <BookOpen className="h-4 w-4 mr-2" />
          {isOwned
            ? "Continue Learning"
            : accessSource === "subscription"
              ? "Included in Plan"
              : accessSource === "free"
                ? "Free Access"
              : "Open Course"}
        </Button>
      </Link>
    );
  }

  if (isOutOfStock) {
    return (
      <Button variant="outline" size={size} className={cn(className, "rounded-xl opacity-50")} disabled>
        <X className="h-4 w-4 mr-2 font-bold" />
        Sold Out
      </Button>
    );
  }

  if (priceCents === 0) {
    const libraryHref = courseSlug ? `/library/${courseSlug}` : "/library";
    const freeCourseHref = session?.user
      ? libraryHref
      : `/sign-in?next=${encodeURIComponent(libraryHref)}`;

    return (
      <Link href={freeCourseHref} className={className}>
        <Button variant="secondary" size={size} className="w-full rounded-xl font-bold">
          <BookOpen className="h-4 w-4 mr-2" />
          {session?.user ? "Free Access" : "Sign in for free access"}
        </Button>
      </Link>
    );
  }

  if (isInCart) {
    return (
      <Link href="/cart" className={className}>
        <Button variant="outline" size={size} className="w-full rounded-xl font-bold">
          <Check className="h-4 w-4 mr-2" />
          In Cart
        </Button>
      </Link>
    );
  }

  return (
    <Button
      variant={variant}
      size={size}
      className={cn(className, "rounded-xl font-bold transition-all active:scale-95")}
      onClick={handleAddToCart}
      disabled={isAdding || isAdded || isLoading || !canAddMore}
    >
      {isAdding || isLoading ? (
        <>
          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          Processing
        </>
      ) : isAdded ? (
        <>
          <Check className="h-4 w-4 mr-2" />
          Added
        </>
      ) : (
        <div className="flex items-center justify-center gap-2">
          <ShoppingCart className="h-4 w-4" />
          <span>{addToCartLabel}</span>
        </div>
      )}
    </Button>
  );
}
