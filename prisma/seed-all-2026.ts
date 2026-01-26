import { PrismaClient } from "@prisma/client";
import { hash } from "bcryptjs";

const prisma = new PrismaClient();

async function seedAll2026() {
  console.log("🚀 Starting complete 2026 data seeding...\n");

  try {
    // 1. Clear existing data (in development)
    if (process.env.NODE_ENV === "development") {
      console.log("🗑️ Clearing existing data...");
      await prisma.review.deleteMany();
      await prisma.progress.deleteMany();
      await prisma.enrollment.deleteMany();
      await prisma.quiz.deleteMany();
      await prisma.lessonContent.deleteMany();
      await prisma.lesson.deleteMany();
      await prisma.course.deleteMany();
      await prisma.learningPath.deleteMany();
      await prisma.blogReview.deleteMany();
      await prisma.blogImage.deleteMany();
      await prisma.blogPost.deleteMany();
      await prisma.category.deleteMany();
      await prisma.user.deleteMany();
      console.log("✅ Cleared existing data\n");
    }

    // 2. Create admin user
    console.log("👤 Creating admin user...");
    const adminPassword = await hash("admin123");
    const admin = await prisma.user.upsert({
      where: { email: "admin@aigeniuslab.com" },
      update: {},
      create: {
        email: "admin@aigeniuslab.com",
        passwordHash: adminPassword,
        name: "Admin User",
        role: "admin",
        emailVerified: new Date(),
      },
    });

    // Create sample users
    const users = await Promise.all([
      prisma.user.upsert({
        where: { email: "john.doe@example.com" },
        update: {},
        create: {
          email: "john.doe@example.com",
          passwordHash: await hash("password123"),
          name: "John Doe",
          role: "customer",
          emailVerified: new Date(),
        },
      }),
      prisma.user.upsert({
        where: { email: "jane.smith@example.com" },
        update: {},
        create: {
          email: "jane.smith@example.com",
          passwordHash: await hash("password123"),
          name: "Jane Smith",
          role: "customer",
          emailVerified: new Date(),
        },
      }),
      prisma.user.upsert({
        where: { email: "mike.wilson@example.com" },
        update: {},
        create: {
          email: "mike.wilson@example.com",
          passwordHash: await hash("password123"),
          name: "Mike Wilson",
          role: "customer",
          emailVerified: new Date(),
        },
      }),
    ]);

    console.log(`✅ Created ${users.length + 1} users\n`);

    // 3. Create categories
    console.log("📁 Creating categories...");
    const categories = await Promise.all([
      prisma.category.upsert({
        where: { name: "AI & Machine Learning" },
        update: {},
        create: {
          name: "AI & Machine Learning",
          slug: "ai-machine-learning",
          description: "Artificial Intelligence and Machine Learning courses",
          icon: "brain",
          color: "#8B5CF6",
          order: 1,
        },
      }),
      prisma.category.upsert({
        where: { name: "Web Development" },
        update: {},
        create: {
          name: "Web Development",
          slug: "web-development",
          description: "Modern web development technologies",
          icon: "code",
          color: "#3B82F6",
          order: 2,
        },
      }),
      prisma.category.upsert({
        where: { name: "Blockchain" },
        update: {},
        create: {
          name: "Blockchain",
          slug: "blockchain",
          description: "Blockchain and cryptocurrency technologies",
          icon: "link",
          color: "#F59E0B",
          order: 3,
        },
      }),
      prisma.category.upsert({
        where: { name: "Computer Science" },
        update: {},
        create: {
          name: "Computer Science",
          slug: "computer-science",
          description: "Fundamental computer science topics",
          icon: "cpu",
          color: "#10B981",
          order: 4,
        },
      }),
      prisma.category.upsert({
        where: { name: "DevOps" },
        update: {},
        create: {
          name: "DevOps",
          slug: "devops",
          description: "DevOps and cloud infrastructure",
          icon: "server",
          color: "#EF4444",
          order: 5,
        },
      }),
    ]);
    console.log(`✅ Created ${categories.length} categories\n`);

    // 4. Create courses with lessons
    console.log("📚 Creating courses and lessons...");
    
    // AI Agents Course
    const aiCourse = await prisma.course.create({
      data: {
        title: "AI Agents & Autonomous Systems 2026",
        slug: "ai-agents-autonomous-systems-2026",
        description: "Master the latest in AI agent development, from LangChain to AutoGPT, and build production-ready autonomous systems.",
        priceCents: 19999,
        level: "Advanced",
        duration: "12 weeks",
        published: true,
        publishedAt: new Date("2026-01-15"),
        thumbnail: "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800&h=450&fit=crop",
        instructor: "Dr. Sarah Chen",
        instructorBio: "AI Research Lead at OpenAI with 10+ years in autonomous systems",
        instructorAvatar: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face",
        prerequisites: ["Python proficiency", "Machine Learning basics", "API development"],
        learningOutcomes: [
          "Build autonomous AI agents with LangChain",
          "Implement memory systems for agents",
          "Create multi-agent协作 systems",
          "Deploy agents in production environments"
        ],
        tags: ["AI Agents", "LangChain", "AutoGPT", "Autonomous Systems", "2026"],
        featured: true,
        categoryId: categories[0].id,
        createdAt: new Date("2026-01-01"),
        updatedAt: new Date("2026-02-10"),
      },
    });

    // Create lessons for AI course
    const aiLessons = await Promise.all([
      prisma.lesson.create({
        data: {
          courseId: aiCourse.id,
          title: "Introduction to AI Agents",
          description: "Understanding the fundamentals of AI agents and their architecture",
          type: "video",
          duration: 45,
          order: 1,
          isPublished: true,
          isPreview: true,
        },
      }),
      prisma.lesson.create({
        data: {
          courseId: aiCourse.id,
          title: "Building Your First Agent",
          description: "Create a simple AI agent using LangChain",
          type: "video",
          duration: 60,
          order: 2,
          isPublished: true,
          isPreview: false,
        },
      }),
      prisma.lesson.create({
        data: {
          courseId: aiCourse.id,
          title: "Agent Memory Systems",
          description: "Implement short-term and long-term memory for agents",
          type: "video",
          duration: 55,
          order: 3,
          isPublished: true,
          isPreview: false,
        },
      }),
    ]);

    // Create content for lessons
    for (const lesson of aiLessons) {
      await prisma.lessonContent.create({
        data: {
          lessonId: lesson.id,
          type: "video",
          videoUrl: "https://example.com/video-placeholder.mp4",
          transcript: "This is a sample transcript for the lesson...",
          order: 1,
        },
      });

      await prisma.lessonContent.create({
        data: {
          lessonId: lesson.id,
          type: "resource",
          resourceUrl: "https://example.com/resource.pdf",
          resourceType: "pdf",
          title: "Lesson Resources",
          order: 2,
        },
      });
    }

    // Create more courses similarly...
    console.log("✅ Created courses with lessons and content\n");

    // 5. Create learning paths
    console.log("🛤️ Creating learning paths...");
    await prisma.learningPath.create({
      data: {
        title: "AI Engineer Path 2026",
        slug: "ai-engineer-path-2026",
        description: "Complete path to become an AI Engineer in 2026",
        image: "https://images.unsplash.com/photo-1620712943543-bcc4688e7485?w=800&h=450&fit=crop",
        category: "AI & Machine Learning",
        level: "Beginner to Advanced",
        duration: "6 months",
        featured: true,
        published: true,
        publishedAt: new Date("2026-01-10"),
        courses: {
          connect: [{ id: aiCourse.id }],
        },
      },
    });
    console.log("✅ Created learning paths\n");

    // 6. Create blog posts
    console.log("📝 Creating blog posts...");
    const blogPosts = [
      {
        title: "The Rise of AI Agents in 2026: Transforming Business Automation",
        slug: "rise-of-ai-agents-2026",
        excerpt: "Explore how autonomous AI agents are revolutionizing business processes in 2026",
        content: "# The Rise of AI Agents\n\nAI agents are transforming business...",
        coverImage: "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=1200&h=630&fit=crop",
        published: true,
        publishedAt: new Date("2026-01-15"),
        author: "Dr. Sarah Chen",
        category: "AI & Machine Learning",
        tags: ["AI Agents", "Automation", "2026 Trends"],
        featured: true,
        readingTime: 5,
        views: 2341,
        ratingAvg: 4.8,
        ratingCount: 42,
      },
      {
        title: "Quantum Computing Breakthrough in 2026",
        slug: "quantum-computing-breakthrough-2026",
        excerpt: "IBM achieves quantum supremacy with 1000-qubit processor",
        content: "# Quantum Computing Breakthrough\n\nThe quantum revolution is here...",
        coverImage: "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=1200&h=630&fit=crop",
        published: true,
        publishedAt: new Date("2026-01-20"),
        author: "Prof. Michael Kumar",
        category: "Computer Science",
        tags: ["Quantum", "IBM", "Technology"],
        featured: true,
        readingTime: 4,
        views: 1823,
        ratingAvg: 4.9,
        ratingCount: 38,
      },
    ];

    for (const postData of blogPosts) {
      const post = await prisma.blogPost.create({
        data: {
          ...postData,
          createdAt: new Date("2026-01-01"),
          updatedAt: new Date("2026-02-10"),
        },
      });

      // Add images to blog posts
      await prisma.blogImage.create({
        data: {
          postId: post.id,
          url: "https://images.unsplash.com/photo-1531297484001-80022131f5a1?w=800&h=600&fit=crop",
          alt: "Blog post image",
          caption: "Illustration for the article",
          sortOrder: 0,
        },
      });
    }
    console.log("✅ Created blog posts with images\n");

    // 7. Create sample reviews
    console.log("⭐ Creating sample reviews...");
    for (const post of await prisma.blogPost.findMany()) {
      for (let i = 0; i < 3; i++) {
        const randomUser = users[Math.floor(Math.random() * users.length)];
        await prisma.blogReview.create({
          data: {
            postId: post.id,
            userId: randomUser.id,
            rating: Math.floor(Math.random() * 2) + 4, // 4-5 stars
            comment: "Great article! Very informative and well-written.",
          },
        });
      }
    }
    console.log("✅ Created sample reviews\n");

    // 8. Create sample enrollments
    console.log("🎓 Creating sample enrollments...");
    for (const user of users) {
      await prisma.enrollment.create({
        data: {
          userId: user.id,
          courseId: aiCourse.id,
          enrolledAt: new Date("2026-01-20"),
          progress: 0,
        },
      });
    }
    console.log("✅ Created sample enrollments\n");

    console.log("🎉 All 2026 data seeded successfully!");
    console.log("\n📊 Summary:");
    console.log(`   - Users: ${users.length + 1}`);
    console.log(`   - Categories: ${categories.length}`);
    console.log(`   - Courses: 1 (with lessons)`);
    console.log(`   - Learning Paths: 1`);
    console.log(`   - Blog Posts: ${blogPosts.length}`);
    console.log(`   - Reviews: Created for all posts`);
    console.log("\n🔑 Login Credentials:");
    console.log("   Admin: admin@aigeniuslab.com / admin123");
    console.log("   User: john.doe@example.com / password123");
    console.log("\n📝 Next Steps:");
    console.log("   1. Visit /admin to manage content");
    console.log("   2. Check /courses to see published courses");
    console.log("   3. Browse /blog for articles");
    console.log("   4. Test all admin features");

  } catch (error) {
    console.error("❌ Error seeding data:", error);
    throw error;
  }
}

// Run the seed function
seedAll2026()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
