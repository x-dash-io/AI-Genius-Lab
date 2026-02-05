"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";
import { z } from "zod";

const couponSchema = z.object({
    code: z.string().min(3).max(20).toUpperCase(),
    description: z.string().optional(),
    discountType: z.enum(["PERCENT", "FIXED"]),
    discountAmount: z.coerce.number().min(1),
    minOrderAmount: z.coerce.number().nonnegative().optional().nullable(),
    maxDiscountAmount: z.coerce.number().nonnegative().optional().nullable(),
    startDate: z.coerce.date(),
    endDate: z.coerce.date().optional().nullable(),
    maxUses: z.coerce.number().positive().optional().nullable(),
    isActive: z.boolean().default(true),
});

export async function getCoupons() {
    const user = await getCurrentUser();
    if (!user || user.role !== "admin") {
        throw new Error("Unauthorized");
    }

    return await prisma.coupon.findMany({
        orderBy: { createdAt: "desc" },
    });
}

export async function createCoupon(formData: FormData) {
    const user = await getCurrentUser();
    if (!user || user.role !== "admin") {
        return { error: "Unauthorized" };
    }

    try {
        const rawData = {
            code: formData.get("code"),
            description: formData.get("description"),
            discountType: formData.get("discountType"),
            discountAmount: formData.get("discountAmount"),
            minOrderAmount: formData.get("minOrderAmount") || null,
            maxDiscountAmount: formData.get("maxDiscountAmount") || null,
            startDate: formData.get("startDate"),
            endDate: formData.get("endDate") || null,
            maxUses: formData.get("maxUses") || null,
            isActive: formData.get("isActive") === "true",
        };

        const validatedData = couponSchema.parse(rawData);

        await prisma.coupon.create({
            data: validatedData,
        });

        revalidatePath("/admin/coupons");
        return { success: true };
    } catch (error) {
        if (error instanceof z.ZodError) {
            return { error: error.errors[0].message };
        }
        return { error: "Failed to create coupon. Code might already exist." };
    }
}

export async function updateCoupon(id: string, formData: FormData) {
    const user = await getCurrentUser();
    if (!user || user.role !== "admin") {
        return { error: "Unauthorized" };
    }

    try {
        const rawData = {
            code: formData.get("code"),
            description: formData.get("description"),
            discountType: formData.get("discountType"),
            discountAmount: formData.get("discountAmount"),
            minOrderAmount: formData.get("minOrderAmount") || null,
            maxDiscountAmount: formData.get("maxDiscountAmount") || null,
            startDate: formData.get("startDate"),
            endDate: formData.get("endDate") || null,
            maxUses: formData.get("maxUses") || null,
            isActive: formData.get("isActive") === "true",
        };

        const validatedData = couponSchema.parse(rawData);

        await prisma.coupon.update({
            where: { id },
            data: validatedData,
        });

        revalidatePath("/admin/coupons");
        return { success: true };
    } catch (error) {
        return { error: "Failed to update coupon" };
    }
}

export async function deleteCoupon(id: string) {
    const user = await getCurrentUser();
    if (!user || user.role !== "admin") {
        return { error: "Unauthorized" };
    }

    try {
        await prisma.coupon.delete({
            where: { id },
        });
        revalidatePath("/admin/coupons");
        return { success: true };
    } catch (error) {
        return { error: "Failed to delete coupon" };
    }
}

export async function toggleCouponStatus(id: string, isActive: boolean) {
    const user = await getCurrentUser();
    if (!user || user.role !== "admin") {
        return { error: "Unauthorized" };
    }

    try {
        await prisma.coupon.update({
            where: { id },
            data: { isActive },
        });
        revalidatePath("/admin/coupons");
        return { success: true };
    } catch (error) {
        return { error: "Failed to update status" };
    }
}
