import { PrismaClient } from "@prisma/client";
import { hash } from "bcryptjs";

const prisma = new PrismaClient();

async function seedSimple() {
  console.log("🌱 Seeding data for current schema...");

  try {
    // 1. Create admin user
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
    ]);

    console.log(`✅ Created ${users.length + 1} users`);

    // 2. Create categories
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
    ]);

    console.log(`✅ Created ${categories.length} categories`);

    // 3. Create courses with current schema
    console.log("📚 Creating courses...");
    const aiCourse = await prisma.course.create({
      data: {
        title: "AI Agents & Autonomous Systems 2026",
        slug: "ai-agents-autonomous-systems-2026",
        description: "Master the latest in AI agent development, from LangChain to AutoGPT, and build production-ready autonomous systems.",
        priceCents: 19999,
        category: "AI & Machine Learning",
        categoryId: categories[0].id,
        isPublished: true,
        inventory: null,
      },
    });

    const web3Course = await prisma.course.create({
      data: {
        title: "Web3 & DeFi Development Masterclass 2026",
        slug: "web3-defi-development-masterclass-2026",
        description: "Build the future of finance. Learn Solidity, smart contracts, DeFi protocols, and create your own DApps in 2026.",
        priceCents: 22999,
        category: "Blockchain",
        categoryId: categories[2].id,
        isPublished: true,
        inventory: null,
      },
    });

    console.log(`✅ Created 2 courses`);

    // 4. Create sections and lessons
    console.log("📖 Creating sections and lessons...");
    
    const aiSection = await prisma.section.create({
      data: {
        title: "Introduction to AI Agents",
        description: "Learn the fundamentals",
        courseId: aiCourse.id,
        order: 1,
        isPublished: true,
      },
    });

    const aiLesson = await prisma.lesson.create({
      data: {
        title: "What is an AI Agent?",
        description: "Understanding AI agent architecture",
        sectionId: aiSection.id,
        order: 1,
        isPublished: true,
        isPreview: true,
      },
    });

    // Create lesson content
    await prisma.lessonContent.create({
      data: {
        lessonId: aiLesson.id,
        type: "video",
        videoUrl: "https://example.com/intro-video.mp4",
        order: 1,
      },
    });

    console.log(`✅ Created sections and lessons`);

    // 5. Create blog posts
    console.log("📝 Creating blog posts...");
    const blogPosts = [
      {
        title: "The Rise of AI Agents in 2026",
        slug: "rise-of-ai-agents-2026",
        excerpt: "Explore how autonomous AI agents are revolutionizing business processes",
        content: "# The Rise of AI Agents\n\nAI agents are transforming business...",
        coverImage: "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=1200&h=630&fit=crop",
        published: true,
        publishedAt: new Date("2026-01-15"),
        author: "Dr. Sarah Chen",
        category: "AI & Machine Learning",
        tags: ["AI Agents", "Automation", "2026"],
        featured: true,
        readingTime: 5,
        ratingAvg: 4.8,
        ratingCount: 42,
      },
      {
        title: "Web3 Adoption in 2026",
        slug: "web3-adoption-2026",
        excerpt: "How blockchain technology is going mainstream",
        content: "# Web3 in 2026\n\nBlockchain adoption is accelerating...",
        coverImage: "https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=1200&h=630&fit=crop",
        published: true,
        publishedAt: new Date("2026-01-20"),
        author: "Alex Rivera",
        category: "Blockchain",
        tags: ["Web3", "Blockchain", "DeFi"],
        featured: false,
        readingTime: 4,
        ratingAvg: 4.6,
        ratingCount: 28,
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

      // Add images
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

    console.log(`✅ Created ${blogPosts.length} blog posts`);

    // 6. Create reviews
    console.log("⭐ Creating reviews...");
    
    // Course reviews
    for (const user of users) {
      await prisma.review.create({
        data: {
          courseId: aiCourse.id,
          userId: user.id,
          rating: 5,
          comment: "Excellent course! Very informative.",
        },
      });
    }

    // Blog reviews
    for (const post of await prisma.blogPost.findMany()) {
      for (let i = 0; i < 3; i++) {
        const randomUser = users[Math.floor(Math.random() * users.length)];
        await prisma.blogReview.create({
          data: {
            postId: post.id,
            userId: randomUser.id,
            rating: Math.floor(Math.random() * 2) + 4, // 4-5 stars
            comment: "Great article! Very informative.",
          },
        });
      }
    }

    console.log(`✅ Created reviews`);

    // 7. Create enrollments
    console.log("🎓 Creating enrollments...");
    for (const user of users) {
      await prisma.enrollment.create({
        data: {
          userId: user.id,
          courseId: aiCourse.id,
          progress: 0,
        },
      });
    }

    console.log(`✅ Created enrollments`);

    console.log("\n🎉 All data seeded successfully!");
    console.log("\n📊 Summary:");
    console.log(`   - Users: ${users.length + 1}`);
    console.log(`   - Categories: ${categories.length}`);
    console.log(`   - Courses: 2`);
    console.log(`   - Blog Posts: ${blogPosts.length}`);
    console.log(`   - Reviews: Created for courses and blog`);
    console.log("\n🔑 Login Credentials:");
    console.log("   Admin: admin@aigeniuslab.com / admin123");
    console.log("   User: john.doe@example.com / password123");

  } catch (error) {
    console.error("❌ Error seeding data:", error);
    throw error;
  }
}

// Run the seed function
seedSimple()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
