import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { reactivateSubscription, enrollUserInAllCourses } from "@/lib/subscription";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { subscriptionId } = body;

    if (!subscriptionId) {
      return NextResponse.json(
        { error: "Subscription ID is required" },
        { status: 400 }
      );
    }

    // Verify subscription belongs to user and is cancelled but not expired
    const subscription = await prisma.subscription.findFirst({
      where: {
        id: subscriptionId,
        userId: session.user.id,
        status: "cancelled",
        endDate: { gte: new Date() },
      },
    });

    if (!subscription) {
      return NextResponse.json(
        { error: "Cancelled subscription not found or expired" },
        { status: 404 }
      );
    }

    // Reactivate subscription
    const reactivatedSubscription = await reactivateSubscription(
      subscriptionId,
      session.user.id
    );

    // Ensure user is enrolled in all courses
    await enrollUserInAllCourses(session.user.id, subscriptionId);

    return NextResponse.json({
      success: true,
      subscription: reactivatedSubscription,
    });
  } catch (error) {
    console.error("Error reactivating subscription:", error);
    return NextResponse.json(
      { error: "Failed to reactivate subscription" },
      { status: 500 }
    );
  }
}
