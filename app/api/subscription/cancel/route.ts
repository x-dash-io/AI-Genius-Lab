// app/api/subscription/cancel/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { cancelSubscription, getUserSubscription } from "@/lib/subscription";
import { cancelPayPalSubscription } from "@/lib/paypal";
import { sendSubscriptionCancelledEmail } from "@/lib/email";

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const subscription = await getUserSubscription(session.user.id);
    if (!subscription) {
      return NextResponse.json({ error: "No active subscription found" }, { status: 404 });
    }

    // Cancel in PayPal
    if (subscription.provider === "paypal" && subscription.providerRef) {
      try {
        await cancelPayPalSubscription(subscription.providerRef);
      } catch (paypalError) {
        console.error("PayPal cancellation error:", paypalError);
        // Continue to cancel locally even if PayPal fails (might already be cancelled or network issue)
      }
    }

    // Cancel in DB
    const updatedSub = await cancelSubscription(subscription.id, session.user.id);

    // Send email notification
    if (session.user.email) {
      try {
        await sendSubscriptionCancelledEmail(
          session.user.email,
          session.user.name || "Customer",
          updatedSub.planType as "monthly" | "annual",
          updatedSub.endDate || new Date()
        );
      } catch (emailError) {
        console.error("Failed to send cancellation email:", emailError);
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Subscription cancellation error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
