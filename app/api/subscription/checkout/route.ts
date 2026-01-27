// app/api/subscription/checkout/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { createSubscription, SUBSCRIPTION_PLANS, SubscriptionPlan } from "@/lib/subscription";
import { createPayPalSubscription } from "@/lib/paypal";

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { planId } = body;

    if (!planId || !Object.keys(SUBSCRIPTION_PLANS).includes(planId)) {
      return NextResponse.json({ error: "Invalid plan ID" }, { status: 400 });
    }

    const planType = planId as SubscriptionPlan;
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
    
    // Create PayPal subscription
    // We pass the subscription ID as the custom_id to track it back in webhooks if needed
    const { subscriptionId, approvalUrl } = await createPayPalSubscription({
      planType,
      returnUrl: `${appUrl}/api/subscription/paypal/success`,
      cancelUrl: `${appUrl}/subscription?error=cancelled`,
      subscriptionId: session.user.id, 
    });

    // Create pending subscription in DB
    // We store the PayPal subscription ID as providerRef to link them
    await createSubscription(session.user.id, planType, "paypal", subscriptionId);

    return NextResponse.json({ approvalUrl });
  } catch (error) {
    console.error("Subscription checkout error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
