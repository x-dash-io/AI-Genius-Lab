import { NextResponse } from "next/server";
import { SUBSCRIPTION_PLANS } from "@/lib/subscription";

export async function GET() {
  try {
    return NextResponse.json({
      plans: Object.values(SUBSCRIPTION_PLANS),
    });
  } catch (error) {
    console.error("Error fetching subscription plans:", error);
    return NextResponse.json(
      { error: "Failed to fetch subscription plans" },
      { status: 500 }
    );
  }
}
