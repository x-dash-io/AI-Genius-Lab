import { NextRequest, NextResponse } from "next/server";
import { verifyCertificate } from "@/lib/certificates";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ certificateId: string }> }
) {
  try {
    const { certificateId } = await params;
    const result = await verifyCertificate(certificateId);
    
    if (!result.valid) {
      return NextResponse.json(
        { valid: false, error: result.error },
        { status: 404 }
      );
    }
    
    return NextResponse.json(result);
  } catch (error) {
    console.error("Error verifying certificate:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to verify certificate" },
      { status: 500 }
    );
  }
}
