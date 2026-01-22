"use server";

import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/access";
import { hasPurchasedCourse } from "@/lib/access";

export async function getCourseReviews(courseId: string) {
  return prisma.review.findMany({
    where: { courseId },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          image: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function getCourseReviewStats(courseId: string) {
  const reviews = await prisma.review.findMany({
    where: { courseId },
    select: { rating: true },
  });

  if (reviews.length === 0) {
    return {
      averageRating: 0,
      totalReviews: 0,
      ratingDistribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
    };
  }

  const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
  const averageRating = totalRating / reviews.length;

  const ratingDistribution = reviews.reduce(
    (acc, review) => {
      acc[review.rating as keyof typeof acc]++;
      return acc;
    },
    { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }
  );

  return {
    averageRating: Math.round(averageRating * 10) / 10,
    totalReviews: reviews.length,
    ratingDistribution,
  };
}

export async function getUserReview(courseId: string, userId: string) {
  return prisma.review.findUnique({
    where: {
      userId_courseId: {
        userId,
        courseId,
      },
    },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          image: true,
        },
      },
    },
  });
}

export async function createReview(
  courseId: string,
  data: { rating: number; text?: string }
) {
  const user = await requireUser();

  // Verify user has purchased the course
  const hasPurchased = await hasPurchasedCourse(user.id, courseId);
  if (!hasPurchased) {
    throw new Error("FORBIDDEN: You must purchase the course before reviewing");
  }

  // Check if review already exists
  const existingReview = await prisma.review.findUnique({
    where: {
      userId_courseId: {
        userId: user.id,
        courseId,
      },
    },
  });

  if (existingReview) {
    throw new Error("You have already reviewed this course");
  }

  // Validate rating
  if (data.rating < 1 || data.rating > 5) {
    throw new Error("Rating must be between 1 and 5");
  }

  return prisma.review.create({
    data: {
      userId: user.id,
      courseId,
      rating: data.rating,
      text: data.text?.trim() || null,
    },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          image: true,
        },
      },
    },
  });
}

export async function updateReview(
  reviewId: string,
  data: { rating?: number; text?: string }
) {
  const user = await requireUser();

  // Verify review belongs to user
  const review = await prisma.review.findUnique({
    where: { id: reviewId },
  });

  if (!review) {
    throw new Error("Review not found");
  }

  if (review.userId !== user.id) {
    throw new Error("FORBIDDEN: You can only update your own reviews");
  }

  // Validate rating if provided
  if (data.rating !== undefined && (data.rating < 1 || data.rating > 5)) {
    throw new Error("Rating must be between 1 and 5");
  }

  return prisma.review.update({
    where: { id: reviewId },
    data: {
      rating: data.rating,
      text: data.text?.trim() || null,
    },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          image: true,
        },
      },
    },
  });
}

export async function deleteReview(reviewId: string) {
  const user = await requireUser();

  // Verify review belongs to user
  const review = await prisma.review.findUnique({
    where: { id: reviewId },
  });

  if (!review) {
    throw new Error("Review not found");
  }

  if (review.userId !== user.id) {
    throw new Error("FORBIDDEN: You can only delete your own reviews");
  }

  return prisma.review.delete({
    where: { id: reviewId },
  });
}
