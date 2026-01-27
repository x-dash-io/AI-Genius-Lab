"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { AddToCartButton } from "@/components/cart/AddToCartButton";
import { CheckCircle, BookOpen, Loader2 } from "lucide-react";

interface CourseActionsProps {
  courseId: string;
  courseSlug: string;
  priceCents: number;
  inventory?: number | null;
}

export function CourseActions({
  courseId,
  courseSlug,
  priceCents,
  inventory,
}: CourseActionsProps) {
  const { data: session, status } = useSession();
  const [isOwned, setIsOwned] = useState(false);
  const [isChecking, setIsChecking] = useState(true);
  const [authTimeout, setAuthTimeout] = useState(false);

  useEffect(() => {
    // Set timeout for auth initialization
    const timer = setTimeout(() => {
      if (status === "loading") {
        console.warn("Auth timeout in CourseActions - proceeding without auth");
        setAuthTimeout(true);
        setIsChecking(false);
      }
    }, 5000); // 5 seconds

    return () => clearTimeout(timer);
  }, [status]);

  useEffect(() => {
    async function checkOwnership() {
      if (status === "loading" && !authTimeout) return;
      
      if (!session?.user) {
        setIsChecking(false);
        setIsOwned(false);
        return;
      }

      try {
        const response = await fetch(`/api/courses/${courseId}/ownership`);
        if (response.ok) {
          const data = await response.json();
          setIsOwned(data.owned);
        }
      } catch (error) {
        console.error("Failed to check ownership:", error);
      } finally {
        setIsChecking(false);
      }
    }

    checkOwnership();
  }, [courseId, session, status, authTimeout]);

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

  // User already owns the course
  if (isOwned) {
    return (
      <div className="flex flex-wrap gap-4">
        <div className="flex items-center gap-2 rounded-lg bg-green-500/10 border border-green-500/20 px-4 py-2">
          <CheckCircle className="h-5 w-5 text-green-500" />
          <span className="text-sm font-medium text-green-600 dark:text-green-400">
            You own this course
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

  // User doesn't own - show purchase options
  return (
    <div className="flex flex-wrap gap-4">
      <AddToCartButton
        courseId={courseId}
        priceCents={priceCents}
        inventory={inventory}
        size="lg"
      />
      <Link href={`/checkout?course=${courseSlug}`}>
        <Button size="lg" variant="outline">
          Buy Now · ${(priceCents / 100).toFixed(2)}
        </Button>
      </Link>
      <Link href="/courses">
        <Button variant="outline" size="lg">
          Back to catalog
        </Button>
      </Link>
    </div>
  );
}
