"use client";

import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { createCoupon, updateCoupon } from "@/app/(admin)/admin/coupons/actions";
import { useRouter } from "next/navigation";
import { toast } from "@/lib/toast";
import { Loader2 } from "lucide-react";
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";

const formSchema = z.object({
    code: z.string().min(3, "Code must be at least 3 characters").max(20).toUpperCase(),
    description: z.string().optional(),
    discountType: z.enum(["PERCENT", "FIXED"]),
    discountAmount: z.coerce.number().min(1, "Amount must be at least 1"),
    minOrderAmount: z.coerce.number().nonnegative().optional(),
    maxDiscountAmount: z.coerce.number().nonnegative().optional(),
    startDate: z.string().refine((val) => !isNaN(Date.parse(val)), {
        message: "Invalid date",
    }),
    endDate: z.string().optional().refine((val) => !val || !isNaN(Date.parse(val)), {
        message: "Invalid date",
    }),
    maxUses: z.coerce.number().positive().optional(),
    isActive: z.boolean().default(true),
});

type CouponFormValues = z.infer<typeof formSchema>;

interface CouponFormProps {
    initialData?: any;
    isEditing?: boolean;
}

export function CouponForm({ initialData, isEditing = false }: CouponFormProps) {
    const router = useRouter();
    const [isSubmitting, setIsSubmitting] = useState(false);

    const {
        register,
        handleSubmit,
        control,
        formState: { errors },
    } = useForm<CouponFormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            code: initialData?.code || "",
            description: initialData?.description || "",
            discountType: initialData?.discountType || "PERCENT",
            discountAmount: initialData?.discountAmount || 0,
            minOrderAmount: initialData?.minOrderAmount || 0,
            maxDiscountAmount: initialData?.maxDiscountAmount || 0,
            startDate: initialData?.startDate
                ? new Date(initialData.startDate).toISOString().split("T")[0]
                : new Date().toISOString().split("T")[0],
            endDate: initialData?.endDate
                ? new Date(initialData.endDate).toISOString().split("T")[0]
                : "",
            maxUses: initialData?.maxUses || 0,
            isActive: initialData?.isActive ?? true,
        },
    });

    async function onSubmit(data: CouponFormValues) {
        setIsSubmitting(true);
        const formData = new FormData();
        Object.entries(data).forEach(([key, value]) => {
            if (value !== undefined && value !== null && value !== "") {
                formData.append(key, value.toString());
            }
        });

        try {
            let result;
            if (isEditing && initialData?.id) {
                result = await updateCoupon(initialData.id, formData);
            } else {
                result = await createCoupon(formData);
            }

            if (result.error) {
                toast({
                    title: "Error",
                    description: result.error,
                    variant: "destructive",
                });
            } else {
                toast({
                    title: "Success",
                    description: `Coupon ${isEditing ? "updated" : "created"} successfully`,
                    variant: "success",
                });
                router.push("/admin/coupons");
                router.refresh();
            }
        } catch (error) {
            toast({
                title: "Error",
                description: "Something went wrong",
                variant: "destructive",
            });
        } finally {
            setIsSubmitting(false);
        }
    }

    return (
        <Card>
            <CardContent className="pt-6">
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <Label htmlFor="code">Coupon Code</Label>
                            <Input
                                id="code"
                                placeholder="SUMMER25"
                                {...register("code")}
                                className="uppercase"
                            />
                            {errors.code && (
                                <p className="text-sm text-destructive">{errors.code.message}</p>
                            )}
                            <p className="text-xs text-muted-foreground">
                                Unique code for customers to enter at checkout.
                            </p>
                        </div>

                        <div className="flex gap-4">
                            <div className="w-1/2 space-y-2">
                                <Label>Type</Label>
                                <Controller
                                    control={control}
                                    name="discountType"
                                    render={({ field }) => (
                                        <Select
                                            onValueChange={field.onChange}
                                            defaultValue={field.value}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select type" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="PERCENT">Percentage (%)</SelectItem>
                                                <SelectItem value="FIXED">Fixed Amount ($)</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    )}
                                />
                            </div>

                            <div className="w-1/2 space-y-2">
                                <Label htmlFor="discountAmount">Amount</Label>
                                <Input
                                    id="discountAmount"
                                    type="number"
                                    {...register("discountAmount")}
                                />
                                {errors.discountAmount && (
                                    <p className="text-sm text-destructive">
                                        {errors.discountAmount.message}
                                    </p>
                                )}
                            </div>
                        </div>

                        <div className="space-y-2 md:col-span-2">
                            <Label htmlFor="description">Description</Label>
                            <Input
                                id="description"
                                placeholder="Summer Sale 2025"
                                {...register("description")}
                            />
                        </div>

                        <div className="flex gap-4 md:col-span-2">
                            <div className="w-1/2 space-y-2">
                                <Label htmlFor="startDate">Start Date</Label>
                                <Input
                                    id="startDate"
                                    type="date"
                                    {...register("startDate")}
                                />
                                {errors.startDate && (
                                    <p className="text-sm text-destructive">
                                        {errors.startDate.message}
                                    </p>
                                )}
                            </div>
                            <div className="w-1/2 space-y-2">
                                <Label htmlFor="endDate">End Date (Optional)</Label>
                                <Input
                                    id="endDate"
                                    type="date"
                                    {...register("endDate")}
                                />
                                {errors.endDate && (
                                    <p className="text-sm text-destructive">
                                        {errors.endDate.message}
                                    </p>
                                )}
                            </div>
                        </div>

                        <div className="flex gap-4 md:col-span-2">
                            <div className="w-1/2 space-y-2">
                                <Label htmlFor="minOrderAmount">Min Order Amount (Cents)</Label>
                                <Input
                                    id="minOrderAmount"
                                    type="number"
                                    placeholder="0"
                                    {...register("minOrderAmount")}
                                />
                                <p className="text-xs text-muted-foreground">Optional minimum cart value</p>
                            </div>
                            <div className="w-1/2 space-y-2">
                                <Label htmlFor="maxDiscountAmount">Max Discount (Cents)</Label>
                                <Input
                                    id="maxDiscountAmount"
                                    type="number"
                                    placeholder="0"
                                    {...register("maxDiscountAmount")}
                                />
                                <p className="text-xs text-muted-foreground">Cap for % discounts</p>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="maxUses">Max Uses</Label>
                            <Input
                                id="maxUses"
                                type="number"
                                placeholder="0 (Unlimited)"
                                {...register("maxUses")}
                            />
                        </div>

                        <div className="flex items-center space-x-2 md:col-span-2 border p-4 rounded-md">
                            <Controller
                                control={control}
                                name="isActive"
                                render={({ field }) => (
                                    <input
                                        type="checkbox"
                                        id="isActive"
                                        checked={field.value}
                                        onChange={field.onChange}
                                        className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                                    />
                                )}
                            />
                            <div className="space-y-1">
                                <Label htmlFor="isActive" className="cursor-pointer">Active</Label>
                                <p className="text-xs text-muted-foreground">
                                    Enable or disable this coupon immediately.
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-end gap-4">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => router.back()}
                        >
                            Cancel
                        </Button>
                        <Button type="submit" disabled={isSubmitting}>
                            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            {isEditing ? "Update Coupon" : "Create Coupon"}
                        </Button>
                    </div>
                </form>
            </CardContent>
        </Card>
    );
}
