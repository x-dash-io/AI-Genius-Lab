"use server";

import { prisma, withRetry } from "@/lib/prisma";
import { requireRole } from "@/lib/access";
import { revalidateTag } from "next/cache";

export async function createTestimonial(data: any) {
    try {
        await requireRole("admin");

        const testimonial = await withRetry(async () => {
            return prisma.testimonial.create({
                data: {
                    name: data.name,
                    role: data.role,
                    avatar: data.avatar,
                    rating: parseInt(data.rating) || 5,
                    text: data.text,
                    category: data.category || "all",
                    courseOrPath: data.courseOrPath,
                    date: data.date ? new Date(data.date) : new Date(),
                    featured: !!data.featured,
                },
            });
        });

        revalidateTag("testimonials");
        return { success: true, data: testimonial };
    } catch (error: any) {
        console.error("Failed to create testimonial:", error);
        return { success: false, error: error.message };
    }
}

export async function updateTestimonial(id: string, data: any) {
    try {
        await requireRole("admin");

        const testimonial = await withRetry(async () => {
            return prisma.testimonial.update({
                where: { id },
                data: {
                    name: data.name,
                    role: data.role,
                    avatar: data.avatar,
                    rating: parseInt(data.rating) || 5,
                    text: data.text,
                    category: data.category || "all",
                    courseOrPath: data.courseOrPath,
                    date: data.date ? new Date(data.date) : new Date(),
                    featured: !!data.featured,
                },
            });
        });

        revalidateTag("testimonials");
        return { success: true, data: testimonial };
    } catch (error: any) {
        console.error("Failed to update testimonial:", error);
        return { success: false, error: error.message };
    }
}

export async function deleteTestimonial(id: string) {
    try {
        await requireRole("admin");

        await withRetry(async () => {
            return prisma.testimonial.delete({
                where: { id },
            });
        });

        revalidateTag("testimonials");
        return { success: true };
    } catch (error: any) {
        console.error("Failed to delete testimonial:", error);
        return { success: false, error: error.message };
    }
}

export async function toggleTestimonialFeatured(id: string, featured: boolean) {
    try {
        await requireRole("admin");

        await withRetry(async () => {
            return prisma.testimonial.update({
                where: { id },
                data: { featured },
            });
        });

        revalidateTag("testimonials");
        return { success: true };
    } catch (error: any) {
        console.error("Failed to toggle testimonial featured:", error);
        return { success: false, error: error.message };
    }
}
