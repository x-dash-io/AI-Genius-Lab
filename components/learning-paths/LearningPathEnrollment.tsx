"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Loader2, ShoppingCart } from "lucide-react";
import { toast } from "@/lib/toast";

interface LearningPathEnrollmentProps {
  pathId: string;
  totalPriceCents: number;
  enrollAction: () => Promise<{ orderId: string; approvalUrl: string | null }>;
}

export function LearningPathEnrollment({
  pathId,
  totalPriceCents,
  enrollAction,
}: LearningPathEnrollmentProps) {
  const router = useRouter();
  const [isEnrolling, setIsEnrolling] = useState(false);

  const handleEnroll = async () => {
    setIsEnrolling(true);
    try {
      const result = await enrollAction();
      console.log("Enrollment result:", result); // Debug log
      
      if (result.approvalUrl) {
        // Redirect to PayPal
        window.location.href = result.approvalUrl;
      } else {
        toast({
          title: "Enrollment failed",
          description: "No PayPal approval URL received",
          variant: "destructive",
        });
        setIsEnrolling(false);
      }
    } catch (error) {
      console.error("Enrollment error:", error); // Debug log
      const errorMessage = error instanceof Error ? error.message : "Failed to start enrollment";
      toast({
        title: "Enrollment failed",
        description: errorMessage,
        variant: "destructive",
      });
      setIsEnrolling(false);
    }
  };

  return (
    <Button size="lg" onClick={handleEnroll} disabled={isEnrolling}>
      {isEnrolling ? (
        <>
          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          Processing...
        </>
      ) : (
        <>
          <ShoppingCart className="h-4 w-4 mr-2" />
          Enroll in Full Path · ${(totalPriceCents / 100).toFixed(2)}
        </>
      )}
    </Button>
  );
}
