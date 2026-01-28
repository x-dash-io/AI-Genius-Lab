import { NextRequest, NextResponse } from "next/server";
import { requireRole } from "@/lib/access";
import { generateCourseCertificate, generatePathCertificate } from "@/lib/certificates";
import { checkRateLimit, createStandardErrorResponse } from "@/lib/api-helpers";
import { z } from "zod";

const certificateGenerateSchema = z.object({
  type: z.enum(["course", "learning_path"]),
  courseId: z.string().cuid().optional(),
  pathId: z.string().cuid().optional(),
  userId: z.string().cuid().optional(),
}).refine(
  (data) => (data.type === "course" && data.courseId) || (data.type === "learning_path" && data.pathId),
  {
    message: "courseId is required for course type, pathId is required for learning_path type",
  }
);

export async function POST(request: NextRequest) {
  // Rate limiting
  const rateLimitResponse = await checkRateLimit(request, "api");
  if (rateLimitResponse) {
    return rateLimitResponse;
  }

  try {
    await requireRole("admin");
    
    const body = await request.json();
    const validationResult = certificateGenerateSchema.safeParse(body);
    
    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: {
            message: "Invalid request data",
            code: "VALIDATION_ERROR",
            details: validationResult.error.issues,
          },
        },
        { status: 400 }
      );
    }

    const { type, courseId, pathId, userId } = validationResult.data;
    
    if (type === "course" && courseId) {
      // This would need userId in body for admin to generate for any user
      // For now, this is a placeholder
      return NextResponse.json(
        {
          error: {
            message: "Admin certificate generation not yet implemented",
            code: "NOT_IMPLEMENTED",
          },
        },
        { status: 501 }
      );
    } else if (type === "learning_path" && pathId) {
      return NextResponse.json(
        {
          error: {
            message: "Admin certificate generation not yet implemented",
            code: "NOT_IMPLEMENTED",
          },
        },
        { status: 501 }
      );
    }
    
    return NextResponse.json(
      {
        error: {
          message: "Invalid request. Provide type and courseId or pathId",
          code: "VALIDATION_ERROR",
        },
      },
      { status: 400 }
    );
  } catch (error) {
    return createStandardErrorResponse(error, "Failed to generate certificate");
  }
}
