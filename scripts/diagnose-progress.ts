import { prisma } from "@/lib/prisma";

async function diagnoseProgress() {
  console.log("🔍 Diagnosing Progress Records...\n");

  try {
    // Get all progress records
    const allProgress = await prisma.progress.findMany({
      include: {
        User: {
          select: { email: true, name: true },
        },
        Lesson: {
          select: {
            title: true,
            Section: {
              select: {
                title: true,
                Course: {
                  select: { title: true, slug: true },
                },
              },
            },
          },
        },
      },
      orderBy: { updatedAt: "desc" },
    });

    console.log(`📊 Total Progress Records: ${allProgress.length}\n`);

    if (allProgress.length === 0) {
      console.log("✅ No progress records found. This is expected for a fresh purchase.\n");
      return;
    }

    // Group by completion status
    const completed = allProgress.filter((p) => p.completedAt !== null);
    const inProgress = allProgress.filter(
      (p) => p.completedAt === null && p.completionPercent > 0
    );
    const notStarted = allProgress.filter(
      (p) => p.completedAt === null && p.completionPercent === 0
    );

    console.log(`✅ Completed: ${completed.length}`);
    console.log(`⏳ In Progress: ${inProgress.length}`);
    console.log(`📝 Not Started: ${notStarted.length}\n`);

    // Show completed lessons (these might be the issue)
    if (completed.length > 0) {
      console.log("🔴 COMPLETED LESSONS (Check if these should be completed):\n");
      completed.forEach((p) => {
        console.log(`  User: ${p.User.email}`);
        console.log(`  Course: ${p.Lesson.Section.Course.title}`);
        console.log(`  Section: ${p.Lesson.Section.title}`);
        console.log(`  Lesson: ${p.Lesson.title}`);
        console.log(`  Completed At: ${p.completedAt}`);
        console.log(`  Completion %: ${p.completionPercent}%`);
        console.log(`  Last Updated: ${p.updatedAt}`);
        console.log(`  ---`);
      });
    }

    // Show in-progress lessons
    if (inProgress.length > 0) {
      console.log("\n⏳ IN PROGRESS LESSONS:\n");
      inProgress.forEach((p) => {
        console.log(`  User: ${p.User.email}`);
        console.log(`  Course: ${p.Lesson.Section.Course.title}`);
        console.log(`  Lesson: ${p.Lesson.title}`);
        console.log(`  Completion %: ${p.completionPercent}%`);
        console.log(`  Last Position: ${p.lastPosition}s`);
        console.log(`  ---`);
      });
    }

    // Check for suspicious patterns
    console.log("\n🔍 CHECKING FOR SUSPICIOUS PATTERNS:\n");

    // Check if any progress was created at the same time as enrollment
    const enrollments = await prisma.enrollment.findMany({
      include: {
        User: { select: { email: true } },
        Course: { select: { title: true } },
      },
    });

    for (const enrollment of enrollments) {
      const progressRecords = allProgress.filter(
        (p) =>
          p.userId === enrollment.userId &&
          p.Lesson.Section.Course.slug ===
            enrollments.find((e) => e.courseId === enrollment.courseId)?.Course
              .title
      );

      if (progressRecords.length > 0) {
        const enrollmentTime = enrollment.grantedAt.getTime();
        const suspiciousProgress = progressRecords.filter((p) => {
          const progressTime = p.updatedAt.getTime();
          const timeDiff = Math.abs(progressTime - enrollmentTime);
          return timeDiff < 5000; // Within 5 seconds
        });

        if (suspiciousProgress.length > 0) {
          console.log(
            `  ⚠️  Found ${suspiciousProgress.length} progress records created within 5s of enrollment`
          );
          console.log(`     User: ${enrollment.User.email}`);
          console.log(`     Course: ${enrollment.Course.title}`);
          console.log(`     Enrollment: ${enrollment.grantedAt}`);
          suspiciousProgress.forEach((p) => {
            console.log(`     Progress: ${p.updatedAt} (${p.Lesson.title})`);
          });
        }
      }
    }

    console.log("\n✅ Diagnosis complete!\n");
  } catch (error) {
    console.error("❌ Error during diagnosis:", error);
  } finally {
    await prisma.$disconnect();
  }
}

diagnoseProgress();
