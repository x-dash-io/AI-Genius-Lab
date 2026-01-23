import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/password";

async function main() {
  const passwordHash = await hashPassword("password123");

  // Create users
  const customer = await prisma.user.upsert({
    where: { email: "customer@aigeniuslab.com" },
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

  console.log("✅ Created users");

  // Sample PDF URLs (using placeholder URLs - replace with actual Cloudinary URLs)
  const samplePdfUrl = "https://res.cloudinary.com/demo/raw/upload/sample.pdf";
  
  // Course 1: AI Foundations
  const aiFoundations = await prisma.course.upsert({
    where: { slug: "ai-foundations" },
    update: {},
    create: {
      slug: "ai-foundations",
      title: "AI Foundations",
      description: "Build a strong foundation in AI concepts and workflows. Learn the fundamentals of artificial intelligence, machine learning, and how to apply them in real-world scenarios.",
      category: "business",
      priceCents: 12900, // $129.00
      inventory: 50,
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
                  contentUrl: "https://res.cloudinary.com/demo/video/upload/sample.mp4",
                  durationSeconds: 420,
                  isLocked: false,
                  allowDownload: false,
                  sortOrder: 1,
                },
                {
                  title: "AI Landscape Overview",
                  contentType: "pdf",
                  contentUrl: samplePdfUrl,
                  durationSeconds: 180,
                  isLocked: true,
                  allowDownload: true,
                  sortOrder: 2,
                },
                {
                  title: "Setting Up Your AI Workspace",
                  contentType: "pdf",
                  contentUrl: samplePdfUrl,
                  durationSeconds: 300,
                  isLocked: true,
                  allowDownload: true,
                  sortOrder: 3,
                },
              ],
            },
          },
          {
            title: "Core Concepts",
            sortOrder: 2,
            lessons: {
              create: [
                {
                  title: "Understanding Machine Learning",
                  contentType: "video",
                  contentUrl: "https://res.cloudinary.com/demo/video/upload/sample.mp4",
                  durationSeconds: 600,
                  isLocked: true,
                  allowDownload: false,
                  sortOrder: 1,
                },
                {
                  title: "Neural Networks Explained",
                  contentType: "pdf",
                  contentUrl: samplePdfUrl,
                  durationSeconds: 450,
                  isLocked: true,
                  allowDownload: true,
                  sortOrder: 2,
                },
                {
                  title: "Deep Learning Fundamentals",
                  contentType: "pdf",
                  contentUrl: samplePdfUrl,
                  durationSeconds: 520,
                  isLocked: true,
                  allowDownload: true,
                  sortOrder: 3,
                },
              ],
            },
          },
        ],
      },
    },
  });

  // Course 2: AI for Content Creation
  const aiContent = await prisma.course.upsert({
    where: { slug: "ai-content-creation" },
    update: {},
    create: {
      slug: "ai-content-creation",
      title: "AI for Content Creation",
      description: "Master AI tools for creating engaging content. Learn to use AI for writing, image generation, video editing, and social media content.",
      category: "content",
      priceCents: 9900, // $99.00
      inventory: 100,
      isPublished: true,
      sections: {
        create: [
          {
            title: "Introduction to AI Content Tools",
            sortOrder: 1,
            lessons: {
              create: [
                {
                  title: "Overview of AI Content Tools",
                  contentType: "video",
                  contentUrl: "https://res.cloudinary.com/demo/video/upload/sample.mp4",
                  durationSeconds: 480,
                  isLocked: false,
                  allowDownload: false,
                  sortOrder: 1,
                },
                {
                  title: "Content Creation Workflow Guide",
                  contentType: "pdf",
                  contentUrl: samplePdfUrl,
                  durationSeconds: 360,
                  isLocked: true,
                  allowDownload: true,
                  sortOrder: 2,
                },
              ],
            },
          },
          {
            title: "Writing with AI",
            sortOrder: 2,
            lessons: {
              create: [
                {
                  title: "AI Writing Best Practices",
                  contentType: "pdf",
                  contentUrl: samplePdfUrl,
                  durationSeconds: 540,
                  isLocked: true,
                  allowDownload: true,
                  sortOrder: 1,
                },
                {
                  title: "Creating Blog Posts with AI",
                  contentType: "video",
                  contentUrl: "https://res.cloudinary.com/demo/video/upload/sample.mp4",
                  durationSeconds: 720,
                  isLocked: true,
                  allowDownload: false,
                  sortOrder: 2,
                },
                {
                  title: "Social Media Content Templates",
                  contentType: "pdf",
                  contentUrl: samplePdfUrl,
                  durationSeconds: 240,
                  isLocked: true,
                  allowDownload: true,
                  sortOrder: 3,
                },
              ],
            },
          },
        ],
      },
    },
  });

  // Course 3: AI for Business Automation
  const aiBusiness = await prisma.course.upsert({
    where: { slug: "ai-business-automation" },
    update: {},
    create: {
      slug: "ai-business-automation",
      title: "AI for Business Automation",
      description: "Automate your business processes with AI. Learn to build chatbots, automate customer service, streamline workflows, and increase productivity.",
      category: "business",
      priceCents: 14900, // $149.00
      inventory: 75,
      isPublished: true,
      sections: {
        create: [
          {
            title: "Business Automation Basics",
            sortOrder: 1,
            lessons: {
              create: [
                {
                  title: "Introduction to Business Automation",
                  contentType: "video",
                  contentUrl: "https://res.cloudinary.com/demo/video/upload/sample.mp4",
                  durationSeconds: 540,
                  isLocked: false,
                  allowDownload: false,
                  sortOrder: 1,
                },
                {
                  title: "Automation Strategy Guide",
                  contentType: "pdf",
                  contentUrl: samplePdfUrl,
                  durationSeconds: 420,
                  isLocked: true,
                  allowDownload: true,
                  sortOrder: 2,
                },
              ],
            },
          },
          {
            title: "Building AI Chatbots",
            sortOrder: 2,
            lessons: {
              create: [
                {
                  title: "Chatbot Design Principles",
                  contentType: "pdf",
                  contentUrl: samplePdfUrl,
                  durationSeconds: 480,
                  isLocked: true,
                  allowDownload: true,
                  sortOrder: 1,
                },
                {
                  title: "Building Your First Chatbot",
                  contentType: "video",
                  contentUrl: "https://res.cloudinary.com/demo/video/upload/sample.mp4",
                  durationSeconds: 900,
                  isLocked: true,
                  allowDownload: false,
                  sortOrder: 2,
                },
                {
                  title: "Advanced Chatbot Features",
                  contentType: "pdf",
                  contentUrl: samplePdfUrl,
                  durationSeconds: 360,
                  isLocked: true,
                  allowDownload: true,
                  sortOrder: 3,
                },
              ],
            },
          },
        ],
      },
    },
  });

  // Course 4: AI App Development
  const aiApps = await prisma.course.upsert({
    where: { slug: "ai-app-development" },
    update: {},
    create: {
      slug: "ai-app-development",
      title: "AI App Development",
      description: "Build AI-powered applications from scratch. Learn to integrate AI APIs, create intelligent features, and deploy AI applications.",
      category: "apps",
      priceCents: 17900, // $179.00
      inventory: null, // Unlimited
      isPublished: true,
      sections: {
        create: [
          {
            title: "Getting Started with AI APIs",
            sortOrder: 1,
            lessons: {
              create: [
                {
                  title: "Introduction to AI APIs",
                  contentType: "video",
                  contentUrl: "https://res.cloudinary.com/demo/video/upload/sample.mp4",
                  durationSeconds: 600,
                  isLocked: false,
                  allowDownload: false,
                  sortOrder: 1,
                },
                {
                  title: "API Integration Guide",
                  contentType: "pdf",
                  contentUrl: samplePdfUrl,
                  durationSeconds: 480,
                  isLocked: true,
                  allowDownload: true,
                  sortOrder: 2,
                },
              ],
            },
          },
          {
            title: "Building AI Features",
            sortOrder: 2,
            lessons: {
              create: [
                {
                  title: "Implementing AI Features",
                  contentType: "pdf",
                  contentUrl: samplePdfUrl,
                  durationSeconds: 540,
                  isLocked: true,
                  allowDownload: true,
                  sortOrder: 1,
                },
                {
                  title: "Hands-on Project: AI App",
                  contentType: "video",
                  contentUrl: "https://res.cloudinary.com/demo/video/upload/sample.mp4",
                  durationSeconds: 1200,
                  isLocked: true,
                  allowDownload: false,
                  sortOrder: 2,
                },
              ],
            },
          },
        ],
      },
    },
  });

  // Course 5: AI Productivity Tools
  const aiProductivity = await prisma.course.upsert({
    where: { slug: "ai-productivity-tools" },
    update: {},
    create: {
      slug: "ai-productivity-tools",
      title: "AI Productivity Tools",
      description: "Boost your productivity with AI-powered tools. Learn to use AI for task management, email automation, scheduling, and workflow optimization.",
      category: "productivity",
      priceCents: 8900, // $89.00
      inventory: 200,
      isPublished: true,
      sections: {
        create: [
          {
            title: "Productivity Fundamentals",
            sortOrder: 1,
            lessons: {
              create: [
                {
                  title: "AI Productivity Overview",
                  contentType: "video",
                  contentUrl: "https://res.cloudinary.com/demo/video/upload/sample.mp4",
                  durationSeconds: 480,
                  isLocked: false,
                  allowDownload: false,
                  sortOrder: 1,
                },
                {
                  title: "Productivity Tool Comparison",
                  contentType: "pdf",
                  contentUrl: samplePdfUrl,
                  durationSeconds: 360,
                  isLocked: true,
                  allowDownload: true,
                  sortOrder: 2,
                },
              ],
            },
          },
          {
            title: "Advanced Techniques",
            sortOrder: 2,
            lessons: {
              create: [
                {
                  title: "Workflow Automation",
                  contentType: "pdf",
                  contentUrl: samplePdfUrl,
                  durationSeconds: 540,
                  isLocked: true,
                  allowDownload: true,
                  sortOrder: 1,
                },
                {
                  title: "Email Automation with AI",
                  contentType: "video",
                  contentUrl: "https://res.cloudinary.com/demo/video/upload/sample.mp4",
                  durationSeconds: 720,
                  isLocked: true,
                  allowDownload: false,
                  sortOrder: 2,
                },
              ],
            },
          },
        ],
      },
    },
  });

  console.log("✅ Created courses");

  // Create Learning Path
  const learningPath = await prisma.learningPath.upsert({
    where: { id: "ai-foundations-path" },
    update: {},
    create: {
      id: "ai-foundations-path",
      title: "Complete AI Mastery Path",
      description: "Start with fundamentals and progress to advanced AI applications. This comprehensive path covers everything from basics to building production-ready AI solutions.",
      courses: {
        create: [
          {
            courseId: aiFoundations.id,
            sortOrder: 1,
          },
          {
            courseId: aiContent.id,
            sortOrder: 2,
          },
          {
            courseId: aiBusiness.id,
            sortOrder: 3,
          },
        ],
      },
    },
  });

  console.log("✅ Created learning path");

  // Create enrollment for customer
  await prisma.enrollment.upsert({
    where: {
      userId_courseId: {
        userId: customer.id,
        courseId: aiFoundations.id,
      },
    },
    update: {},
    create: {
      userId: customer.id,
      courseId: aiFoundations.id,
      grantedAt: new Date(),
    },
  });

  console.log("✅ Created enrollment");

  console.log("\n🎉 Seed completed successfully!");
  console.log("\n📊 Summary:");
  console.log(`   - Users: 2 (1 admin, 1 customer)`);
  console.log(`   - Courses: 5`);
  console.log(`   - Learning Paths: 1`);
  console.log(`   - Enrollments: 1`);
  console.log("\n🔑 Login credentials:");
  console.log(`   Admin: admin@synapze.dev / password123`);
  console.log(`   Customer: customer@aigeniuslab.com / password123`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
