import { NextRequest, NextResponse } from "next/server";
import { requireUser } from "@/lib/access";
import { getUserCertificates } from "@/lib/certificates";

export async function GET(request: NextRequest) {
  try {
    const user = await requireUser();
    const certificates = await getUserCertificates(user.id);
    
    return NextResponse.json({ certificates });
  } catch (error) {
    console.error("Error fetching certificates:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to fetch certificates" },
      { status: 500 }
    );
  }
}
