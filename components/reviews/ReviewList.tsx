"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Star, Edit2, Trash2, Loader2 } from "lucide-react";
import { ReviewForm } from "./ReviewForm";
import { formatDistanceToNow } from "date-fns";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "@/lib/toast";
import { Skeleton } from "@/components/ui/skeleton";
import { useConfirmDialog } from "@/components/ui/confirm-dialog";

interface Review {
  id: string;
  rating: number;
  text: string | null;
  createdAt: Date;
  user: {
    id: string;
    name: string | null;
    email: string;
    image: string | null;
  };
}

interface ReviewListProps {
  courseId: string;
  currentUserId?: string;
}

export function ReviewList({ courseId, currentUserId }: ReviewListProps) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingReviewId, setEditingReviewId] = useState<string | null>(null);
  const [deletingReviewId, setDeletingReviewId] = useState<string | null>(null);
  const { confirm } = useConfirmDialog();

  useEffect(() => {
    fetchReviews();
  }, [courseId]);

  const fetchReviews = async () => {
    try {
      const response = await fetch(`/api/reviews?courseId=${courseId}`);
      const data = await response.json();
      setReviews(data.reviews || []);
    } catch (error) {
      console.error("Error fetching reviews:", error);
      toast({
        title: "Failed to load reviews",
        description: "Please refresh the page to try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (reviewId: string) => {
    const confirmed = await confirm({
      title: "Delete Review",
      description: "Are you sure you want to delete this review? This action cannot be undone.",
      confirmText: "Delete",
      cancelText: "Cancel",
      variant: "destructive",
    });

    if (!confirmed) {
      return;
    }

    setDeletingReviewId(reviewId);
    try {
      const response = await fetch(`/api/reviews/${reviewId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        setReviews(reviews.filter((r) => r.id !== reviewId));
        toast({
          title: "Review deleted",
          description: "Your review has been removed.",
          variant: "success",
        });
      } else {
        const data = await response.json();
        throw new Error(data.error || "Failed to delete review");
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to delete review";
      toast({
        title: "Delete failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setDeletingReviewId(null);
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <Card key={i}>
            <CardContent className="pt-6">
              <div className="flex items-start gap-3">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="space-y-2 flex-1">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-3 w-24" />
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Skeleton key={s} className="h-4 w-4" />
                    ))}
                  </div>
                  <Skeleton className="h-16 w-full" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (reviews.length === 0) {
    return (
      <div className="text-sm text-muted-foreground">
        No reviews yet. Be the first to review this course!
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {reviews.map((review) => {
        const isEditing = editingReviewId === review.id;
        const isOwnReview = currentUserId === review.user.id;
        const isDeleting = deletingReviewId === review.id;

        if (isEditing) {
          return (
            <Card key={review.id}>
              <CardContent className="pt-6">
                <ReviewForm
                  courseId={courseId}
                  existingReview={review}
                  onSuccess={() => {
                    setEditingReviewId(null);
                    fetchReviews();
                  }}
                  onCancel={() => setEditingReviewId(null)}
                />
              </CardContent>
            </Card>
          );
        }

        return (
          <Card key={review.id} className={isDeleting ? "opacity-50" : ""}>
            <CardContent className="pt-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <Avatar>
                      <AvatarImage src={review.user.image || undefined} />
                      <AvatarFallback>
                        {review.user.name?.[0] || review.user.email[0].toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">
                        {review.user.name || review.user.email}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(review.createdAt), {
                          addSuffix: true,
                        })}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 mb-2">
                    {[1, 2, 3, 4, 5].map((value) => (
                      <Star
                        key={value}
                        className={`h-4 w-4 ${
                          value <= review.rating
                            ? "fill-yellow-400 text-yellow-400"
                            : "fill-gray-300 text-gray-300"
                        }`}
                      />
                    ))}
                  </div>
                  {review.text && (
                    <p className="text-sm text-foreground mt-2">{review.text}</p>
                  )}
                </div>
                {isOwnReview && (
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setEditingReviewId(review.id)}
                      disabled={isDeleting}
                    >
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(review.id)}
                      disabled={isDeleting}
                    >
                      {isDeleting ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Trash2 className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
