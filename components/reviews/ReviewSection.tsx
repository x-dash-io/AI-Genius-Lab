"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Star } from "lucide-react";
import { ReviewForm } from "./ReviewForm";
import { ReviewList } from "./ReviewList";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

interface ReviewSectionProps {
  courseId: string;
  initialStats?: {
    averageRating: number;
    totalReviews: number;
    ratingDistribution: { 5: number; 4: number; 3: number; 2: number; 1: number };
  };
}

export function ReviewSection({ courseId, initialStats }: ReviewSectionProps) {
  const [showForm, setShowForm] = useState(false);
  const [stats, setStats] = useState(initialStats);
  const [currentUserId, setCurrentUserId] = useState<string | undefined>();
  const [userReview, setUserReview] = useState<any>(null);
  const [loadingStats, setLoadingStats] = useState(false);
  const [loadingUserReview, setLoadingUserReview] = useState(false);

  useEffect(() => {
    // Fetch current user session
    fetch("/api/auth/session")
      .then((res) => res.json())
      .then((session) => {
        if (session?.user?.id) {
          setCurrentUserId(session.user.id);
          fetchUserReview(session.user.id);
        }
      });

    fetchStats();
  }, [courseId]);

  const fetchStats = async () => {
    setLoadingStats(true);
    try {
      const response = await fetch(`/api/reviews/stats?courseId=${courseId}`);
      const data = await response.json();
      setStats(data);
    } catch (error) {
      console.error("Error fetching review stats:", error);
    } finally {
      setLoadingStats(false);
    }
  };

  const fetchUserReview = async (userId: string) => {
    setLoadingUserReview(true);
    try {
      const response = await fetch(
        `/api/reviews/user?courseId=${courseId}&userId=${userId}`
      );
      if (response.ok) {
        const data = await response.json();
        setUserReview(data.review);
      }
    } catch (error) {
      console.error("Error fetching user review:", error);
    } finally {
      setLoadingUserReview(false);
    }
  };

  const handleReviewSuccess = () => {
    setShowForm(false);
    fetchStats();
    if (currentUserId) {
      fetchUserReview(currentUserId);
    }
  };

  if (!stats || loadingStats) {
    return <div className="text-sm text-muted-foreground">Loading reviews...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Review Stats */}
      <Card>
        <CardHeader>
          <CardTitle>Reviews</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <div className="text-center">
              <div className="text-4xl font-bold">{stats.averageRating}</div>
              <div className="flex items-center justify-center gap-1 mt-1">
                {[1, 2, 3, 4, 5].map((value) => (
                  <Star
                    key={value}
                    className={`h-5 w-5 ${
                      value <= Math.round(stats.averageRating)
                        ? "fill-yellow-400 text-yellow-400"
                        : "fill-gray-300 text-gray-300"
                    }`}
                  />
                ))}
              </div>
              <div className="text-sm text-muted-foreground mt-1">
                {stats.totalReviews} {stats.totalReviews === 1 ? "review" : "reviews"}
              </div>
            </div>
            <div className="flex-1 space-y-1">
              {[5, 4, 3, 2, 1].map((rating) => {
                const count = stats.ratingDistribution[rating as keyof typeof stats.ratingDistribution];
                const percentage = stats.totalReviews > 0 ? (count / stats.totalReviews) * 100 : 0;
                return (
                  <div key={rating} className="flex items-center gap-2">
                    <span className="text-sm w-8">{rating}</span>
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full bg-yellow-400"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                    <span className="text-sm text-muted-foreground w-8 text-right">
                      {count}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Review Form */}
      {currentUserId && !userReview && (
        <Card>
          <CardHeader>
            <CardTitle>Write a Review</CardTitle>
          </CardHeader>
          <CardContent>
            {showForm ? (
              <ReviewForm
                courseId={courseId}
                onSuccess={handleReviewSuccess}
                onCancel={() => setShowForm(false)}
              />
            ) : (
              <Button onClick={() => setShowForm(true)}>Write a Review</Button>
            )}
          </CardContent>
        </Card>
      )}

      {/* Existing User Review */}
      {userReview && (
        <Card>
          <CardHeader>
            <CardTitle>Your Review</CardTitle>
          </CardHeader>
          <CardContent>
            <ReviewForm
              courseId={courseId}
              existingReview={userReview}
              onSuccess={handleReviewSuccess}
            />
          </CardContent>
        </Card>
      )}

      {/* Review List */}
      <div>
        <h3 className="text-lg font-semibold mb-4">All Reviews</h3>
        <ReviewList courseId={courseId} currentUserId={currentUserId} />
      </div>
    </div>
  );
}
