import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getCourseAccessState } from "@/lib/access";
import { withErrorHandler } from "@/app/api/error-handler";

export const GET = withErrorHandler(async (
  request: NextRequest,
  { params }: { params: Promise<{ courseId: string }> }
) => {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return NextResponse.json({
      owned: false,
      hasAccess: false,
      accessSource: "none",
      subscriptionActive: false,
    });
  }

  const { courseId } = await params;
  const access = await getCourseAccessState(
    session.user.id,
    session.user.role,
    courseId
  );

  return NextResponse.json({
    owned: access.source === "purchase",
    hasAccess: access.granted,
    accessSource: access.source,
    subscriptionActive: access.subscriptionActive,
  });
});
