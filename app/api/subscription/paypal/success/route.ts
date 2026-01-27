import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { enrollUserInAllCourses } from "@/lib/subscription";
import { sendSubscriptionWelcomeEmail, sendAdminSubscriptionNotification } from "@/lib/email";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const subscription_id = searchParams.get("subscription_id");
    const ba_token = searchParams.get("ba_token");
    const token = searchParams.get("token");

    if (!subscription_id) {
      return NextResponse.json({ error: "Missing subscription ID" }, { status: 400 });
    }

    // Find the subscription in our database
    const subscription = await prisma.subscription.findFirst({
      where: {
        providerRef: subscription_id,
        userId: session.user.id,
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
      return NextResponse.json({ error: "Subscription not found" }, { status: 404 });
    }

    // Activate subscription
    await prisma.subscription.update({
      where: { id: subscription.id },
      data: { status: "active" },
    });

    // Enroll user in all courses
    await enrollUserInAllCourses(session.user.id, subscription.id);

    // Send welcome email to user
    try {
      const planPrice = subscription.planType === "monthly" ? "29.99" : "299.99";
      await sendSubscriptionWelcomeEmail(
        subscription.User.email,
        subscription.User.name || "Valued Customer",
        subscription.planType,
        planPrice,
        subscription.endDate || new Date()
      );
    } catch (emailError) {
      console.error("Failed to send welcome email:", emailError);
      // Continue even if email fails
    }

    // Send notification to admin
    try {
      // Get admin email from config, fail if not set in production
      const adminEmail = process.env.ADMIN_EMAIL;
      if (!adminEmail && process.env.NODE_ENV === "production") {
        logger.warn("ADMIN_EMAIL not set, skipping admin notification");
      }
      const planPrice = subscription.planType === "monthly" ? "29.99" : "299.99";
      await sendAdminSubscriptionNotification(
        adminEmail,
        subscription.User.email,
        subscription.User.name || "Valued Customer",
        subscription.planType,
        planPrice
      );
    } catch (emailError) {
      console.error("Failed to send admin notification:", emailError);
      // Continue even if email fails
    }

    // Redirect to success page
    const appUrl = process.env.NEXTAUTH_URL ?? "http://localhost:3000";
    return NextResponse.redirect(`${appUrl}/subscription?success=true`);
  } catch (error) {
    console.error("Error processing PayPal subscription success:", error);
    const appUrl = process.env.NEXTAUTH_URL ?? "http://localhost:3000";
    return NextResponse.redirect(`${appUrl}/subscription?error=payment_failed`);
  }
}
