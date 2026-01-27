import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createStandardErrorResponse } from "@/lib/api-helpers";
import { Prisma } from "@prisma/client";

interface ActivityMetadata {
  courseId?: string;
  purchaseId?: string;
  courseTitle?: string;
  courseSlug?: string;
  [key: string]: unknown;
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json(
        {
          error: {
            message: "Unauthorized",
            code: "UNAUTHORIZED",
          },
        },
        { status: 401 }
      );
    }

    const searchParams = request.nextUrl.searchParams;
    const type = searchParams.get("type");
    const limit = parseInt(searchParams.get("limit") || "50");

    const where: Prisma.ActivityLogWhereInput = { userId: session.user.id };
    if (type && type !== "all") {
      where.type = type;
    }

    const activity = await prisma.activityLog.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: limit,
    });

    // Fetch course information for purchase activities
    const enrichedActivity = await Promise.all(
      activity.map(async (entry) => {
        if (entry.type === "purchase_completed" && entry.metadata) {
          const metadata = entry.metadata as ActivityMetadata;
          if (metadata.courseId && typeof metadata.courseId === "string") {
            try {
              const course = await prisma.course.findUnique({
                where: { id: metadata.courseId },
                select: { title: true, slug: true },
              });
              if (course) {
                return {
                  ...entry,
                  metadata: {
                    ...metadata,
                    courseTitle: course.title,
                    courseSlug: course.slug,
                  } as ActivityMetadata,
                };
              }
            } catch (error) {
              // Continue without enrichment if course fetch fails
            }
          }
        }
        return entry;
      })
    );

    return NextResponse.json({ activity: enrichedActivity });
  } catch (error) {
    return createStandardErrorResponse(error, "Failed to fetch activity");
  }
}
