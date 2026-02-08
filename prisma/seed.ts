import { PrismaClient, SubscriptionTier, CourseTier } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

const connectionString = process.env.DATABASE_URL;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
    console.log("🌱 Starting Database Seed...");

    // 1. Clean Database (Delete in order to avoid FK constraints)
    console.log("Cleaning database...");
    await prisma.review.deleteMany();
    await prisma.lessonContent.deleteMany();
    await prisma.progress.deleteMany();
    await prisma.lesson.deleteMany();
    await prisma.section.deleteMany();
    await prisma.enrollment.deleteMany();
    await prisma.purchase.deleteMany();
    await prisma.payment.deleteMany();
    await prisma.subscriptionPayment.deleteMany();
    await prisma.subscription.deleteMany();
    await prisma.subscriptionPlan.deleteMany();
    await prisma.learningPathCourse.deleteMany();
    await prisma.certificate.deleteMany();
    await prisma.course.deleteMany();
    await prisma.learningPath.deleteMany();
    await prisma.category.deleteMany();
    // We keep Users for now to avoid locking ourselves out, or we can wipe them too if strictly requested. 
    // User said "reset... no crucial data", so let's wipe users just to be clean, but maybe keep one admin if we can?
    // Actually, "reset" usually means wipe. I'll wipe users too.
    await prisma.account.deleteMany();
    await prisma.session.deleteMany();
    await prisma.user.deleteMany();


    // 2. Seed Subscription Plans
    console.log("Seeding Plans...");
    const plans = [
        {
            id: "plan_starter",
            name: "Starter",
            description: "Access to Free Courses.",
            tier: SubscriptionTier.starter,
            priceMonthlyCents: 0,
            priceAnnualCents: 0,
            isActive: true,
        },
        {
            id: "plan_professional",
            name: "Professional",
            description: "Access to Master AI Tools, Build AI Apps & Agents.",
            tier: SubscriptionTier.professional,
            priceMonthlyCents: 1900, // $19
            priceAnnualCents: 19000, // $190
            isActive: true,
        },
        {
            id: "plan_founder",
            name: "Founder",
            description: "Access to All Content + Traffic, Viral Content & Business Strategies.",
            tier: SubscriptionTier.founder,
            priceMonthlyCents: 4900, // $49
            priceAnnualCents: 49000, // $490
            isActive: true,
        },
    ];

    for (const plan of plans) {
        await prisma.subscriptionPlan.create({ data: plan });
    }

    // 3. Seed Categories
    console.log("Seeding Categories...");
    const categories = [
        // Starter / Free
        { name: "Free Courses", slug: "free-courses", icon: "Gift", color: "blue" },

        // Professional
        { name: "Master AI Tools", slug: "master-ai-tools", icon: "Wrench", color: "indigo" },
        { name: "Build AI Apps and Agents", slug: "build-ai-apps", icon: "Cpu", color: "violet" },

        // Founder
        { name: "Get Traffic with AI", slug: "get-traffic-with-ai", icon: "BarChart", color: "emerald" },
        { name: "Create Viral AI Content", slug: "create-viral-ai-content", icon: "Video", color: "rose" },
        { name: "Start an AI Business", slug: "start-an-ai-business", icon: "Briefcase", color: "amber" },
    ];

    const categoryMap = new Map();
    for (const cat of categories) {
        const created = await prisma.category.create({
            data: {
                id: cat.slug,
                ...cat,
                description: `${cat.name} Category`
            }
        });
        categoryMap.set(cat.slug, created.id);
    }

    // 4. Seed Sample Courses (linked to categories)
    console.log("Seeding Sample Courses...");

    const sampleCourses = [
        // Free
        { title: "AI Basics for Beginners", slug: "ai-basics", categorySlug: "free-courses", price: 0, tier: CourseTier.STANDARD },

        // Professional
        { title: "Mastering ChatGPT", slug: "mastering-chatgpt", categorySlug: "master-ai-tools", price: 4900, tier: CourseTier.PREMIUM },
        { title: "Excel AI Automation", slug: "excel-ai", categorySlug: "master-ai-tools", price: 4900, tier: CourseTier.PREMIUM },
        { title: "Build Your First AI Agent", slug: "first-ai-agent", categorySlug: "build-ai-apps", price: 9900, tier: CourseTier.PREMIUM },
        { title: "Chatbot Development 101", slug: "chatbot-101", categorySlug: "build-ai-apps", price: 9900, tier: CourseTier.PREMIUM },

        // Founder
        { title: "YouTube Growth with AI", slug: "youtube-growth-ai", categorySlug: "get-traffic-with-ai", price: 14900, tier: CourseTier.PREMIUM },
        { title: "TikTok Faceless Channels", slug: "tiktok-faceless", categorySlug: "get-traffic-with-ai", price: 14900, tier: CourseTier.PREMIUM },
        { title: "SEO Domination with AI", slug: "seo-domination", categorySlug: "create-viral-ai-content", price: 19900, tier: CourseTier.PREMIUM },
        { title: "Launch Your AI Agency", slug: "launch-ai-agency", categorySlug: "start-an-ai-business", price: 29900, tier: CourseTier.PREMIUM },
    ];

    for (const course of sampleCourses) {
        await prisma.course.create({
            data: {
                id: `course_${course.slug}`,
                title: course.title,
                slug: course.slug,
                description: `Learn everything about ${course.title} in this comprehensive course.`,
                imageUrl: "https://images.unsplash.com/photo-1620712943543-bcc4688e7485?w=800&q=80", // Generic AI image
                priceCents: course.price,
                tier: course.tier,
                isPublished: true,
                categoryId: categoryMap.get(course.categorySlug),
                updatedAt: new Date(),
            }
        });
    }

    console.log("✅ Database reset and seeded successfully.");
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
