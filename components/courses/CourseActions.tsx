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
import { cn } from "@/lib/utils";

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
        <Button variant="outline" size="lg" disabled className="rounded-xl h-14 px-8 border-2">
          <Loader2 className="h-5 w-5 mr-3 animate-spin" />
          Synchronizing...
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
      <div className="flex flex-col sm:flex-row items-center gap-6 p-1 rounded-2xl glass border-white/5 bg-accent/5">
        <div className="flex items-center gap-3 px-6 py-3">
          <div className="h-10 w-10 rounded-full bg-green-500/10 flex items-center justify-center">
            <CheckCircle className="h-6 w-6 text-green-500" />
          </div>
          <div className="space-y-0.5">
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-green-600/60">Access Granted</p>
            <p className="text-sm font-bold text-green-600 dark:text-green-400">
              {isOwned ? "Personal License" : "Active Subscription"}
            </p>
          </div>
        </div>

        <div className="flex gap-3 p-1">
          <Link href={`/library/${courseSlug}`} className="w-full sm:w-auto">
            <Button size="lg" className="w-full sm:w-auto rounded-xl h-12 px-8 font-black bg-green-600 hover:bg-green-700 shadow-xl shadow-green-500/20 group">
              <BookOpen className="h-5 w-5 mr-2 transition-transform group-hover:scale-110" />
              Open Curriculum
            </Button>
          </Link>
          <Link href="/library" className="w-full sm:w-auto hidden md:block">
            <Button variant="outline" size="lg" className="w-full rounded-xl h-12 px-8 border-2 font-bold hover:bg-accent/50">
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
      <div className="flex flex-col gap-6">
        <div className="p-6 rounded-2xl border-2 border-amber-500/20 bg-amber-500/5 backdrop-blur-sm space-y-2">
          <div className="flex items-center gap-2">
            <Badge className="bg-amber-500 text-white font-black px-2 py-0 text-[10px] tracking-widest border-none">PREMIUM</Badge>
            <p className="text-sm font-bold text-amber-600">Exclusive Access Required</p>
          </div>
          <p className="text-sm text-amber-600/80 leading-relaxed font-medium">
            This module is architected for elite practitioners. Secure a <span className="font-bold underline">Pro</span> or <span className="font-bold underline">Elite</span> subscription to unlock full terminal access.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-4">
          <Link href="/pricing" className="flex-1">
            <Button size="lg" className="w-full rounded-xl h-14 font-black bg-amber-500 hover:bg-amber-600 shadow-2xl shadow-amber-500/20">
              Upgrade to Unlock
            </Button>
          </Link>
          <Link href="/courses" className="flex-1">
            <Button variant="outline" size="lg" className="w-full rounded-xl h-14 border-2 font-bold hover:bg-accent/50">
              Browse Catalog
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col sm:flex-row gap-4 items-stretch">
      <AddToCartButton
        courseId={courseId}
        priceCents={priceCents}
        inventory={inventory}
        variant="premium"
        className="flex-1 h-16 text-lg"
      />
      <Button
        size="lg"
        variant="outline"
        className="flex-1 rounded-xl h-16 border-2 font-black text-lg group hover:bg-accent/50 transition-all active:scale-95"
        onClick={async () => {
          try {
            const isInCart = cart.items.some((item) => item.courseId === courseId);
            if (!isInCart) {
              await addToCart(courseId);
            }
            router.push("/cart");
          } catch (error) { }
        }}
        disabled={isChecking}
      >
        Instant Checkout
      </Button>
    </div>
  );
}

