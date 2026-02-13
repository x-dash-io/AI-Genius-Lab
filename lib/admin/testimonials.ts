import { prisma, withRetry } from "@/lib/prisma";
import { requireRole } from "@/lib/access";

export async function getAllTestimonials() {
    await requireRole("admin");

    return withRetry(async () => {
        return prisma.testimonial.findMany({
            orderBy: { createdAt: "desc" },
        });
    });
}

export async function getTestimonialById(id: string) {
    await requireRole("admin");

    return withRetry(async () => {
        return prisma.testimonial.findUnique({
            where: { id },
        });
    });
}
