"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { BlogReviewSection } from "@/components/blog/BlogReview";
import { BlogReview } from "@/lib/blog";

interface BlogReviewClientProps {
  postId: string;
  initialReviews: BlogReview[];
  averageRating: number;
  totalReviews: number;
}

export function BlogReviewClient({
  postId,
  initialReviews,
  averageRating,
  totalReviews,
}: BlogReviewClientProps) {
  const { data: session } = useSession();
  const [reviews, setReviews] = useState(initialReviews);
  const [userReview, setUserReview] = useState<BlogReview | undefined>(
    initialReviews.find(r => r.user.id === session?.user?.id)
  );

  // Update user review when session changes
  useEffect(() => {
    if (session?.user) {
      const review = reviews.find(r => r.user.id === session.user?.id);
      setUserReview(review);
    } else {
      setUserReview(undefined);
    }
  }, [session, reviews]);

  const handleReviewAdded = async () => {
    // Fetch updated reviews
    try {
      const response = await fetch(`/api/blog/${postId}/reviews`);
      if (response.ok) {
        const data = await response.json();
        setReviews(data.reviews);
        setUserReview(data.userReview);
      }
    } catch (error) {
      console.error("Failed to refresh reviews:", error);
    }
  };

  return (
    <BlogReviewSection
      postId={postId}
      reviews={reviews}
      averageRating={averageRating}
      totalReviews={totalReviews}
      userReview={userReview}
      onReviewAdded={handleReviewAdded}
    />
  );
}
