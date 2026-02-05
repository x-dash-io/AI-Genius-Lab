"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { AddToCartButton } from "@/components/cart/AddToCartButton";
import { useCart } from "@/components/cart/CartProvider";
import { CheckCircle, BookOpen, Loader2 } from "lucide-react";

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
      <div className="flex flex-wrap gap-4">
        <Button size="lg" disabled>
          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          Checking...
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
      <div className="flex flex-wrap gap-4">
        <div className="flex items-center gap-2 rounded-lg bg-green-500/10 border border-green-500/20 px-4 py-2">
          <CheckCircle className="h-5 w-5 text-green-500" />
          <span className="text-sm font-medium text-green-600 dark:text-green-400">
            {isOwned ? "You own this course" : "Included with your subscription"}
          </span>
        </div>
        <Link href={`/library/${courseSlug}`}>
          <Button size="lg" className="bg-green-600 hover:bg-green-700">
            <BookOpen className="h-4 w-4 mr-2" />
            Go to Course
          </Button>
        </Link>
        <Link href="/library">
          <Button variant="outline" size="lg">
            View Library
          </Button>
        </Link>
      </div>
    );
  }

  // If it's a premium course and user doesn't have Pro/Elite subscription
  if (isPremium && !hasProAccess) {
    return (
      <div className="flex flex-col gap-4">
        <div className="p-4 rounded-lg bg-amber-500/10 border border-amber-500/20">
          <p className="text-sm font-medium text-amber-600 dark:text-amber-400">
            This is a <span className="font-bold uppercase">Premium</span> course. It is available exclusively to Pro and Elite subscribers.
          </p>
        </div>
        <div className="flex flex-wrap gap-4">
          <Link href="/pricing">
            <Button size="lg" className="bg-primary hover:bg-primary/90">
              Upgrade to Pro to Access
            </Button>
          </Link>
          <Link href="/courses">
            <Button variant="outline" size="lg">
              Back to catalog
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-wrap gap-4">
      <AddToCartButton
        courseId={courseId}
        priceCents={priceCents}
        inventory={inventory}
        size="lg"
      />
      <Button
        size="lg"
        variant="outline"
        onClick={async () => {
          try {
            // Check if already in cart to avoid duplicate/quantity increase
            const isInCart = cart.items.some((item) => item.courseId === courseId);

            if (!isInCart) {
              await addToCart(courseId);
            }
            // Then redirect to cart
            router.push("/cart");
          } catch (error) {
            // Error already handled by toast in addToCart, but we might want to stay here
          }
        }}
        disabled={isChecking}
      >
        Buy Now · ${(priceCents / 100).toFixed(2)}
      </Button>
      <Link href="/courses">
        <Button variant="outline" size="lg">
          Back to catalog
        </Button>
      </Link>
    </div>
  );
}
