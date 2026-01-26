import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { createBlogReview, getBlogReviews, getUserBlogReview } from "@/lib/blog";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ postId: string }> }
) {
  try {
    const { postId } = await params;
    const session = await getServerSession(authOptions);
    
    const reviews = await getBlogReviews(postId);
    
    // If user is logged in, check if they have a review
    let userReview = null;
    if (session?.user) {
      userReview = await getUserBlogReview(postId, session.user.id);
    }
    
    return NextResponse.json({
      reviews,
      userReview,
    });
  } catch (error) {
    console.error("Error fetching blog reviews:", error);
    return NextResponse.json(
      { error: "Failed to fetch reviews" },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ postId: string }> }
) {
  try {
    const { postId } = await params;
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { rating, comment } = body;

    // Validate rating
    if (!rating || rating < 1 || rating > 5) {
      return NextResponse.json(
        { error: "Rating must be between 1 and 5" },
        { status: 400 }
      );
    }

    const review = await createBlogReview(
      postId,
      session.user.id,
      rating,
      comment
    );

    return NextResponse.json(review, { status: 201 });
  } catch (error) {
    console.error("Error creating blog review:", error);
    return NextResponse.json(
      { error: "Failed to create review" },
      { status: 500 }
    );
  }
}
