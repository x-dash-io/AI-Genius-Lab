import { Button } from "@/components/ui/button";
import { Plus, Ticket } from "lucide-react";
import Link from "next/link";
import { getCoupons } from "./actions";
import { formatPrice } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";

export default async function CouponsPage() {
    const coupons = await getCoupons();

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div className="space-y-1">
                    <h2 className="text-2xl font-bold tracking-tight">Coupons</h2>
                    <p className="text-muted-foreground">
                        Manage discount codes and promotions
                    </p>
                </div>
                <Link href="/admin/coupons/new">
                    <Button variant="premium" size="lg" className="rounded-xl shadow-lg shadow-primary/20">
                        <Plus className="mr-2 h-5 w-5" />
                        Create Coupon
                    </Button>
                </Link>
            </div>

            <div className="rounded-md border bg-card text-card-foreground shadow-sm">
                <div className="p-0 overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-muted/50 text-muted-foreground font-medium border-b">
                            <tr>
                                <th className="px-4 py-3">Code</th>
                                <th className="px-4 py-3">Discount</th>
                                <th className="px-4 py-3">Status</th>
                                <th className="px-4 py-3">Usage</th>
                                <th className="px-4 py-3">Dates</th>
                                <th className="px-4 py-3 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y">
                            {coupons.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">
                                        No coupons found. Create your first one!
                                    </td>
                                </tr>
                            ) : (
                                coupons.map((coupon) => (
                                    <tr key={coupon.id} className="hover:bg-muted/50 transition-colors">
                                        <td className="px-4 py-3 font-medium">
                                            <div className="flex items-center gap-2">
                                                <Ticket className="h-4 w-4 text-primary" />
                                                {coupon.code}
                                            </div>
                                            {coupon.description && (
                                                <div className="text-xs text-muted-foreground mt-0.5 max-w-[200px] truncate">
                                                    {coupon.description}
                                                </div>
                                            )}
                                        </td>
                                        <td className="px-4 py-3">
                                            <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
                                                {coupon.discountType === "PERCENT"
                                                    ? `${coupon.discountAmount}% OFF`
                                                    : `${formatPrice(coupon.discountAmount)} OFF`}
                                            </Badge>
                                            {coupon.minOrderAmount && (
                                                <div className="text-xs text-muted-foreground mt-1">
                                                    Min: {formatPrice(coupon.minOrderAmount)}
                                                </div>
                                            )}
                                        </td>
                                        <td className="px-4 py-3">
                                            <Badge variant={coupon.isActive ? "default" : "secondary"}>
                                                {coupon.isActive ? "Active" : "Inactive"}
                                            </Badge>
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="text-sm">
                                                {coupon.usedCount}
                                                {coupon.maxUses ? ` / ${coupon.maxUses}` : " uses"}
                                            </div>
                                        </td>
                                        <td className="px-4 py-3 text-muted-foreground">
                                            <div className="flex flex-col gap-0.5 text-xs">
                                                <span>Start: {format(coupon.startDate, "MMM d, yyyy")}</span>
                                                {coupon.endDate && (
                                                    <span>End: {format(coupon.endDate, "MMM d, yyyy")}</span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-4 py-3 text-right">
                                            <Link href={`/admin/coupons/${coupon.id}`}>
                                                <Button variant="ghost" size="sm">
                                                    Edit
                                                </Button>
                                            </Link>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
