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
  tier: "STARTER" | "PROFESSIONAL" | "FOUNDER";
  inventory?: number | null;
}

type CourseOwnershipResponse = {
  owned?: boolean;
  hasAccess?: boolean;
  accessSource?: "admin" | "purchase" | "subscription" | "free" | "none";
};

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
  const isFreeCourse = priceCents === 0;
  const [isOwned, setIsOwned] = useState(false);
  const [hasAccess, setHasAccess] = useState(isFreeCourse);
  const [accessSource, setAccessSource] = useState<CourseOwnershipResponse["accessSource"]>(
    isFreeCourse ? "free" : "none"
  );
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    async function checkOwnership() {
      if (status === "loading") return;

      if (!session?.user) {
        setIsChecking(false);
        setIsOwned(false);
        setHasAccess(isFreeCourse);
        setAccessSource(isFreeCourse ? "free" : "none");
        return;
      }

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
        setIsChecking(false);
      }
    }

    checkOwnership();
  }, [courseId, isFreeCourse, session, status]);

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

  // User already owns the course or currently has access via subscription
  if (isOwned || hasAccess) {
    return (
      <div className="ui-surface flex flex-col gap-4 rounded-[var(--radius-md)] border p-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-success/10 text-success">
            <CheckCircle className="h-5 w-5" />
          </div>
          <div className="space-y-0.5">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Access</p>
            <p className="text-sm font-semibold text-foreground">
              {isOwned
                ? "Owned Lifetime"
                : accessSource === "subscription"
                  ? "Active Subscription"
                  : accessSource === "free"
                    ? "Free Access"
                    : "Available"}
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

  return (
    <div className="grid gap-4">
      {tier !== "STARTER" ? (
        <div className="ui-surface rounded-[var(--radius-md)] border p-4">
          <div className="mb-2 flex items-center gap-2">
            <Badge variant="secondary">{tier === "FOUNDER" ? "Founder" : "Professional"}</Badge>
            <p className="text-sm font-semibold">Purchase or subscribe</p>
          </div>
          <p className="text-sm text-muted-foreground">
            Buy this course for lifetime access, or keep an active{" "}
            {tier === "FOUNDER" ? "Founder" : "Professional"} subscription for plan-based access.
          </p>
        </div>
      ) : null}

      <div className="grid gap-2 sm:grid-cols-2">
        <AddToCartButton
          courseId={courseId}
          courseSlug={courseSlug}
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
    </div>
  );
}
