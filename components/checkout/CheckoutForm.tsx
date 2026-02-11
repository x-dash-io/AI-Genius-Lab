"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2 } from "lucide-react";
import { toast } from "@/lib/toast";

interface CheckoutFormProps {
  courseId: string;
  courseTitle: string;
  priceCents: number;
  createCheckoutSession: (formData: FormData) => Promise<void>;
}

export function CheckoutForm({
  courseId,
  courseTitle,
  priceCents,
  createCheckoutSession,
}: CheckoutFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const formData = new FormData(e.currentTarget);
      await createCheckoutSession(formData);
      // Redirect will happen server-side
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to start checkout";
      setError(errorMessage);
      toast({
        title: "Checkout Error",
        description: errorMessage,
        variant: "destructive",
      });
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="grid gap-4">
      <input type="hidden" name="courseId" value={courseId} />
      <p className="text-sm text-muted-foreground">{courseTitle}</p>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="flex items-baseline justify-between border-t pt-4">
        <span className="text-lg font-semibold">Total</span>
        <span className="text-2xl font-bold">
          ${(priceCents / 100).toFixed(2)}
        </span>
      </div>

      <Button type="submit" variant="premium" size="lg" className="w-full" disabled={isSubmitting}>
        {isSubmitting ? (
          <>
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            Processing...
          </>
        ) : (
          `Pay with PayPal · $${(priceCents / 100).toFixed(2)}`
        )}
      </Button>
    </form>
  );
}
