import { NextResponse } from "next/server";
import { getAllSubscriptions } from "@/lib/admin/subscriptions";
import { requireRole } from "@/lib/access";

export async function GET() {
  try {
    // Ensure user is admin
    await requireRole("admin");

    const subscriptions = await getAllSubscriptions();
    return NextResponse.json(subscriptions);
  } catch (error) {
    console.error("Error fetching subscriptions:", error);
    if (error instanceof Error && error.message === "FORBIDDEN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    return NextResponse.json(
      { error: "Failed to fetch subscriptions" },
      { status: 500 }
    );
  }
}
