import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Log the error for debugging
    console.error("NextAuth client error:", body);
    
    // Return success to prevent client-side retries
    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Log endpoint error:", error);
    return NextResponse.json({ received: true }, { status: 200 });
  }
}
