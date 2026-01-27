import { NextRequest, NextResponse } from "next/server";
import { updateReview, deleteReview } from "@/lib/reviews";
import { checkRateLimit, createStandardErrorResponse, requireAuth } from "@/lib/api-helpers";
import { logger } from "@/lib/logger";
import { z } from "zod";

const reviewUpdateSchema = z.object({
  rating: z.number().int().min(1).max(5).optional(),
  text: z.string().max(1000).optional(),
});

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ reviewId: string }> }
) {
  // Rate limiting
  const rateLimitResponse = await checkRateLimit(request, "api");
  if (rateLimitResponse) {
    return rateLimitResponse;
  }

  // Authorization check
  const user = await requireAuth();

  try {
    const { reviewId } = await params;
    const body = await request.json();
    
    const validationResult = reviewUpdateSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: {
            message: "Invalid request data",
            code: "VALIDATION_ERROR",
            details: validationResult.error.errors,
          },
        },
        { status: 400 }
      );
    }

    const review = await updateReview(reviewId, validationResult.data);
    
    // Verify user owns this review (authorization check)
    if (review.userId !== user.id) {
      logger.warn("Unauthorized review update attempt", { reviewId, userId: user.id, reviewUserId: review.userId });
      return NextResponse.json(
        {
          error: {
            message: "You can only update your own reviews",
            code: "FORBIDDEN",
          },
        },
        { status: 403 }
      );
    }
    
    return NextResponse.json({ review });
  } catch (error) {
    return createStandardErrorResponse(error, "Failed to update review");
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ reviewId: string }> }
) {
  // Rate limiting
  const rateLimitResponse = await checkRateLimit(request, "api");
  if (rateLimitResponse) {
    return rateLimitResponse;
  }

  // Authorization check
  const user = await requireAuth();

  try {
    const { reviewId } = await params;
    
    // Get review first to check ownership
    const { getReviewById } = await import("@/lib/reviews");
    const review = await getReviewById(reviewId);
    
    // Verify user owns this review (authorization check)
    if (review.userId !== user.id) {
      logger.warn("Unauthorized review deletion attempt", { reviewId, userId: user.id, reviewUserId: review.userId });
      return NextResponse.json(
        {
          error: {
            message: "You can only delete your own reviews",
            code: "FORBIDDEN",
          },
        },
        { status: 403 }
      );
    }
    
    await deleteReview(reviewId);
    return NextResponse.json({ success: true });
  } catch (error) {
    return createStandardErrorResponse(error, "Failed to delete review");
  }
}
