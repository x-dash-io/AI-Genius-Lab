import { PrismaClient } from "@prisma/client";
import { hash } from "bcryptjs";

const prisma = new PrismaClient();

// 2026-focused course data
const courses2026 = [
  {
    title: "AI Agents & Autonomous Systems 2026",
    slug: "ai-agents-autonomous-systems-2026",
    description: "Master the latest in AI agent development, from LangChain to AutoGPT, and build production-ready autonomous systems.",
    priceCents: 19999, // $199.99
    category: "AI & Machine Learning",
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
    inventory: null,
    rating: 4.8,
    reviewCount: 234,
    enrollmentCount: 1523,
  },
  {
    title: "Quantum Computing Fundamentals 2026",
    slug: "quantum-computing-fundamentals-2026",
    description: "Demystify quantum computing in 2026. Learn quantum algorithms, Qiskit, and real-world quantum applications.",
    priceCents: 24999, // $249.99
    category: "Computer Science",
    level: "Intermediate",
    duration: "10 weeks",
    published: true,
    publishedAt: new Date("2026-01-20"),
    thumbnail: "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=800&h=450&fit=crop",
    instructor: "Prof. Michael Kumar",
    instructorBio: "Quantum Physicist & Educator, MIT",
    instructorAvatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face",
    prerequisites: ["Linear algebra", "Basic physics", "Programming experience"],
    learningOutcomes: [
      "Understand quantum mechanics basics",
      "Write quantum algorithms",
      "Use IBM Quantum and Qiskit",
      "Apply quantum computing to real problems"
    ],
    tags: ["Quantum", "Qiskit", "IBM Quantum", "Algorithms", "2026"],
    featured: true,
    inventory: null,
    rating: 4.9,
    reviewCount: 189,
    enrollmentCount: 892,
  },
  {
    title: "Web3 & DeFi Development Masterclass 2026",
    slug: "web3-defi-development-masterclass-2026",
    description: "Build the future of finance. Learn Solidity, smart contracts, DeFi protocols, and create your own DApps in 2026.",
    priceCents: 22999, // $229.99
    category: "Blockchain",
    level: "Intermediate",
    duration: "14 weeks",
    published: true,
    publishedAt: new Date("2026-01-25"),
    thumbnail: "https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=800&h=450&fit=crop",
    instructor: "Alex Rivera",
    instructorBio: "Blockchain Architect, ex-Consensys",
    instructorAvatar: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&h=150&fit=crop&crop=face",
    prerequisites: ["JavaScript/TypeScript", "React basics", "Blockchain fundamentals"],
    learningOutcomes: [
      "Master Solidity programming",
      "Build and deploy smart contracts",
      "Create DeFi protocols",
      "Develop full-stack DApps"
    ],
    tags: ["Web3", "DeFi", "Solidity", "Ethereum", "2026"],
    featured: true,
    inventory: null,
    rating: 4.7,
    reviewCount: 312,
    enrollmentCount: 2103,
  },
  {
    title: "Next.js 15 & React 19 Full Stack 2026",
    slug: "nextjs-15-react-19-full-stack-2026",
    description: "Build modern web apps with the latest Next.js 15 and React 19. Includes Server Components, App Router, and full-stack deployment.",
    priceCents: 17999, // $179.99
    category: "Web Development",
    level: "Intermediate",
    duration: "8 weeks",
    published: true,
    publishedAt: new Date("2026-02-01"),
    thumbnail: "https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=800&h=450&fit=crop",
    instructor: "Emma Thompson",
    instructorBio: "Senior Frontend Engineer at Vercel",
    instructorAvatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face",
    prerequisites: ["React fundamentals", "JavaScript/TypeScript", "Basic backend concepts"],
    learningOutcomes: [
      "Master Next.js 15 App Router",
      "Implement Server Components",
      "Build full-stack applications",
      "Deploy to production"
    ],
    tags: ["Next.js", "React", "Full Stack", "TypeScript", "2026"],
    featured: false,
    inventory: null,
    rating: 4.9,
    reviewCount: 567,
    enrollmentCount: 3421,
  },
  {
    title: "MLOps: Production Machine Learning 2026",
    slug: "mlops-production-machine-learning-2026",
    description: "Deploy and manage ML models at scale. Learn Docker, Kubernetes, MLflow, and modern MLOps practices for 2026.",
    priceCents: 21999, // $219.99
    category: "DevOps",
    level: "Advanced",
    duration: "12 weeks",
    published: true,
    publishedAt: new Date("2026-02-05"),
    thumbnail: "https://images.unsplash.com/photo-1667372393119-3d4c48d07fc9?w=800&h=450&fit=crop",
    instructor: "Dr. James Liu",
    instructorBio: "ML Engineering Lead at Google",
    instructorAvatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face",
    prerequisites: ["Python", "Machine Learning", "Docker basics"],
    learningOutcomes: [
      "Build ML pipelines",
      "Deploy models with Kubernetes",
      "Monitor ML systems",
      "Implement CI/CD for ML"
    ],
    tags: ["MLOps", "Kubernetes", "Docker", "MLflow", "2026"],
    featured: false,
    inventory: null,
    rating: 4.6,
    reviewCount: 145,
    enrollmentCount: 743,
  },
];

const lessonContent = {
  "ai-agents-autonomous-systems-2026": [
    {
      title: "Introduction to AI Agents",
      description: "Understanding the fundamentals of AI agents and their architecture",
      type: "video",
      duration: 45,
      order: 1,
      content: {
        videoUrl: "https://example.com/video1",
        transcript: "Welcome to the world of AI agents...",
        resources: [
          { type: "pdf", name: "Agent Architecture Guide", url: "https://example.com/guide.pdf" },
          { type: "link", name: "LangChain Documentation", url: "https://docs.langchain.com" }
        ]
      }
    },
    {
      title: "Building Your First Agent",
      description: "Create a simple AI agent using LangChain",
      type: "video",
      duration: 60,
      order: 2,
      content: {
        videoUrl: "https://example.com/video2",
        transcript: "Let's build our first agent...",
        code: "from langchain.agents import initialize_agent\nfrom langchain.llms import OpenAI",
        resources: []
      }
    },
    {
      title: "Agent Memory Systems",
      description: "Implement short-term and long-term memory for agents",
      type: "video",
      duration: 55,
      order: 3,
      content: {
        videoUrl: "https://example.com/video3",
        transcript: "Memory is crucial for agents...",
        resources: [
          { type: "github", name: "Memory Examples", url: "https://github.com/example/memory" }
        ]
      }
    }
  ],
  "quantum-computing-fundamentals-2026": [
    {
      title: "Quantum Mechanics Basics",
      description: "Understanding qubits, superposition, and entanglement",
      type: "video",
      duration: 50,
      order: 1,
      content: {
        videoUrl: "https://example.com/quantum1",
        transcript: "Quantum computing begins with quantum mechanics...",
        resources: [
          { type: "pdf", name: "Quantum Mechanics Cheat Sheet", url: "https://example.com/quantum.pdf" }
        ]
      }
    },
    {
      title: "Quantum Gates and Circuits",
      description: "Learn fundamental quantum gates and circuit design",
      type: "interactive",
      duration: 40,
      order: 2,
      content: {
        simulatorUrl: "https://example.com/quantum-sim",
        instructions: "Build your first quantum circuit...",
        resources: []
      }
    }
  ],
  "web3-defi-development-masterclass-2026": [
    {
      title: "Blockchain Fundamentals",
      description: "Understanding distributed ledgers and consensus",
      type: "video",
      duration: 45,
      order: 1,
      content: {
        videoUrl: "https://example.com/web3-1",
        transcript: "Blockchain technology revolutionized...",
        resources: [
          { type: "link", name: "Ethereum Whitepaper", url: "https://ethereum.org/en/whitepaper/" }
        ]
      }
    },
    {
      title: "Solidity Programming",
      description: "Write smart contracts with Solidity",
      type: "coding",
      duration: 90,
      order: 2,
      content: {
        codeTemplate: "pragma solidity ^0.8.0;\n\ncontract MyContract {",
        exercises: [
          "Create a simple storage contract",
          "Implement a voting system"
        ],
        resources: []
      }
    }
  ],
  "nextjs-15-react-19-full-stack-2026": [
    {
      title: "Next.js 15 App Router Deep Dive",
      description: "Master the new App Router architecture",
      type: "video",
      duration: 60,
      order: 1,
      content: {
        videoUrl: "https://example.com/nextjs15-1",
        transcript: "The App Router changes everything...",
        resources: [
          { type: "link", name: "Next.js 15 Docs", url: "https://nextjs.org/docs" }
        ]
      }
    },
    {
      title: "Server Components in Practice",
      description: "Build with Server and Client Components",
      type: "coding",
      duration: 75,
      order: 2,
      content: {
        codeTemplate: "export default async function ServerComponent() {",
        exercises: [
          "Convert a client component to server",
          "Fetch data in server components"
        ],
        resources: []
      }
    }
  ],
  "mlops-production-machine-learning-2026": [
    {
      title: "ML Pipeline Architecture",
      description: "Design scalable ML pipelines",
      type: "video",
      duration: 55,
      order: 1,
      content: {
        videoUrl: "https://example.com/mlops-1",
        transcript: "Production ML requires robust pipelines...",
        resources: [
          { type: "pdf", name: "Pipeline Architecture", url: "https://example.com/pipeline.pdf" }
        ]
      }
    },
    {
      title: "Containerizing ML Models",
      description: "Docker and Kubernetes for ML",
      type: "hands-on",
      duration: 80,
      order: 2,
      content: {
        dockerfile: "FROM python:3.9-slim\n\nWORKDIR /app",
        k8sConfig: "apiVersion: apps/v1\nkind: Deployment",
        resources: []
      }
    }
  ]
};

async function seed2026Data() {
  console.log("🌱 Seeding 2026 course data...");

  try {
    // Create categories if they don't exist
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

    // Create courses
    for (const courseData of courses2026) {
      const category = categories.find(c => c.name === courseData.category);
      
      const course = await prisma.course.upsert({
        where: { slug: courseData.slug },
        update: {
          title: courseData.title,
          description: courseData.description,
          priceCents: courseData.priceCents,
          level: courseData.level,
          duration: courseData.duration,
          published: courseData.published,
          publishedAt: courseData.publishedAt,
          thumbnail: courseData.thumbnail,
          instructor: courseData.instructor,
          instructorBio: courseData.instructorBio,
          instructorAvatar: courseData.instructorAvatar,
          prerequisites: courseData.prerequisites,
          learningOutcomes: courseData.learningOutcomes,
          tags: courseData.tags,
          featured: courseData.featured,
          inventory: courseData.inventory,
          categoryId: category?.id,
          updatedAt: new Date(),
        },
        create: {
          title: courseData.title,
          slug: courseData.slug,
          description: courseData.description,
          priceCents: courseData.priceCents,
          level: courseData.level,
          duration: courseData.duration,
          published: courseData.published,
          publishedAt: courseData.publishedAt,
          thumbnail: courseData.thumbnail,
          instructor: courseData.instructor,
          instructorBio: courseData.instructorBio,
          instructorAvatar: courseData.instructorAvatar,
          prerequisites: courseData.prerequisites,
          learningOutcomes: courseData.learningOutcomes,
          tags: courseData.tags,
          featured: courseData.featured,
          inventory: courseData.inventory,
          categoryId: category?.id,
          createdAt: new Date("2026-01-01"),
          updatedAt: new Date(),
        },
      });

      // Create lessons and content
      const courseLessons = lessonContent[courseData.slug] || [];
      
      for (const lessonData of courseLessons) {
        const lesson = await prisma.lesson.create({
          data: {
            courseId: course.id,
            title: lessonData.title,
            description: lessonData.description,
            type: lessonData.type,
            duration: lessonData.duration,
            order: lessonData.order,
            isPublished: true,
            isPreview: lessonData.order === 1, // First lesson is preview
          },
        });

        // Create lesson content
        if (lessonData.content.videoUrl) {
          await prisma.lessonContent.create({
            data: {
              lessonId: lesson.id,
              type: "video",
              videoUrl: lessonData.content.videoUrl,
              transcript: lessonData.content.transcript,
              order: 1,
            },
          });
        }

        if (lessonData.content.code) {
          await prisma.lessonContent.create({
            data: {
              lessonId: lesson.id,
              type: "code",
              code: lessonData.content.code,
              order: 2,
            },
          });
        }

        if (lessonData.content.resources && lessonData.content.resources.length > 0) {
          for (const [index, resource] of lessonData.content.resources.entries()) {
            await prisma.lessonContent.create({
              data: {
                lessonId: lesson.id,
                type: "resource",
                resourceUrl: resource.url,
                resourceType: resource.type,
                title: resource.name,
                order: 3 + index,
              },
            });
          }
        }

        // Create quiz for each lesson
        await prisma.quiz.create({
          data: {
            lessonId: lesson.id,
            title: `${lessonData.title} - Quiz`,
            description: `Test your knowledge of ${lessonData.title}`,
            passingScore: 70,
            timeLimit: 600, // 10 minutes
            questions: {
              create: [
                {
                  question: "What did you learn from this lesson?",
                  type: "multiple_choice",
                  options: JSON.stringify(["Option A", "Option B", "Option C", "Option D"]),
                  correctAnswer: "Option A",
                  explanation: "This is the correct answer because...",
                  points: 10,
                  order: 1,
                },
                {
                  question: "How would you apply this knowledge?",
                  type: "true_false",
                  options: JSON.stringify(["True", "False"]),
                  correctAnswer: "True",
                  explanation: "Applying knowledge is key to learning",
                  points: 10,
                  order: 2,
                },
              ],
            },
          },
        });
      }
    }

    // Create learning paths
    const aiPath = await prisma.learningPath.create({
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
          connect: [
            { slug: "ai-agents-autonomous-systems-2026" },
            { slug: "mlops-production-machine-learning-2026" },
          ],
        },
      },
    });

    const webDevPath = await prisma.learningPath.create({
      data: {
        title: "Full Stack Developer Path 2026",
        slug: "full-stack-developer-path-2026",
        description: "Master modern full stack development with cutting-edge technologies",
        image: "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=800&h=450&fit=crop",
        category: "Web Development",
        level: "Beginner to Advanced",
        duration: "5 months",
        featured: true,
        published: true,
        publishedAt: new Date("2026-01-12"),
        courses: {
          connect: [
            { slug: "nextjs-15-react-19-full-stack-2026" },
            { slug: "web3-defi-development-masterclass-2026" },
          ],
        },
      },
    });

    console.log("✅ 2026 data seeded successfully!");
    console.log(`   - Created ${courses2026.length} courses`);
    console.log("   - Created lessons and content for each course");
    console.log("   - Created 2 learning paths");
    console.log("   - All content is manageable through the admin panel");

  } catch (error) {
    console.error("❌ Error seeding 2026 data:", error);
    throw error;
  }
}

// Run the seed function
seed2026Data()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
