"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { AddToCartButton } from "@/components/cart/AddToCartButton";
import { useCart } from "@/components/cart/CartProvider";
import { CheckCircle, BookOpen, Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface CourseActionsProps {
  courseId: string;
  courseSlug: string;
  priceCents: number;
  tier: "STANDARD" | "PREMIUM";
  inventory?: number | null;
}

export function CourseActions({
  courseId,
  courseSlug,
  priceCents,
  tier,
  inventory,
}: CourseActionsProps) {
  const router = useRouter();
  const { addToCart, cart } = useCart();
  const { data: session, status } = useSession();
  const [isOwned, setIsOwned] = useState(false);
  const [subscription, setSubscription] = useState<any>(null);
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    async function checkOwnership() {
      if (status === "loading") return;

      if (!session?.user) {
        setIsChecking(false);
        setIsOwned(false);
        return;
      }

      try {
        const [ownershipRes, subRes] = await Promise.all([
          fetch(`/api/courses/${courseId}/ownership`),
          fetch(`/api/subscriptions/current`)
        ]);

        if (ownershipRes.ok) {
          const data = await ownershipRes.json();
          setIsOwned(data.owned);
        }

        if (subRes.ok) {
          const data = await subRes.json();
          setSubscription(data.subscription);
        }
      } catch (error) {
        console.error("Failed to check ownership:", error);
      } finally {
        setIsChecking(false);
      }
    }

    checkOwnership();
  }, [courseId, session, status]);

  // Show loading state while checking
  if (isChecking && status !== "unauthenticated") {
    return (
      <div className="flex flex-wrap gap-3">
        <Button variant="outline" size="lg" disabled>
          <Loader2 className="h-5 w-5 mr-3 animate-spin" />
          Checking access...
        </Button>
      </div>
    );
  }

  // User doesn't own - check subscription access
  const isPremium = tier === "PREMIUM";
  const planTier = subscription?.plan?.tier;
  const hasProAccess = planTier === "pro" || planTier === "elite";
  const hasStandardAccess = planTier === "starter" || hasProAccess;

  const hasAccessViaSubscription =
    (tier === "STANDARD" && hasStandardAccess) ||
    (tier === "PREMIUM" && hasProAccess);

  // User already owns the course or has access via subscription
  if (isOwned || hasAccessViaSubscription) {
    return (
      <div className="ui-surface flex flex-col gap-4 rounded-[var(--radius-md)] border p-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-success/10 text-success">
            <CheckCircle className="h-5 w-5" />
          </div>
          <div className="space-y-0.5">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Access</p>
            <p className="text-sm font-semibold text-foreground">
              {isOwned ? "Personal License" : "Active Subscription"}
            </p>
          </div>
        </div>

        <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
          <Link href={`/library/${courseSlug}`} className="w-full sm:w-auto">
            <Button size="lg" variant="premium" className="w-full sm:w-auto">
              <BookOpen className="h-4 w-4 mr-2" />
              Open Course
            </Button>
          </Link>
          <Link href="/library" className="w-full sm:w-auto">
            <Button variant="outline" size="lg" className="w-full sm:w-auto">
              My Library
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  // If it's a premium course and user doesn't have Pro/Elite subscription
  if (isPremium && !hasProAccess) {
    return (
      <div className="grid gap-4">
        <div className="ui-surface rounded-[var(--radius-md)] border p-4">
          <div className="mb-2 flex items-center gap-2">
            <Badge variant="secondary">Premium</Badge>
            <p className="text-sm font-semibold">Subscription required</p>
          </div>
          <p className="text-sm text-muted-foreground">
            Upgrade to a supported subscription tier to unlock this premium course.
          </p>
        </div>
        <div className="grid gap-2 sm:grid-cols-2">
          <Link href="/pricing" className="flex-1">
            <Button size="lg" variant="premium" className="w-full">
              Upgrade to Unlock
            </Button>
          </Link>
          <Link href="/courses" className="flex-1">
            <Button variant="outline" size="lg" className="w-full">
              Browse Catalog
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="grid gap-2 sm:grid-cols-2">
      <AddToCartButton
        courseId={courseId}
        priceCents={priceCents}
        inventory={inventory}
        variant="premium"
        className="w-full"
      />
      <Button
        size="lg"
        variant="outline"
        className="w-full"
        onClick={async () => {
          try {
            const isInCart = cart.items.some((item) => item.courseId === courseId);
            if (!isInCart) {
              await addToCart(courseId);
            }
            router.push("/cart");
          } catch {}
        }}
        disabled={isChecking}
      >
        Instant Checkout
      </Button>
    </div>
  );
}
