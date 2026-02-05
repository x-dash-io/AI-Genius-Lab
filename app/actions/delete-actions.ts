"use server";

import { requireRole } from "@/lib/access";
import { deleteCourse } from "@/lib/admin/courses";
import { deletePost } from "@/lib/admin/blog";
import { revalidatePath } from "next/cache";

export async function deleteCourseAction(courseId: string) {
    await requireRole("admin");
    const result = await deleteCourse(courseId);
    revalidatePath("/admin/courses");
    return result;
}

export async function deleteBlogPostAction(postId: string) {
    await requireRole("admin");
    const result = await deletePost(postId);
    revalidatePath("/admin/blog");
    revalidatePath("/blog");
    return result;
}

export async function deleteSubscriptionPlanAction(id: string) {
    await requireRole("admin");
    const { prisma } = await import("@/lib/prisma");

    const plan = await prisma.subscriptionPlan.findUnique({
        where: { id },
        include: {
            _count: {
                select: { userSubscriptions: true },
            },
        },
    });

    if (!plan) {
        throw new Error("Plan not found");
    }

    if (plan._count.userSubscriptions > 0) {
        throw new Error("Cannot delete a plan with active subscribers. Disable it instead.");
    }

    await prisma.subscriptionPlan.delete({
        where: { id },
    });

    revalidatePath("/admin/subscriptions/plans");
}
