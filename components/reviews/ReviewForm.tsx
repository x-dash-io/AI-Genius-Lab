"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Star, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "@/lib/toast";

interface ReviewFormProps {
  courseId: string;
  existingReview?: {
    id: string;
    rating: number;
    text: string | null;
  } | null;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function ReviewForm({
  courseId,
  existingReview,
  onSuccess,
  onCancel,
}: ReviewFormProps) {
  const [rating, setRating] = useState(existingReview?.rating || 0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [text, setText] = useState(existingReview?.text || "");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      if (existingReview) {
        // Update existing review
        const response = await fetch(`/api/reviews/${existingReview.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ rating, text: text || null }),
        });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to update review");
      }
      toast({
        title: "Review updated",
        description: "Your review has been updated successfully.",
        variant: "success",
      });
    } else {
      // Create new review
      const response = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ courseId, rating, text: text || null }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to create review");
      }
      toast({
        title: "Review submitted",
        description: "Thank you for your review!",
        variant: "success",
      });
    }

    onSuccess?.();
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : "An error occurred";
    setError(errorMessage);
    toast({
      title: "Failed to submit review",
      description: errorMessage,
      variant: "destructive",
    });
  } finally {
    setIsSubmitting(false);
  }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label>Rating *</Label>
        <div className="flex items-center gap-1">
          {[1, 2, 3, 4, 5].map((value) => (
            <button
              key={value}
              type="button"
              onClick={() => setRating(value)}
              onMouseEnter={() => setHoveredRating(value)}
              onMouseLeave={() => setHoveredRating(0)}
              className="focus:outline-none"
            >
              <Star
                className={cn(
                  "h-6 w-6 transition-colors",
                  (hoveredRating || rating) >= value
                    ? "fill-yellow-400 text-yellow-400"
                    : "fill-gray-300 text-gray-300"
                )}
              />
            </button>
          ))}
          {rating > 0 && (
            <span className="ml-2 text-sm text-muted-foreground">
              {rating} {rating === 1 ? "star" : "stars"}
            </span>
          )}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="review-text">Review (optional)</Label>
        <Textarea
          id="review-text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Share your thoughts about this course..."
          rows={4}
          maxLength={1000}
        />
        <p className="text-xs text-muted-foreground">
          {text.length}/1000 characters
        </p>
      </div>

      {error && (
        <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
          {error}
        </div>
      )}

      <div className="flex gap-2">
        <Button type="submit" disabled={rating === 0 || isSubmitting}>
          {isSubmitting ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              {existingReview ? "Updating..." : "Submitting..."}
            </>
          ) : existingReview ? (
            "Update Review"
          ) : (
            "Submit Review"
          )}
        </Button>
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
        )}
      </div>
    </form>
  );
}
