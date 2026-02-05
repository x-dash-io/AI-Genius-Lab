import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { CouponForm } from "../CouponForm";

interface EditCouponPageProps {
    params: {
        id: string;
    };
}

async function getCoupon(id: string) {
    const coupon = await prisma.coupon.findUnique({
        where: { id },
    });

    if (!coupon) {
        return null;
    }

    return coupon;
}

export default async function EditCouponPage({ params }: EditCouponPageProps) {
    const coupon = await getCoupon(params.id);

    if (!coupon) {
        notFound();
    }

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-2xl font-bold tracking-tight">Edit Coupon</h2>
                <p className="text-muted-foreground">
                    Modify existing discount code details.
                </p>
            </div>

            <div className="max-w-2xl">
                <CouponForm initialData={coupon} isEditing />
            </div>
        </div>
    );
}
