
import dotenv from 'dotenv';
import path from 'path';

// Load .env from project root
dotenv.config({ path: path.join(__dirname, '../.env') });

import { prisma } from "../lib/prisma";

async function main() {
    console.log("Starting Prisma debug script with lib/prisma and dotenv...");
    console.log("DATABASE_URL present:", !!process.env.DATABASE_URL);

    try {
        console.log("Testing simple course.findMany()...");
        const result = await prisma.course.findMany({
            where: { isPublished: true },
            take: 1
        });
        console.log("Success! Found", result.length, "courses.");
        if (result.length > 0) {
            console.log("First course:", JSON.stringify(result[0], null, 2));
        }
    } catch (error) {
        console.error("Error in simple course.findMany():", error);
    }

    try {
        console.log("\nTesting course.findMany() with select...");
        const result = await prisma.course.findMany({
            where: { isPublished: true },
            select: {
                id: true,
                title: true,
                category: true,
            },
            take: 1
        });
        console.log("Success with select!");
        if (result.length > 0) {
            console.log("First course (select):", JSON.stringify(result[0], null, 2));
        }
    } catch (error) {
        console.error("Error with select:", error);
    }

    try {
        console.log("\nTesting course.findMany() with include...");
        const result = await prisma.course.findMany({
            include: {
                _count: {
                    select: {
                        sections: true,
                        purchases: true,
                        enrollments: true,
                    }
                }
            },
            take: 1
        });
        console.log("Success with include!");
    } catch (error) {
        console.error("Error with include:", error);
    }

    process.exit(0);
}

main();
