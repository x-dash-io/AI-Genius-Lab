import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { cancelSubscription, removeSubscriptionAccess } from "@/lib/subscription";
import { sendSubscriptionCancelledEmail } from "@/lib/email";
import { cancelPayPalSubscription } from "@/lib/paypal";
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

    // Verify subscription belongs to user
    const subscription = await prisma.subscription.findFirst({
      where: {
        id: subscriptionId,
        userId: session.user.id,
        status: "active",
      },
      include: {
        User: {
          select: {
            email: true,
            name: true,
          },
        },
      },
    });

    if (!subscription) {
      return NextResponse.json(
        { error: "Active subscription not found" },
        { status: 404 }
      );
    }

    // Cancel in PayPal if we have a reference
    if (subscription.providerRef && subscription.provider === "paypal") {
      try {
        await cancelPayPalSubscription(subscription.providerRef);
      } catch (paypalError) {
        console.error("PayPal cancellation error:", paypalError);
        // Continue with local cancellation even if PayPal fails
      }
    }

    // Cancel subscription in our database
    await cancelSubscription(subscriptionId, session.user.id);

    // Send cancellation email to user
    try {
      await sendSubscriptionCancelledEmail(
        subscription.User.email,
        subscription.User.name || "Valued Customer",
        subscription.planType,
        subscription.endDate || new Date()
      );
    } catch (emailError) {
      console.error("Failed to send cancellation email:", emailError);
      // Continue even if email fails
    }

    return NextResponse.json({
      success: true,
      message: "Subscription cancelled successfully. Access will continue until the end of your billing period.",
      endDate: subscription.endDate,
    });
  } catch (error) {
    console.error("Error cancelling subscription:", error);
    return NextResponse.json(
      { error: "Failed to cancel subscription" },
      { status: 500 }
    );
  }
}
