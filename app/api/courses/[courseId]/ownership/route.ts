import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { hasPurchasedCourse } from "@/lib/access";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ courseId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json({ owned: false });
    }

    const { courseId } = await params;
    const owned = await hasPurchasedCourse(session.user.id, courseId);

    return NextResponse.json({ owned });
  } catch (error) {
    console.error("Error checking course ownership:", error);
    return NextResponse.json({ owned: false });
  }
}
