import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { hasPurchasedCourse } from "@/lib/access";
import { withErrorHandler } from "@/app/api/error-handler";

export const GET = withErrorHandler(async (
  request: NextRequest,
  { params }: { params: { courseId: string } }
) => {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return NextResponse.json({ owned: false });
  }

  const { courseId } = params;
  const owned = await hasPurchasedCourse(session.user.id, courseId);

  return NextResponse.json({ owned });
});
