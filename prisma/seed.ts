import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/password";

async function main() {
  const passwordHash = await hashPassword("password123");

  const customer = await prisma.user.upsert({
    where: { email: "customer@synapze.dev" },
    update: {},
    create: {
      email: "customer@aigeniuslab.com",
      name: "AI Genius Lab Customer",
      passwordHash,
      role: "customer",
    },
  });

  const admin = await prisma.user.upsert({
    where: { email: "admin@synapze.dev" },
    update: {},
    create: {
      email: "admin@synapze.dev",
      name: "Synapze Admin",
      passwordHash,
      role: "admin",
    },
  });

  const course = await prisma.course.upsert({
    where: { slug: "ai-foundations" },
    update: {},
    create: {
      slug: "ai-foundations",
      title: "AI Foundations",
      description: "Build a strong foundation in AI concepts and workflows.",
      priceCents: 12900,
      isPublished: true,
      sections: {
        create: [
          {
            title: "Getting Started",
            sortOrder: 1,
            lessons: {
              create: [
                {
                  title: "Welcome to AI Genius Lab",
                  contentType: "video",
                  durationSeconds: 420,
                  isLocked: false,
                  allowDownload: false,
                  sortOrder: 1,
                },
                {
                  title: "AI Landscape Overview",
                  contentType: "pdf",
                  durationSeconds: 180,
                  isLocked: true,
                  allowDownload: true,
                  sortOrder: 2,
                },
              ],
            },
          },
        ],
      },
    },
  });

  await prisma.learningPath.upsert({
    where: { id: "ai-foundations-path" },
    update: {},
    create: {
      id: "ai-foundations-path",
      title: "AI Foundations Path",
      description: "Start with fundamentals and progress to applied projects.",
      courses: {
        create: [
          {
            courseId: course.id,
            sortOrder: 1,
          },
        ],
      },
    },
  });

  await prisma.enrollment.upsert({
    where: {
      userId_courseId: {
        userId: customer.id,
        courseId: course.id,
      },
    },
    update: {},
    create: {
      userId: customer.id,
      courseId: course.id,
      grantedAt: new Date(),
    },
  });
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
