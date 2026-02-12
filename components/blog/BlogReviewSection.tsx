"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Star, Loader2, MessageSquare } from "lucide-react";
import { toastSuccess, toastError } from "@/lib/toast";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { format } from "date-fns";
import Link from "next/link";

type BlogReview = {
  id: string;
  userId: string;
  rating: number;
  text: string | null;
  createdAt: string | Date;
  User: {
    name: string | null;
    image: string | null;
  };
};

interface BlogReviewSectionProps {
  postId: string;
  reviews: BlogReview[];
}

export function BlogReviewSection({ postId, reviews: initialReviews }: BlogReviewSectionProps) {
  const { data: session } = useSession();
  const [reviews, setReviews] = useState(initialReviews);
  const [rating, setRating] = useState(5);
  const [text, setText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const existingReview = session?.user ? reviews.find(r => r.userId === session.user.id) : null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session) return;

    setIsSubmitting(true);
    try {
      const response = await fetch(`/api/blog/${postId}/review`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rating, text }),
      });

      if (!response.ok) throw new Error("Failed to submit review");

      const { review } = await response.json();

      // Update local state
      const newReview = {
        ...review,
        User: {
          name: session.user.name,
          image: session.user.image,
        }
      };

      setReviews(prev => {
        const userId = (session.user as { id?: string }).id;
        const filtered = prev.filter((review) => review.userId !== userId);
        return [newReview, ...filtered];
      });

      toastSuccess(
        existingReview ? "Review updated!" : "Review submitted!",
        "Thank you for your feedback."
      );
      setText("");
    } catch {
      toastError(
        "Error",
        "Could not submit review. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-8 mt-12 border-t pt-12">
      <div className="flex items-center gap-2 mb-6">
        <MessageSquare className="h-6 w-6" />
        <h2 className="text-2xl font-bold font-display">Reviews ({reviews.length})</h2>
      </div>

      {session ? (
        <Card>
          <CardHeader>
            <CardTitle>{existingReview ? "Update your review" : "Leave a review"}</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((val) => (
                  <button
                    key={val}
                    type="button"
                    onClick={() => setRating(val)}
                    className="focus:outline-none transition-transform active:scale-90"
                  >
                    <Star
                      className={`h-6 w-6 ${
                        val <= rating ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground"
                      }`}
                    />
                  </button>
                ))}
              </div>
              <Textarea
                placeholder="What did you think about this post?"
                value={text}
                onChange={(e) => setText(e.target.value)}
                required
                className="min-h-[100px]"
              />
              <Button disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {existingReview ? "Update Review" : "Submit Review"}
              </Button>
            </form>
          </CardContent>
        </Card>
      ) : (
        <Card className="bg-muted/50 border-dashed">
          <CardContent className="py-8 text-center">
            <p className="text-muted-foreground mb-4">You must be signed in to leave a review.</p>
            <Link href="/sign-in">
              <Button variant="outline">Sign In</Button>
            </Link>
          </CardContent>
        </Card>
      )}

      <div className="space-y-4">
        {reviews.length === 0 ? (
          <p className="text-center text-muted-foreground py-8">No reviews yet. Be the first to review!</p>
        ) : (
          reviews.map((review) => (
            <div key={review.id} className="flex gap-4 p-4 border rounded-lg bg-card shadow-sm">
              <Avatar className="h-10 w-10 border">
                <AvatarImage src={review.User.image ?? undefined} />
                <AvatarFallback className="bg-primary/10 text-primary">{review.User.name?.[0] || "?"}</AvatarFallback>
              </Avatar>
              <div className="flex-1 space-y-1">
                <div className="flex items-center justify-between">
                  <p className="font-semibold text-sm">{review.User.name}</p>
                  <p className="text-[10px] text-muted-foreground">
                    {format(new Date(review.createdAt), "MMM d, yyyy")}
                  </p>
                </div>
                <div className="flex gap-0.5">
                  {[1, 2, 3, 4, 5].map((val) => (
                    <Star
                      key={val}
                      className={`h-3 w-3 ${
                        val <= review.rating ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground"
                      }`}
                    />
                  ))}
                </div>
                <p className="text-sm mt-2 text-foreground/90 leading-relaxed">{review.text}</p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
