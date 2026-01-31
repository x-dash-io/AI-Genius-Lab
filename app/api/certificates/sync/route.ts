import { NextRequest, NextResponse } from "next/server";
import { requireCustomer } from "@/lib/access";
import { hasCompletedCourse, generateCourseCertificate, getUserCertificates } from "@/lib/certificates";
import { prisma } from "@/lib/prisma";
import { logger } from "@/lib/logger";

type CourseWithSections = {
  id: string;
  title: string;
  description: string | null;
  slug: string;
  categoryId: string | null;
  priceCents: number;
  inventory: number | null;
  isPublished: boolean;
  tier: string;
  category: string | null;
  createdAt: Date;
  updatedAt: Date;
  sections: {
    id: string;
    title: string;
    courseId: string;
    sortOrder: number;
    createdAt: Date;
    updatedAt: Date;
    lessons: {
      id: string;
    }[];
  }[];
};

export async function POST(request: NextRequest) {
  try {
    const user = await requireCustomer();
    
    // Get all courses the user has access to
    const purchases = await prisma.purchase.findMany({
      where: {
        userId: user.id,
        status: "paid",
      },
      include: {
        Course: {
          include: {
            sections: {
              include: {
                lessons: {
                  select: { id: true },
                },
              },
            },
          },
        },
      },
    });

    // Also check subscription access
    const subscription = await prisma.subscription.findFirst({
      where: {
        userId: user.id,
        status: "active",
      },
      include: {
        plan: true,
      },
    });

    let allAccessibleCourses: CourseWithSections[] = purchases.map(p => p.Course);

    // If user has Pro or Elite subscription, add all published courses
    if (subscription && (subscription.plan.tier === "pro" || subscription.plan.tier === "elite")) {
      const publishedCourses = await prisma.course.findMany({
        where: { isPublished: true },
        include: {
          sections: {
            include: {
              lessons: {
                select: { id: true },
              },
            },
          },
        },
      });
      
      // Merge without duplicates
      const existingIds = new Set(allAccessibleCourses.map(c => c.id));
      const additionalCourses = publishedCourses.filter(c => !existingIds.has(c.id));
      allAccessibleCourses = [...allAccessibleCourses, ...additionalCourses];
    }

    const results = {
      processed: 0,
      certificatesGenerated: 0,
      alreadyCompleted: 0,
      notCompleted: 0,
      errors: [] as string[],
    };

    // Check each accessible course for completion
    for (const course of allAccessibleCourses) {
      try {
        results.processed++;
        
        // Check if already has certificate
        const existingCertificate = await prisma.certificate.findFirst({
          where: {
            userId: user.id,
            courseId: course.id,
            type: "course",
          },
        });

        if (existingCertificate) {
          results.alreadyCompleted++;
          continue;
        }

        // Check if course is completed
        const isCompleted = await hasCompletedCourse(user.id, course.id);
        
        if (isCompleted) {
          try {
            await generateCourseCertificate(course.id);
            results.certificatesGenerated++;
            logger.info(`Retroactively generated certificate: userId=${user.id}, courseId=${course.id}`);
          } catch (certError) {
            const errorMsg = `Failed to generate certificate for course ${course.title}: ${certError instanceof Error ? certError.message : 'Unknown error'}`;
            results.errors.push(errorMsg);
            logger.error("Retroactive certificate generation failed", {
              error: certError,
              userId: user.id,
              courseId: course.id,
            });
          }
        } else {
          results.notCompleted++;
        }
      } catch (error) {
        const errorMsg = `Error processing course ${course.title}: ${error instanceof Error ? error.message : 'Unknown error'}`;
        results.errors.push(errorMsg);
        logger.error("Error in certificate sync", {
          error,
          userId: user.id,
          courseId: course.id,
        });
      }
    }

    return NextResponse.json({
      success: true,
      message: `Processed ${results.processed} courses. Generated ${results.certificatesGenerated} new certificates.`,
      results,
    });

  } catch (error) {
    logger.error("Certificate sync failed", { error });
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : "Failed to sync certificates" 
      },
      { status: 500 }
    );
  }
}
