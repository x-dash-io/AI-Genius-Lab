import { prisma, withRetry } from "@/lib/prisma";

export type TestimonialCategory = "all" | "courses" | "learning-paths" | "platform";

export interface Testimonial {
    id: string;
    name: string;
    role: string;
    avatar?: string | null;
    rating: number;
    text: string;
    category: string;
    courseOrPath?: string | null;
    date: Date;
    featured: boolean;
}

export async function getFeaturedTestimonials(): Promise<Testimonial[]> {
    return withRetry(async () => {
        return prisma.testimonial.findMany({
            where: { featured: true },
            orderBy: { date: "desc" },
            take: 3,
        });
    });
}

export async function getAllTestimonials(): Promise<Testimonial[]> {
    return withRetry(async () => {
        return prisma.testimonial.findMany({
            orderBy: { date: "desc" },
        });
    });
}
