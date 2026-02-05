import { CouponForm } from "../CouponForm";

export default function NewCouponPage() {
    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-2xl font-bold tracking-tight">Create Coupon</h2>
                <p className="text-muted-foreground">
                    Create a new discount code for your customers.
                </p>
            </div>

            <div className="max-w-2xl">
                <CouponForm />
            </div>
        </div>
    );
}
