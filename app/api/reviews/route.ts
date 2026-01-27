import { NextRequest, NextResponse } from "next/server";
import { getCourseReviews, createReview } from "@/lib/reviews";
import { rateLimits } from "@/lib/rate-limit";
import { reviewSchema, safeParse } from "@/lib/validation";
import { checkRateLimit, createStandardErrorResponse } from "@/lib/api-helpers";
import { sanitizeReviewText } from "@/lib/sanitize";
import { z } from "zod";

const reviewGetSchema = z.object({
  courseId: z.string().min(1, "courseId is required"),
});

export async function GET(request: NextRequest) {
  // Rate limiting
  const rateLimitResponse = await checkRateLimit(request, "api");
  if (rateLimitResponse) {
    return rateLimitResponse;
  }

  try {
    const { searchParams } = new URL(request.url);
    const courseId = searchParams.get("courseId");

    const validationResult = reviewGetSchema.safeParse({ courseId });
    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: {
            message: "courseId is required",
            code: "VALIDATION_ERROR",
            details: validationResult.error.issues,
          },
        },
        { status: 400 }
      );
    }

    const reviews = await getCourseReviews(courseId!);
    
    // Sanitize review text before returning
    const sanitizedReviews = reviews.map(review => ({
      ...review,
      text: review.text ? sanitizeReviewText(review.text) : review.text,
    }));
    
    return NextResponse.json({ reviews: sanitizedReviews });
  } catch (error) {
    return createStandardErrorResponse(error, "Failed to fetch reviews");
  }
}

export async function POST(request: NextRequest) {
  // Rate limiting
  const rateLimitResponse = await checkRateLimit(request, "review");
  if (rateLimitResponse) {
    return rateLimitResponse;
  }

  try {
    const body = await request.json();
    const { courseId, rating, text } = body;

    if (!courseId) {
      return NextResponse.json(
        {
          error: {
            message: "courseId is required",
            code: "VALIDATION_ERROR",
          },
        },
        { status: 400 }
      );
    }

    // Validate input
    const validation = safeParse(reviewSchema, { rating, text });
    if (!validation.success) {
      return NextResponse.json(
        {
          error: {
            message: validation.error,
            code: "VALIDATION_ERROR",
          },
        },
        { status: 400 }
      );
    }

    // Sanitize review text before creating
    const sanitizedData = {
      ...validation.data,
      text: validation.data.text ? sanitizeReviewText(validation.data.text) : validation.data.text,
    };

    const review = await createReview(courseId, sanitizedData);
    
    // Sanitize before returning
    const sanitizedReview = {
      ...review,
      text: review.text ? sanitizeReviewText(review.text) : review.text,
    };
    
    return NextResponse.json({ review: sanitizedReview }, { status: 201 });
  } catch (error) {
    return createStandardErrorResponse(error, "Failed to create review");
  }
}
