import { NextRequest, NextResponse } from "next/server";
import { requireCustomer } from "@/lib/access";
import { hasCompletedCourse, generateCourseCertificate } from "@/lib/certificates";
import { prisma } from "@/lib/prisma";
import { logger } from "@/lib/logger";

export async function POST(request: NextRequest) {
  try {
    const user = await requireCustomer();
    const { courseId } = await request.json();

    if (!courseId) {
      return NextResponse.json({ error: "courseId is required" }, { status: 400 });
    }

    // Check if certificate already exists
    const existingCertificate = await prisma.certificate.findFirst({
      where: {
        userId: user.id,
        courseId,
        type: "course",
      },
    });

    if (existingCertificate) {
      return NextResponse.json({
        success: true,
        message: "Certificate already exists",
        certificateId: existingCertificate.certificateId,
      });
    }

    // Check if course is completed
    const isCompleted = await hasCompletedCourse(user.id, courseId);
    
    if (isCompleted) {
      try {
        const certificate = await generateCourseCertificate(courseId);
        logger.info(`Certificate generated on completion check: userId=${user.id}, courseId=${courseId}`);
        
        return NextResponse.json({
          success: true,
          message: "Certificate generated successfully",
          certificateId: certificate.certificateId,
          newlyGenerated: true,
        });
      } catch (error) {
        logger.error("Failed to generate certificate on completion check", {
          error,
          userId: user.id,
          courseId,
        });
        
        return NextResponse.json({
          success: false,
          message: "Course completed but certificate generation failed",
          error: error instanceof Error ? error.message : "Unknown error",
        });
      }
    }

    return NextResponse.json({
      success: true,
      message: "Course not yet completed",
      isCompleted: false,
    });

  } catch (error) {
    logger.error("Certificate check failed", { error });
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : "Failed to check certificate" 
      },
      { status: 500 }
    );
  }
}
