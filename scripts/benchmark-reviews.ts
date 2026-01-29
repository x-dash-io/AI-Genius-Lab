
import { prisma } from "../lib/prisma";
import { getCourseReviewStats } from "../lib/reviews";

async function main() {
  console.log("🚀 Starting benchmark for getCourseReviewStats...");

  // 1. Setup Data
  const timestamp = Date.now();
  const userId = `bench_user_${timestamp}`;
  const courseId = `bench_course_${timestamp}`;
  const courseSlug = `bench-course-${timestamp}`;

  console.log(`📝 Creating test data (User: ${userId}, Course: ${courseId})...`);

  try {
    await prisma.user.create({
      data: {
        id: userId,
        email: `bench_${timestamp}@example.com`,
        name: "Benchmark User",
      },
    });

    await prisma.course.create({
      data: {
        id: courseId,
        slug: courseSlug,
        title: "Benchmark Course",
        priceCents: 1000,
        updatedAt: new Date(),
      },
    });

    const REVIEW_COUNT = 5000;
    console.log(`generating ${REVIEW_COUNT} reviews...`);

    // Create users for reviews
    const usersData = Array.from({ length: REVIEW_COUNT }).map((_, i) => ({
        id: `${userId}_${i}`,
        email: `bench_${timestamp}_${i}@example.com`,
        name: `User ${i}`
    }));

    await prisma.user.createMany({
        data: usersData,
        skipDuplicates: true
    });

    const reviewsData = Array.from({ length: REVIEW_COUNT }).map((_, i) => ({
        id: `review_${timestamp}_${i}`,
        userId: `${userId}_${i}`,
        courseId: courseId,
        rating: Math.floor(Math.random() * 5) + 1,
        text: "Benchmark review text",
    }));

    await prisma.review.createMany({
      data: reviewsData,
    });

    console.log("✅ Data setup complete.");

    // 2. Measure Performance
    console.log("⏱️ Measuring getCourseReviewStats...");

    // Warm up
    await getCourseReviewStats(courseId);

    const start = performance.now();
    const stats = await getCourseReviewStats(courseId);
    const end = performance.now();

    console.log("---------------------------------------------------");
    console.log(`📊 Result: ${(end - start).toFixed(4)} ms`);
    console.log("Stats:", JSON.stringify(stats, null, 2));
    console.log("---------------------------------------------------");

  } catch (error) {
    console.error("❌ Error during benchmark:", error);
  } finally {
    // 3. Cleanup
    console.log("🧹 Cleaning up...");
    await prisma.course.delete({ where: { id: courseId } }).catch(e => console.error("Failed to delete course", e));

    await prisma.user.deleteMany({
        where: {
            email: {
                startsWith: `bench_${timestamp}_`
            }
        }
    }).catch(e => console.error("Failed to delete batch users", e));

    await prisma.user.delete({ where: { id: userId } }).catch(() => {});

    console.log("✨ Done.");
    process.exit(0);
  }
}

main();
