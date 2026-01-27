import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { createSubscription, enrollUserInAllCourses } from "@/lib/subscription";
import { createPayPalSubscription } from "@/lib/paypal";
import { createCustomRateLimit } from "@/lib/rate-limit";
import { prisma } from "@/lib/prisma";

// Rate limit: 5 subscription attempts per minute per user
const rateLimit = createCustomRateLimit("subscription", 5, 60);

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Apply rate limiting
    const rateLimitResult = await rateLimit(session.user.id);
    if (!rateLimitResult.allowed) {
      return NextResponse.json(
        { error: "Too many subscription attempts. Please try again later." },
        { status: 429 }
      );
    }

    const body = await request.json();
    const { planType } = body;

    // Validate input
    if (!planType || !["monthly", "annual"].includes(planType)) {
      return NextResponse.json(
        { error: "Invalid plan type" },
        { status: 400 }
      );
    }

    // Sanitize planType
    const sanitizedPlanType = planType === "monthly" ? "monthly" : "annual";

    // Check if user already has an active subscription
    const existingSubscription = await prisma.subscription.findFirst({
      where: {
        userId: session.user.id,
        status: "active",
      },
    });

    if (existingSubscription) {
      return NextResponse.json(
        { error: "User already has an active subscription" },
        { status: 400 }
      );
    }

    // Use database transaction for consistency
    const result = await prisma.$transaction(async (tx) => {
      // Create subscription in our database first
      const subscription = await createSubscription(
        session.user.id,
        sanitizedPlanType,
        "paypal"
      );

      // Create PayPal subscription
      const appUrl = process.env.NEXTAUTH_URL;
      if (!appUrl) {
        if (process.env.NODE_ENV === "production") {
          throw new Error("NEXTAUTH_URL environment variable is required");
        }
        return NextResponse.json(
          {
            error: {
              message: "Server configuration error: NEXTAUTH_URL not set",
              code: "CONFIGURATION_ERROR",
            },
          },
          { status: 500 }
        );
      }
      const { subscriptionId: paypalSubscriptionId, approvalUrl } = await createPayPalSubscription({
        planType: sanitizedPlanType,
        returnUrl: `${appUrl}/api/subscription/paypal/success`,
        cancelUrl: `${appUrl}/subscription?cancelled=true`,
        subscriptionId: subscription.id,
      });

      // Update our subscription with PayPal reference
      await tx.subscription.update({
        where: { id: subscription.id },
        data: { providerRef: paypalSubscriptionId },
      });

      return { subscription, approvalUrl };
    });

    return NextResponse.json({
      success: true,
      subscription: result.subscription,
      approvalUrl: result.approvalUrl,
    });
  } catch (error) {
    console.error("Error creating subscription:", error);
    
    // Don't expose internal errors to client
    const message = error instanceof Error ? error.message : "Failed to create subscription";
    
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}
